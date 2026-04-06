alter table if exists public.generated_content
  add column if not exists is_favorite boolean not null default false,
  add column if not exists is_helpful boolean;
