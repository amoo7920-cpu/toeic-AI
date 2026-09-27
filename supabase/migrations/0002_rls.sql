create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from profiles
                 where id = auth.uid() and role = 'admin' and status = 'active');
$$;

create or replace function public.is_active() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from profiles
                 where id = auth.uid() and status = 'active');
$$;

create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into profiles (id, email) values (new.id, new.email);
  insert into user_stats (user_id) values (new.id);
  return new;
end $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.guard_profile_update() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is not null and not public.is_admin()
     and (new.role is distinct from old.role or new.status is distinct from old.status) then
    raise exception 'Only admins can change role or status';
  end if;
  return new;
end $$;

create trigger trg_guard_profile
  before update on profiles
  for each row execute function public.guard_profile_update();

alter table profiles          enable row level security;
alter table chapters          enable row level security;
alter table answer_templates  enable row level security;
alter table question_sets     enable row level security;
alter table questions         enable row level security;
alter table generation_jobs   enable row level security;
alter table attempts          enable row level security;
alter table review_schedule   enable row level security;
alter table user_stats        enable row level security;
alter table user_badges       enable row level security;

create policy "profiles: self read"    on profiles for select using (id = auth.uid() or is_admin());
create policy "profiles: self update"  on profiles for update using (id = auth.uid() or is_admin());

create policy "chapters: read"   on chapters         for select using (is_active());
create policy "chapters: admin"  on chapters         for all    using (is_admin()) with check (is_admin());
create policy "templates: read"  on answer_templates for select using (is_active());
create policy "templates: admin" on answer_templates for all    using (is_admin()) with check (is_admin());

create policy "sets: read published" on question_sets for select
  using (is_admin() or (is_active() and status = 'published'));
create policy "sets: admin write" on question_sets for all
  using (is_admin()) with check (is_admin());

create policy "questions: read published" on questions for select
  using (is_admin() or (is_active() and exists (
    select 1 from question_sets s where s.id = set_id and s.status = 'published')));
create policy "questions: admin write" on questions for all
  using (is_admin()) with check (is_admin());

create policy "jobs: admin" on generation_jobs for all using (is_admin()) with check (is_admin());

create policy "attempts: own"      on attempts for all
  using (user_id = auth.uid() and is_active()) with check (user_id = auth.uid() and is_active());
create policy "attempts: admin ro" on attempts for select using (is_admin());

create policy "review: own"   on review_schedule for all
  using (user_id = auth.uid() and is_active()) with check (user_id = auth.uid() and is_active());
create policy "stats: own"    on user_stats for all
  using (user_id = auth.uid() and is_active()) with check (user_id = auth.uid() and is_active());
create policy "stats: admin"  on user_stats for select using (is_admin());
create policy "badges: own"   on user_badges for all
  using (user_id = auth.uid() and is_active()) with check (user_id = auth.uid() and is_active());
create policy "badges: admin" on user_badges for select using (is_admin());
