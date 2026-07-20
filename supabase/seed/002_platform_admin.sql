-- UAT demo seed: role profile placeholders.
-- The TypeScript seed runner creates real Supabase Auth users and rewrites
-- user_profiles with the provider-issued auth user ids.

SELECT public.uat_demo_upsert(
  'public.user_profiles'::regclass,
  jsonb_build_array(
    jsonb_build_object(
      'id', '00000000-0000-4000-8002-000000000001',
      'user_id', '00000000-0000-4000-8002-000000000001',
      'platform_id', '00000000-0000-4000-8001-000000000001',
      'full_name', 'UAT Super Admin',
      'email', 'superadmin@gho.demo',
      'role', 'super_admin',
      'status', 'Active',
      'seed_tag', 'uat_demo',
      'created_at', now()::text,
      'updated_at', now()::text
    ),
    jsonb_build_object(
      'id', '00000000-0000-4000-8002-000000000002',
      'user_id', '00000000-0000-4000-8002-000000000002',
      'platform_id', '00000000-0000-4000-8001-000000000001',
      'full_name', 'Operations Manager',
      'email', 'admin@gho.demo',
      'role', 'admin',
      'status', 'Active',
      'seed_tag', 'uat_demo',
      'created_at', now()::text,
      'updated_at', now()::text
    ),
    jsonb_build_object(
      'id', '00000000-0000-4000-8002-000000000003',
      'user_id', '00000000-0000-4000-8002-000000000003',
      'platform_id', '00000000-0000-4000-8001-000000000001',
      'full_name', 'UAT Driver One',
      'email', 'driver1@gho.demo',
      'role', 'driver',
      'status', 'Active',
      'seed_tag', 'uat_demo',
      'created_at', now()::text,
      'updated_at', now()::text
    ),
    jsonb_build_object(
      'id', '00000000-0000-4000-8002-000000000004',
      'user_id', '00000000-0000-4000-8002-000000000004',
      'platform_id', '00000000-0000-4000-8001-000000000001',
      'full_name', 'UAT Client',
      'email', 'client@gho.demo',
      'role', 'admin',
      'status', 'Active',
      'seed_tag', 'uat_demo',
      'created_at', now()::text,
      'updated_at', now()::text
    ),
    jsonb_build_object(
      'id', '00000000-0000-4000-8002-000000000005',
      'user_id', '00000000-0000-4000-8002-000000000005',
      'platform_id', '00000000-0000-4000-8001-000000000001',
      'full_name', 'UAT Executive',
      'email', 'executive@gho.demo',
      'role', 'admin',
      'status', 'Active',
      'seed_tag', 'uat_demo',
      'created_at', now()::text,
      'updated_at', now()::text
    )
  ),
  'id'
);
