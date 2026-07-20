-- Performance indexes for high-frequency operational queries.
CREATE INDEX IF NOT EXISTS trips_platform_status_date_idx
ON public.trips (platform_id, status, trip_date DESC);

CREATE INDEX IF NOT EXISTS trips_platform_driver_response_idx
ON public.trips (platform_id, driver_response);

CREATE INDEX IF NOT EXISTS driver_locations_tracking_updated_idx
ON public.driver_locations (is_tracking, updated_at DESC);

CREATE INDEX IF NOT EXISTS driver_locations_trip_driver_idx
ON public.driver_locations (trip_id, driver_id);

CREATE INDEX IF NOT EXISTS drivers_platform_availability_idx
ON public.drivers (platform_id, availability_status);

CREATE INDEX IF NOT EXISTS vehicles_platform_status_idx
ON public.vehicles (platform_id, status);

CREATE INDEX IF NOT EXISTS emergency_alerts_platform_status_created_idx
ON public.emergency_alerts (platform_id, status, created_at DESC);

CREATE INDEX IF NOT EXISTS notification_logs_created_idx
ON public.notification_logs (created_at DESC);

CREATE INDEX IF NOT EXISTS trip_passengers_trip_pickup_time_idx
ON public.trip_passengers (trip_id, pickup_time);
