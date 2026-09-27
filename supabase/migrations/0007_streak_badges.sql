-- 8-2 스트릭: 문제를 하나라도 풀면 하루 1회 호출해서 연속 학습일을 갱신한다(SM-2와 별개).
create or replace function public.record_study_day() returns void
language plpgsql security definer set search_path = public as $$
declare
  v_user uuid := auth.uid();
  v_last date;
  v_streak int;
  v_best int;
  v_freezes int;
begin
  select last_study_date, streak, best_streak, streak_freezes
    into v_last, v_streak, v_best, v_freezes
    from user_stats where user_id = v_user;

  if v_last is null then
    v_streak := 1;
  elsif v_last = current_date then
    return; -- 오늘 이미 기록됨
  elsif v_last = current_date - 1 then
    v_streak := v_streak + 1;
  elsif v_last = current_date - 2 and v_freezes > 0 then
    -- 하루를 건너뛰었지만 스트릭 보호권으로 이어간다
    v_streak := v_streak + 1;
    v_freezes := v_freezes - 1;
  else
    v_streak := 1;
  end if;

  v_best := greatest(v_best, v_streak);

  update user_stats
    set last_study_date = current_date, streak = v_streak, best_streak = v_best, streak_freezes = v_freezes
    where user_id = v_user;
end $$;

-- 8-3 배지: 조건을 만족하면 부여한다. 획득 조건 중 "새벽형 인간", "템플릿 퀴즈 100%"는
-- 관련 이벤트가 서버에 기록되지 않아 이번 단계에서는 제외했다.
create or replace function public.check_and_award_badges() returns void
language plpgsql security definer set search_path = public as $$
declare
  v_user uuid := auth.uid();
  v_streak int;
  v_mock_count int;
  v_fulltime_count int;
begin
  select streak into v_streak from user_stats where user_id = v_user;
  if v_streak >= 7 then
    insert into user_badges (user_id, badge_code) values (v_user, 'streak_7')
      on conflict (user_id, badge_code) do nothing;
  end if;

  select count(*) into v_mock_count from attempts where user_id = v_user and mode = 'mock';
  if v_mock_count >= 55 then
    insert into user_badges (user_id, badge_code) values (v_user, 'mock_5')
      on conflict (user_id, badge_code) do nothing;
  end if;

  select count(*) into v_fulltime_count
    from attempts a join questions q on q.id = a.question_id
    where a.user_id = v_user and q.no = 11 and a.duration_sec >= 54;
  if v_fulltime_count >= 10 then
    insert into user_badges (user_id, badge_code) values (v_user, 'full_time_q11')
      on conflict (user_id, badge_code) do nothing;
  end if;
end $$;
