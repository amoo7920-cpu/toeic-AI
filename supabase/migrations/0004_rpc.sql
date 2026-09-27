-- Edge Function generate-question-set이 호출하는 RPC. question_sets + questions를 한 트랜잭션으로 INSERT한다.
-- 호출자는 service_role key를 쓰는 Edge Function이므로 RLS는 우회되지만,
-- 삽입 로직을 한 곳에 모아 원자성을 보장하기 위해 별도 함수로 둔다.
create or replace function public.insert_question_set(payload jsonb) returns uuid
language plpgsql security definer set search_path = public as $$
declare
  v_set_id uuid;
  v_topic_key text := payload->>'topicKey';
  v_question jsonb;
begin
  insert into question_sets (
    chapter_id, difficulty, topic_key, content_hash, stimulus, status, source
  ) values (
    (payload->>'chapterId')::smallint,
    (payload->>'difficulty')::q_level,
    v_topic_key,
    md5(payload::text),
    coalesce(payload->'stimulus', '{}'::jsonb),
    case when (payload->>'autoPublish')::boolean then 'published' else 'draft' end,
    coalesce(payload->>'source', 'ai')
  )
  returning id into v_set_id;

  -- Ch2는 문항마다 다른 사진을 쓰므로 image_url/image_credit은 questions 각 행에 저장한다.
  for v_question in select * from jsonb_array_elements(payload->'questions')
  loop
    insert into questions (
      set_id, no, prompt, prep_sec, response_sec, model_answer, key_expressions, rater_notes,
      image_url, image_credit
    ) values (
      v_set_id,
      (v_question->>'no')::smallint,
      v_question->>'prompt',
      (v_question->>'prepSec')::smallint,
      (v_question->>'responseSec')::smallint,
      v_question->'modelAnswer',
      coalesce(array(select jsonb_array_elements_text(v_question->'keyExpressions')), '{}'),
      v_question->>'raterNotes',
      v_question->>'imageUrl',
      v_question->>'imageCredit'
    );
  end loop;

  return v_set_id;
end $$;

-- 출제 알고리즘 (7-3): 복습 예정 → 미응시 공개 문제 → 자기채점 낮은 챕터 순.
create or replace function public.get_next_questions(
  p_mode text, p_chapter smallint default null, p_limit int default 10
) returns setof questions
language plpgsql stable security definer set search_path = public as $$
declare
  v_user uuid := auth.uid();
begin
  if p_mode = 'review' then
    return query
      select q.* from questions q
      join review_schedule r on r.question_id = q.id
      where r.user_id = v_user and r.due_date <= current_date
      order by r.due_date asc
      limit p_limit;
  elsif p_mode = 'mock' then
    return query
      select q.* from questions q
      join question_sets s on s.id = q.set_id
      where s.status = 'published'
      order by s.chapter_id asc, q.no asc
      limit p_limit;
  else
    -- chapter / daily5 / weak: 해당 챕터(또는 최저 점수 챕터)에서 본인이 아직 안 푼 공개 문제
    return query
      with target_chapter as (
        select coalesce(
          p_chapter,
          (select s2.chapter_id
             from attempts a2
             join questions q2 on q2.id = a2.question_id
             join question_sets s2 on s2.id = q2.set_id
             where a2.user_id = v_user
             group by s2.chapter_id
             order by avg(a2.total_score) asc nulls first
             limit 1),
          1
        ) as chapter_id
      )
      select q.* from questions q
      join question_sets s on s.id = q.set_id
      cross join target_chapter tc
      where s.status = 'published'
        and s.chapter_id = tc.chapter_id
        and not exists (
          select 1 from attempts a
          where a.user_id = v_user and a.question_id = q.id
        )
      order by s.created_at desc
      limit p_limit;
  end if;
end $$;

-- 자기채점 결과에 따라 간격 반복 복습 일정을 upsert (8-4 SM-2 단순화)
create or replace function public.schedule_review(p_question_id uuid, p_score smallint) returns void
language plpgsql security definer set search_path = public as $$
declare
  v_user uuid := auth.uid();
  v_days smallint;
begin
  v_days := case p_score
    when 1 then 1 when 2 then 2 when 3 then 3 when 4 then 7 else 14
  end;
  insert into review_schedule (user_id, question_id, due_date, interval_days)
  values (v_user, p_question_id, current_date + v_days, v_days)
  on conflict (user_id, question_id)
  do update set due_date = current_date + v_days, interval_days = v_days;
end $$;

-- XP 지급 (다중 사용자 대비 — 클라이언트가 user_stats.xp를 직접 UPDATE하지 못하게 함)
create or replace function public.award_xp(p_amount int) returns void
language plpgsql security definer set search_path = public as $$
begin
  update user_stats set xp = xp + p_amount where user_id = auth.uid();
end $$;

revoke update (xp) on user_stats from authenticated;
