-- TrustPostcode initial schema (run in Supabase SQL Editor)
create extension if not exists pgcrypto;

create table if not exists public.postcode_verifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  reference text not null unique,
  postcode text not null,
  is_valid boolean,
  lookup_level smallint not null default 1 check (lookup_level between 1 and 3),
  provider text not null default 'NIPOST',
  response_summary jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists postcode_verifications_user_created_idx
  on public.postcode_verifications(user_id, created_at desc);

alter table public.postcode_verifications enable row level security;

create policy "Users can read their own verification records"
  on public.postcode_verifications for select
  to authenticated using (auth.uid() = user_id);

create policy "Users can insert their own verification records"
  on public.postcode_verifications for insert
  to authenticated with check (auth.uid() = user_id);

-- No public access. Do not add anon policies or expose provider API keys here.
