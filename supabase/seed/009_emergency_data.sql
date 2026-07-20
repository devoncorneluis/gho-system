-- UAT demo seed: one active emergency scenario.

SELECT public.uat_demo_upsert(
  'public.emergency_alerts'::regclass,
  jsonb_build_array(
    jsonb_build_object(
      'id', '00000000-0000-4000-8009-000000000001',
      'platform_id', '00000000-0000-4000-8001-000000000001',
      'trip_id', '00000000-0000-4000-8007-000000000001',
      'driver_id', '00000000-0000-4000-8003-000000000001',
      'driver_name', 'Aisha Jacobs',
      'vehicle_id', '00000000-0000-4000-8004-000000000001',
      'vehicle_name', 'Vehicle 01',
      'vehicle_registration', 'CA ACME 001',
      'alert_type', 'SOS',
      'emergency_type', 'Medical',
      'description', 'UAT active emergency scenario for dispatch exception handling.',
      'location', 'N1 outbound near Century City',
      'latitude', '-33.8928',
      'longitude', '18.5056',
      'status', 'Open',
      'assigned_agent', 'Operations Manager',
      'resolution_notes', '',
      'seed_tag', 'uat_demo',
      'created_at', now()::text,
      'updated_at', now()::text
    )
  ),
  'id'
);
