-- Thesis Forge — Supabase schema.
-- Run this once in the Supabase SQL editor after creating your project.
-- Safe to re-run: all statements are idempotent.

create extension if not exists "uuid-ossp";

create table if not exists public.theses (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null default 'Untitled Thesis',
  data jsonb not null,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists theses_user_id_updated_at_idx
  on public.theses (user_id, updated_at desc);

-- Row Level Security: a user can only see and mutate their own theses.
alter table public.theses enable row level security;

drop policy if exists "theses: select own" on public.theses;
create policy "theses: select own" on public.theses
  for select using (auth.uid() = user_id);

drop policy if exists "theses: insert own" on public.theses;
create policy "theses: insert own" on public.theses
  for insert with check (auth.uid() = user_id);

drop policy if exists "theses: update own" on public.theses;
create policy "theses: update own" on public.theses
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "theses: delete own" on public.theses;
create policy "theses: delete own" on public.theses
  for delete using (auth.uid() = user_id);

-- Auto-update updated_at on any update.
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists touch_theses_updated_at on public.theses;
create trigger touch_theses_updated_at
  before update on public.theses
  for each row execute function public.touch_updated_at();
