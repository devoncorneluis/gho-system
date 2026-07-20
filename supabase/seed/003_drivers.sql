-- UAT demo seed: drivers.

WITH driver_rows AS (
  SELECT
    series AS n,
    (ARRAY[
      'Aisha Jacobs',
      'Thando Mbeki',
      'Ruan Petersen',
      'Nomsa Dlamini',
      'Ethan Williams',
      'Lerato Nkosi',
      'Sipho Maseko',
      'Megan Naidoo'
    ])[series] AS full_name
  FROM generate_series(1, 8) AS series
)
SELECT public.uat_demo_upsert(
  'public.drivers'::regclass,
  jsonb_agg(
    jsonb_build_object(
      'id', '00000000-0000-4000-8003-' || lpad(n::text, 12, '0'),
      'platform_id', '00000000-0000-4000-8001-000000000001',
      'driver_no', 'ACME-DR-' || lpad(n::text, 3, '0'),
      'driver_code', 'DR-CPT-' || lpad(n::text, 3, '0'),
      'full_name', full_name,
      'phone', '+27-82-555-' || lpad((1000 + n)::text, 4, '0'),
      'email', CASE WHEN n = 1 THEN 'driver1@gho.demo' ELSE 'driver' || n || '@gho.demo' END,
      'license_number', 'LIC-CPT-' || lpad(n::text, 4, '0'),
      'pdp_number', 'PDP-CPT-' || lpad(n::text, 4, '0'),
      'assigned_vehicle_id', '00000000-0000-4000-8004-' || lpad(n::text, 12, '0'),
      'assigned_vehicle', 'Vehicle ' || lpad(n::text, 2, '0') || ' - CA ACME ' || lpad(n::text, 3, '0'),
      'status', 'Available',
      'availability_status', CASE WHEN n IN (1, 2, 3) THEN 'On Trip' ELSE 'Available' END,
      'seed_tag', 'uat_demo',
      'created_at', now()::text,
      'updated_at', now()::text
    )
  ),
  'id'
)
FROM driver_rows;
