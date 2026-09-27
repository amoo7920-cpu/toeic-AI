-- 0004의 insert_question_set에서 status 컬럼(q_status enum)에 CASE 표현식(text)을
-- 캐스팅 없이 넣어 "column status is of type q_status but expression is of type text"
-- 오류가 났다. CASE 결과를 명시적으로 ::q_status 캐스팅해서 재정의한다.
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
    (case when (payload->>'autoPublish')::boolean then 'published' else 'draft' end)::q_status,
    coalesce(payload->>'source', 'ai')
  )
  returning id into v_set_id;

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
