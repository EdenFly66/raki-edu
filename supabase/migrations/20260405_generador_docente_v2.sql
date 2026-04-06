alter table if exists public.generated_content
  add column if not exists resource_type_id uuid references public.resource_types (id),
  add column if not exists difficulty_id uuid references public.difficulty_levels (id),
  add column if not exists modality_id uuid references public.modalities (id),
  add column if not exists estimated_class_count int;

alter table if exists public.generated_content
  alter column question_count drop not null;

create table if not exists public.generated_content_subjects (
  id uuid primary key default gen_random_uuid(),
  generated_content_id uuid not null references public.generated_content (id) on delete cascade,
  level_subject_id uuid not null references public.level_subjects (id) on delete cascade,
  is_primary boolean not null default false,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create unique index if not exists generated_content_subjects_unique_relation
on public.generated_content_subjects (generated_content_id, level_subject_id);

alter table public.generated_content_subjects enable row level security;

create policy "generated_content_subjects_select_own"
on public.generated_content_subjects
for select
to authenticated
using (
  exists (
    select 1
    from public.generated_content gc
    where gc.id = generated_content_id
      and gc.user_id = auth.uid()
  )
);

create policy "generated_content_subjects_insert_own"
on public.generated_content_subjects
for insert
to authenticated
with check (
  exists (
    select 1
    from public.generated_content gc
    where gc.id = generated_content_id
      and gc.user_id = auth.uid()
  )
);

create table if not exists public.generated_content_learning_objectives (
  id uuid primary key default gen_random_uuid(),
  generated_content_id uuid not null references public.generated_content (id) on delete cascade,
  learning_objective_id uuid not null references public.learning_objectives (id) on delete cascade,
  is_primary boolean not null default false,
  coverage_type text not null default 'secondary',
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create unique index if not exists generated_content_learning_objectives_unique_relation
on public.generated_content_learning_objectives (generated_content_id, learning_objective_id);

alter table public.generated_content_learning_objectives enable row level security;

create policy "generated_content_learning_objectives_select_own"
on public.generated_content_learning_objectives
for select
to authenticated
using (
  exists (
    select 1
    from public.generated_content gc
    where gc.id = generated_content_id
      and gc.user_id = auth.uid()
  )
);

create policy "generated_content_learning_objectives_insert_own"
on public.generated_content_learning_objectives
for insert
to authenticated
with check (
  exists (
    select 1
    from public.generated_content gc
    where gc.id = generated_content_id
      and gc.user_id = auth.uid()
  )
);
