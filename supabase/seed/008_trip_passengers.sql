-- UAT demo seed: 100 passengers assigned across today's trips.

WITH passenger_rows AS (
  SELECT
    agent.n,
    ((agent.n - 1) % 15) + 1 AS trip_no,
    ((agent.n - 1) % 10) + 1 AS route_no
  FROM generate_series(1, 100) AS agent(n)
)
SELECT public.uat_demo_upsert(
  'public.trip_passengers'::regclass,
  jsonb_agg(
    jsonb_build_object(
      'id', '00000000-0000-4000-8008-' || lpad(n::text, 12, '0'),
      'platform_id', '00000000-0000-4000-8001-000000000001',
      'trip_id', '00000000-0000-4000-8007-' || lpad(trip_no::text, 12, '0'),
      'agent_id', '00000000-0000-4000-8005-' || lpad(n::text, 12, '0'),
      'employee_number', 'ACME-AG-' || lpad(n::text, 4, '0'),
      'full_name', 'Acme Agent ' || lpad(n::text, 3, '0'),
      'email', 'agent' || n || '@acme.demo',
      'phone', '+27-83-555-' || lpad((2000 + n)::text, 4, '0'),
      'pickup_area', (ARRAY[
        'Bellville',
        'Brackenfell',
        'Khayelitsha',
        'Mitchells Plain',
        'Parow',
        'Goodwood',
        'Delft',
        'Blue Downs',
        'Maitland',
        'Century City'
      ])[route_no],
      'pickup_address', (ARRAY[
        'Bellville Transport Hub',
        'Brackenfell Station',
        'Khayelitsha Mall',
        'Town Centre Taxi Rank',
        'Parow Centre',
        'N1 City',
        'Delft Main Road',
        'Blue Downs Station',
        'Maitland Station',
        'Canal Walk Entrance'
      ])[route_no] || ', Cape Town',
      'pickup_time', CASE
        WHEN route_no <= 4 THEN '06:' || lpad(((route_no - 1) * 5)::text, 2, '0')
        WHEN route_no <= 8 THEN '14:' || lpad(((route_no - 5) * 5)::text, 2, '0')
        ELSE '22:' || lpad(((route_no - 9) * 5)::text, 2, '0')
      END,
      'pickup_status', 'Pending',
      'seed_tag', 'uat_demo',
      'created_at', now()::text,
      'updated_at', now()::text
    )
  ),
  'id'
)
FROM passenger_rows;
