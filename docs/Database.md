# Database

## Current Schema Themes

- Trips and trip passengers drive dispatch and SLA outcomes.
- Driver locations support live map and telemetry freshness checks.
- Emergency alerts support safety workflows.
- Audit logs and trip events support traceability.

## Performance Indexes

High-frequency index script: supabase/sql/create_performance_indexes.sql

Key optimization targets:

- trips by platform_id, status, trip_date
- driver_locations by tracking status and updated_at
- drivers/vehicles by platform_id and status
- emergency_alerts by platform and created_at
- trip_passengers by trip_id and pickup_time

## Data Access Practices

- Select only required columns.
- Filter by platform_id whenever tenant-scoped.
- Order with indexed columns where possible.
- Keep realtime handlers lightweight and debounce expensive refreshes.
