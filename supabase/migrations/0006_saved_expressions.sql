-- 6-4 "표현 저장": key_expressions를 사용자별 단어장에 저장
create table saved_expressions (
  id                 uuid primary key default gen_random_uuid(),
  user_id            uuid not null references profiles on delete cascade,
  expression         text not null,
  source_question_id uuid references questions on delete set null,
  created_at         timestamptz not null default now(),
  unique (user_id, expression)
);

alter table saved_expressions enable row level security;

create policy "saved_expressions: own" on saved_expressions for all
  using (user_id = auth.uid() and is_active()) with check (user_id = auth.uid() and is_active());
