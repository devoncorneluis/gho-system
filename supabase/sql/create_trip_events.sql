create table if not exists public.trip_events (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null,
  platform_id uuid,
  event_type text not null,
  event_data jsonb not null default '{}'::jsonb,
  created_by uuid,
  created_at timestamptz not null default now()
);

create index if not exists idx_trip_events_tripon public.trip_events(trip_id);
create index if not exists idx_trip_events_platformon public.trip_events(platform_id);
create index if not exists idx_trip_events_createdon public.trip_events(created_at desc);
