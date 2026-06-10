-- Run this after schema.sql, replacing the placeholders.
-- 1) Create the shared office user in Supabase Auth first.
-- 2) Copy that user's auth.users.id into shared_user_id below.

with shared_office as (
  insert into offices (name, brand_profile)
  values (
    'شركة الدر النفيس للاستشارات الهندسية',
    '{}'::jsonb
  )
  returning id
)
insert into members (office_id, user_id, role)
select
  shared_office.id,
  '00000000-0000-0000-0000-000000000000'::uuid as shared_user_id,
  'owner'
from shared_office;
