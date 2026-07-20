-- UAT demo seed: vehicles.

WITH vehicle_rows AS (
  SELECT
    series AS n,
    (ARRAY[
      'Toyota Quantum',
      'Toyota Quantum',
      'Suzuki Ertiga',
      'Suzuki Ertiga',
      'Hyundai H1',
      'VW Kombi',
      'Toyota Corolla Quest',
      'Nissan NV350'
    ])[series] AS vehicle_type,
    (ARRAY[15, 15, 7, 7, 9, 8, 4, 14])[series] AS passenger_limit,
    (ARRAY['White', 'Silver', 'Blue', 'White', 'Grey', 'Black', 'White', 'Silver'])[series] AS colour
  FROM generate_series(1, 8) AS series
)
SELECT public.uat_demo_upsert(
  'public.vehicles'::regclass,
  jsonb_agg(
    jsonb_build_object(
      'id', '00000000-0000-4000-8004-' || lpad(n::text, 12, '0'),
      'platform_id', '00000000-0000-4000-8001-000000000001',
      'vehicle_code', 'ACME-VH-' || lpad(n::text, 3, '0'),
      'vehicle_name', 'Vehicle ' || lpad(n::text, 2, '0'),
      'registration_number', 'CA ACME ' || lpad(n::text, 3, '0'),
      'vehicle_type', vehicle_type,
      'vehicle_colour', colour,
      'passenger_limit', passenger_limit::text,
      'assigned_driver', '00000000-0000-4000-8003-' || lpad(n::text, 12, '0'),
      'status', CASE WHEN n IN (1, 2, 3) THEN 'On Trip' ELSE 'Available' END,
      'seed_tag', 'uat_demo',
      'created_at', now()::text,
      'updated_at', now()::text
    )
  ),
  'id'
)
FROM vehicle_rows;
