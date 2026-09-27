create type app_role    as enum ('admin', 'user');
create type user_status as enum ('pending', 'active', 'blocked');
create type q_status    as enum ('draft', 'published', 'archived');
create type q_level     as enum ('IH', 'AL', 'AM');
create type job_status  as enum ('running', 'success', 'failed');

create table profiles (
  id            uuid primary key references auth.users on delete cascade,
  email         text not null,
  display_name  text,
  role          app_role    not null default 'user',
  status        user_status not null default 'pending',
  exam_date     date,
  target_grade  text not null default 'AL',
  created_at    timestamptz not null default now()
);

create table chapters (
  id             smallint primary key check (id between 1 and 5),
  code           text unique not null,
  name           text not null,
  question_nos   smallint[] not null,
  prep_secs      smallint[] not null,
  response_secs  smallint[] not null
);

create table answer_templates (
  id          text primary key,
  chapter_id  smallint not null references chapters,
  label       text not null,
  skeleton    text not null,
  slot_keys   text[] not null,
  logic       text not null,
  min_words   smallint,
  max_words   smallint
);

create table question_sets (
  id            uuid primary key default gen_random_uuid(),
  chapter_id    smallint not null references chapters,
  difficulty    q_level not null,
  topic_key     text not null unique,
  content_hash  text not null unique,
  stimulus      jsonb not null,
  status        q_status not null default 'draft',
  source        text not null default 'ai' check (source in ('ai', 'manual')),
  created_by    uuid references profiles,
  created_at    timestamptz not null default now(),
  published_at  timestamptz
);
create index idx_sets_chapter on question_sets (chapter_id, status, created_at desc);

create table questions (
  id               uuid primary key default gen_random_uuid(),
  set_id           uuid not null references question_sets on delete cascade,
  no               smallint not null check (no between 1 and 11),
  prompt           text not null,
  prep_sec         smallint not null,
  response_sec     smallint not null,
  model_answer     jsonb not null,
  key_expressions  text[] not null default '{}',
  rater_notes      text,
  -- Ch2(Q3,Q4)는 문항마다 서로 다른 사진을 쓰므로 이미지는 세트가 아닌 문항 단위로 저장한다.
  image_url        text,
  image_credit     text,
  unique (set_id, no)
);

create table generation_jobs (
  id            uuid primary key default gen_random_uuid(),
  requested_by  uuid not null references profiles,
  chapter_id    smallint not null references chapters,
  difficulty    q_level,
  auto_publish  boolean not null default false,
  status        job_status not null default 'running',
  set_id        uuid references question_sets on delete set null,
  error         text,
  created_at    timestamptz not null default now(),
  finished_at   timestamptz
);

create table attempts (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references profiles on delete cascade,
  question_id   uuid not null references questions on delete cascade,
  mode          text not null check (mode in ('chapter','weak','daily5','mock','review')),
  self_score    jsonb,
  total_score   smallint check (total_score between 1 and 5),
  duration_sec  smallint,
  created_at    timestamptz not null default now()
);
create index idx_attempts_user on attempts (user_id, created_at desc);

create table review_schedule (
  user_id        uuid not null references profiles on delete cascade,
  question_id    uuid not null references questions on delete cascade,
  due_date       date not null,
  interval_days  smallint not null default 1,
  ease           real not null default 2.5,
  primary key (user_id, question_id)
);

create table user_stats (
  user_id          uuid primary key references profiles on delete cascade,
  xp               int not null default 0,
  streak           int not null default 0,
  best_streak      int not null default 0,
  streak_freezes   smallint not null default 1,
  last_study_date  date
);

create table user_badges (
  user_id     uuid not null references profiles on delete cascade,
  badge_code  text not null,
  earned_at   timestamptz not null default now(),
  primary key (user_id, badge_code)
);

create view v_chapter_stats with (security_invoker = true) as
select c.id as chapter_id, c.code, c.name,
       count(s.*) filter (where s.status = 'published') as published,
       count(s.*) filter (where s.status = 'draft')     as draft,
       count(s.*) filter (where s.status = 'archived')  as archived,
       max(s.created_at) as last_added_at
from chapters c
left join question_sets s on s.chapter_id = c.id
group by c.id, c.code, c.name;
