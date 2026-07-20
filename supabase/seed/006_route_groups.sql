-- UAT demo seed: route groups.

WITH route_rows AS (
  SELECT *
  FROM (VALUES
    (1, 'Route 01 - Bellville', '{Bellville}'),
    (2, 'Route 02 - Brackenfell', '{Brackenfell}'),
    (3, 'Route 03 - Khayelitsha', '{Khayelitsha}'),
    (4, 'Route 04 - Mitchells Plain', '{"Mitchells Plain"}'),
    (5, 'Route 05 - Parow', '{Parow}'),
    (6, 'Route 06 - Goodwood', '{Goodwood}'),
    (7, 'Route 07 - Delft', '{Delft}'),
    (8, 'Route 08 - Blue Downs', '{"Blue Downs"}'),
    (9, 'Route 09 - Maitland', '{Maitland}'),
    (10, 'Route 10 - Century City', '{"Century City"}')
  ) AS routes(route_no, route_name, areas)
)
SELECT public.uat_demo_upsert(
  'public.route_groups'::regclass,
  jsonb_agg(
    jsonb_build_object(
      'id', '00000000-0000-4000-8006-' || lpad(route_no::text, 12, '0'),
      'platform_id', '00000000-0000-4000-8001-000000000001',
      'route_name', route_name,
      'areas', areas,
      'status', 'Active',
      'seed_tag', 'uat_demo',
      'created_at', now()::text,
      'updated_at', now()::text
    )
  ),
  'id'
)
FROM route_rows;
