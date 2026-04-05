create extension if not exists pgcrypto;

create table if not exists public.generated_content (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  level_id uuid not null references public.academic_levels (id),
  level_subject_id uuid not null references public.level_subjects (id),
  learning_objective_id uuid not null references public.learning_objectives (id),
  question_count int not null check (question_count > 0),
  content text not null,
  created_at timestamptz not null default now()
);

alter table public.generated_content enable row level security;

create policy "generated_content_select_own"
on public.generated_content
for select
to authenticated
using (auth.uid() = user_id);

create policy "generated_content_insert_own"
on public.generated_content
for insert
to authenticated
with check (auth.uid() = user_id);
