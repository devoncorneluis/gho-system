-- UAT demo seed: 100 Acme Manufacturing agents.

WITH area_rows AS (
  SELECT *
  FROM (VALUES
    (1, 'Bellville', 'Bellville Transport Hub', '06:00 - 15:00'),
    (2, 'Brackenfell', 'Brackenfell Station', '06:00 - 15:00'),
    (3, 'Khayelitsha', 'Khayelitsha Mall', '06:00 - 15:00'),
    (4, 'Mitchells Plain', 'Town Centre Taxi Rank', '06:00 - 15:00'),
    (5, 'Parow', 'Parow Centre', '14:00 - 23:00'),
    (6, 'Goodwood', 'N1 City', '14:00 - 23:00'),
    (7, 'Delft', 'Delft Main Road', '14:00 - 23:00'),
    (8, 'Blue Downs', 'Blue Downs Station', '14:00 - 23:00'),
    (9, 'Maitland', 'Maitland Station', '22:00 - 06:00'),
    (10, 'Century City', 'Canal Walk Entrance', '22:00 - 06:00')
  ) AS areas(route_no, pickup_area, pickup_address, shift)
),
agent_rows AS (
  SELECT
    series AS n,
    area_rows.*
  FROM generate_series(1, 100) AS series
  JOIN area_rows ON area_rows.route_no = ((series - 1) % 10) + 1
)
SELECT public.uat_demo_upsert(
  'public.agents'::regclass,
  jsonb_agg(
    jsonb_build_object(
      'id', '00000000-0000-4000-8005-' || lpad(n::text, 12, '0'),
      'platform_id', '00000000-0000-4000-8001-000000000001',
      'employee_number', 'ACME-AG-' || lpad(n::text, 4, '0'),
      'full_name', 'Acme Agent ' || lpad(n::text, 3, '0'),
      'email', 'agent' || n || '@acme.demo',
      'phone', '+27-83-555-' || lpad((2000 + n)::text, 4, '0'),
      'pickup_area', pickup_area,
      'work_location', 'Acme Manufacturing Plant',
      'pickup_address', pickup_address || ', Cape Town',
      'destination_address', 'Acme Manufacturing Plant, Epping Industria, Cape Town',
      'shift', shift,
      'active', 'true',
      'employee_status', 'Active',
      'seed_tag', 'uat_demo',
      'created_at', now()::text,
      'updated_at', now()::text
    )
  ),
  'id'
)
FROM agent_rows;
