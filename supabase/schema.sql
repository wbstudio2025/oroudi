-- عروضي (Oroudi) — Phase 3 schema for Supabase (Postgres + RLS).
-- Apply with the Supabase SQL editor or `supabase db push` once the project exists.
--
-- Tenancy: office (tenant) → members (auth users) → projects (quotations).
-- The brand profile and each project's quotation data stay as JSONB documents,
-- mirroring the front-end's localStorage shapes 1:1 so the persistence adapter
-- is a thin read/write layer, not a remodeling exercise.

create table offices (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  brand_profile jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table members (
  office_id uuid not null references offices (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  role text not null default 'staff' check (role in ('owner', 'staff')),
  created_at timestamptz not null default now(),
  primary key (office_id, user_id)
);

create table projects (
  id uuid primary key default gen_random_uuid(),
  office_id uuid not null references offices (id) on delete cascade,
  name text not null default '',
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index projects_office_idx on projects (office_id, updated_at desc);

-- Row-level security: a user only sees rows of offices they are a member of.
alter table offices enable row level security;
alter table members enable row level security;
alter table projects enable row level security;

create function is_office_member(target_office uuid)
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from members
    where members.office_id = target_office
      and members.user_id = auth.uid()
  );
$$;

create policy offices_select on offices
  for select using (is_office_member(id));
create policy offices_update on offices
  for update using (is_office_member(id));

create policy members_select on members
  for select using (is_office_member(office_id));

create policy projects_all on projects
  for all using (is_office_member(office_id))
  with check (is_office_member(office_id));

-- Storage: one bucket for office assets (logos, stamps, footer art, QR images),
-- pathed as {office_id}/{asset}.png so policies can key off the prefix.
insert into storage.buckets (id, name, public) values ('office-assets', 'office-assets', false);

create policy office_assets_rw on storage.objects
  for all using (
    bucket_id = 'office-assets'
    and is_office_member((split_part(name, '/', 1))::uuid)
  )
  with check (
    bucket_id = 'office-assets'
    and is_office_member((split_part(name, '/', 1))::uuid)
  );
