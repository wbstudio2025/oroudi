-- عروضي (Oroudi) — self-serve signup: every new auth user gets a PRIVATE office.
--
-- Run this AFTER schema.sql, instead of shared-office-setup.sql.
-- It installs a trigger so that when a user signs up (Authentication ▸ Email),
-- a fresh office row and an owner membership are created automatically. The
-- existing Row-Level Security then isolates each user to their own office —
-- nobody sees anyone else's projects.
--
-- The function is SECURITY DEFINER so it can insert into offices/members even
-- though RLS is enabled and the new user is not yet a member of anything.
--
-- Optional: the signup form may pass an office name in the user's metadata as
-- raw_user_meta_data->>'office_name'; otherwise the office is named "مكتبي"
-- and can be rebranded later from the in-app office settings.

create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  new_office_id uuid;
begin
  insert into offices (name)
  values (coalesce(nullif(new.raw_user_meta_data->>'office_name', ''), 'مكتبي'))
  returning id into new_office_id;

  insert into members (office_id, user_id, role)
  values (new_office_id, new.id, 'owner');

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();
