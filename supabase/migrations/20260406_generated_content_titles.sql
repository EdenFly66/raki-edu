alter table if exists public.generated_content
  add column if not exists title text;
