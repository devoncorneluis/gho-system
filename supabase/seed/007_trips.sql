-- UAT demo seed: today's, completed, and future trips.

WITH base_routes AS (
  SELECT *
  FROM (VALUES
    (1, 'Bellville', '06:00', '07:00', 8),
    (2, 'Brackenfell', '06:15', '07:15', 8),
    (3, 'Khayelitsha', '06:30', '07:30', 10),
    (4, 'Mitchells Plain', '06:45', '07:45', 10),
    (5, 'Parow', '14:00', '15:00', 6),
    (6, 'Goodwood', '14:15', '15:15', 6),
    (7, 'Delft', '14:30', '15:30', 7),
    (8, 'Blue Downs', '14:45', '15:45', 7),
    (9, 'Maitland', '22:00', '23:00', 5),
    (10, 'Century City', '22:15', '23:15', 5)
  ) AS routes(route_no, area, pickup_time, dropoff_time, passenger_count)
),
trip_rows AS (
  SELECT
    series AS n,
    'today' AS bucket,
    current_date AS trip_date,
    CASE
      WHEN series <= 5 THEN 'Dispatched'
      WHEN series <= 10 THEN 'Confirmed'
      ELSE 'Assigned'
    END AS status,
    base_routes.*
  FROM generate_series(1, 15) AS series
  JOIN base_routes ON base_routes.route_no = ((series - 1) % 10) + 1

  UNION ALL

  SELECT
    100 + series AS n,
    'completed' AS bucket,
    current_date - ((series % 5) + 1) AS trip_date,
    'Completed' AS status,
    base_routes.*
  FROM generate_series(1, 20) AS series
  JOIN base_routes ON base_routes.route_no = ((series - 1) % 10) + 1

  UNION ALL

  SELECT
    200 + series AS n,
    'future' AS bucket,
    current_date + ((series % 4) + 1) AS trip_date,
    'Planned' AS status,
    base_routes.*
  FROM generate_series(1, 10) AS series
  JOIN base_routes ON base_routes.route_no = ((series - 1) % 10) + 1
)
SELECT public.uat_demo_upsert(
  'public.trips'::regclass,
  jsonb_agg(
    jsonb_build_object(
      'id', '00000000-0000-4000-8007-' || lpad(n::text, 12, '0'),
      'platform_id', '00000000-0000-4000-8001-000000000001',
      'route_group_id', '00000000-0000-4000-8006-' || lpad(route_no::text, 12, '0'),
      'trip_code', 'ACME-' || upper(bucket) || '-' || lpad(n::text, 4, '0'),
      'trip_date', trip_date::text,
      'shift', CASE
        WHEN pickup_time < '12:00' THEN 'Morning'
        WHEN pickup_time < '20:00' THEN 'Afternoon'
        ELSE 'Night'
      END,
      'area', area,
      'pickup_time', pickup_time,
      'dropoff_time', dropoff_time,
      'vehicle_type', CASE WHEN route_no IN (1, 2, 3, 4) THEN 'Toyota Quantum' ELSE 'Suzuki Ertiga' END,
      'passenger_count', passenger_count,
      'driver_id', '00000000-0000-4000-8003-' || lpad((((n - 1) % 8) + 1)::text, 12, '0'),
      'driver_name', (ARRAY[
        'Aisha Jacobs',
        'Thando Mbeki',
        'Ruan Petersen',
        'Nomsa Dlamini',
        'Ethan Williams',
        'Lerato Nkosi',
        'Sipho Maseko',
        'Megan Naidoo'
      ])[((n - 1) % 8) + 1],
      'vehicle_id', '00000000-0000-4000-8004-' || lpad((((n - 1) % 8) + 1)::text, 12, '0'),
      'vehicle_name', 'Vehicle ' || lpad((((n - 1) % 8) + 1)::text, 2, '0'),
      'vehicle_registration', 'CA ACME ' || lpad((((n - 1) % 8) + 1)::text, 3, '0'),
      'estimated_km', 18 + route_no,
      'driver_response', CASE WHEN status IN ('Dispatched', 'Completed') THEN 'Accepted' ELSE 'Pending' END,
      'status', status,
      'seed_tag', 'uat_demo',
      'created_at', now()::text,
      'updated_at', now()::text
    )
  ),
  'id'
)
FROM trip_rows;
