-- Tenant RLS policy artifact for SEC-003.
-- This script is idempotent and safely skips tables that are not present.

CREATE OR REPLACE FUNCTION public.current_platform_id()
RETURNS uuid
LANGUAGE sql
STABLE
AS $$
  SELECT NULLIF(auth.jwt() ->> 'platform_id', '')::uuid;
$$;

DO $$
BEGIN
  IF to_regclass('public.trips') IS NOT NULL THEN
    EXECUTE 'ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY';
    EXECUTE 'ALTER TABLE public.trips FORCE ROW LEVEL SECURITY';
    EXECUTE 'DROP POLICY IF EXISTS trips_tenant_select ON public.trips';
    EXECUTE 'DROP POLICY IF EXISTS trips_tenant_insert ON public.trips';
    EXECUTE 'DROP POLICY IF EXISTS trips_tenant_update ON public.trips';
    EXECUTE 'DROP POLICY IF EXISTS trips_tenant_delete ON public.trips';
    EXECUTE 'CREATE POLICY trips_tenant_select ON public.trips FOR SELECT USING (public.current_platform_id() IS NOT NULL AND platform_id = public.current_platform_id())';
    EXECUTE 'CREATE POLICY trips_tenant_insert ON public.trips FOR INSERT WITH CHECK (public.current_platform_id() IS NOT NULL AND platform_id = public.current_platform_id())';
    EXECUTE 'CREATE POLICY trips_tenant_update ON public.trips FOR UPDATE USING (public.current_platform_id() IS NOT NULL AND platform_id = public.current_platform_id()) WITH CHECK (public.current_platform_id() IS NOT NULL AND platform_id = public.current_platform_id())';
    EXECUTE 'CREATE POLICY trips_tenant_delete ON public.trips FOR DELETE USING (public.current_platform_id() IS NOT NULL AND platform_id = public.current_platform_id())';
  END IF;

  IF to_regclass('public.drivers') IS NOT NULL THEN
    EXECUTE 'ALTER TABLE public.drivers ENABLE ROW LEVEL SECURITY';
    EXECUTE 'ALTER TABLE public.drivers FORCE ROW LEVEL SECURITY';
    EXECUTE 'DROP POLICY IF EXISTS drivers_tenant_select ON public.drivers';
    EXECUTE 'DROP POLICY IF EXISTS drivers_tenant_insert ON public.drivers';
    EXECUTE 'DROP POLICY IF EXISTS drivers_tenant_update ON public.drivers';
    EXECUTE 'DROP POLICY IF EXISTS drivers_tenant_delete ON public.drivers';
    EXECUTE 'CREATE POLICY drivers_tenant_select ON public.drivers FOR SELECT USING (public.current_platform_id() IS NOT NULL AND platform_id = public.current_platform_id())';
    EXECUTE 'CREATE POLICY drivers_tenant_insert ON public.drivers FOR INSERT WITH CHECK (public.current_platform_id() IS NOT NULL AND platform_id = public.current_platform_id())';
    EXECUTE 'CREATE POLICY drivers_tenant_update ON public.drivers FOR UPDATE USING (public.current_platform_id() IS NOT NULL AND platform_id = public.current_platform_id()) WITH CHECK (public.current_platform_id() IS NOT NULL AND platform_id = public.current_platform_id())';
    EXECUTE 'CREATE POLICY drivers_tenant_delete ON public.drivers FOR DELETE USING (public.current_platform_id() IS NOT NULL AND platform_id = public.current_platform_id())';
  END IF;

  IF to_regclass('public.vehicles') IS NOT NULL THEN
    EXECUTE 'ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY';
    EXECUTE 'ALTER TABLE public.vehicles FORCE ROW LEVEL SECURITY';
    EXECUTE 'DROP POLICY IF EXISTS vehicles_tenant_select ON public.vehicles';
    EXECUTE 'DROP POLICY IF EXISTS vehicles_tenant_insert ON public.vehicles';
    EXECUTE 'DROP POLICY IF EXISTS vehicles_tenant_update ON public.vehicles';
    EXECUTE 'DROP POLICY IF EXISTS vehicles_tenant_delete ON public.vehicles';
    EXECUTE 'CREATE POLICY vehicles_tenant_select ON public.vehicles FOR SELECT USING (public.current_platform_id() IS NOT NULL AND platform_id = public.current_platform_id())';
    EXECUTE 'CREATE POLICY vehicles_tenant_insert ON public.vehicles FOR INSERT WITH CHECK (public.current_platform_id() IS NOT NULL AND platform_id = public.current_platform_id())';
    EXECUTE 'CREATE POLICY vehicles_tenant_update ON public.vehicles FOR UPDATE USING (public.current_platform_id() IS NOT NULL AND platform_id = public.current_platform_id()) WITH CHECK (public.current_platform_id() IS NOT NULL AND platform_id = public.current_platform_id())';
    EXECUTE 'CREATE POLICY vehicles_tenant_delete ON public.vehicles FOR DELETE USING (public.current_platform_id() IS NOT NULL AND platform_id = public.current_platform_id())';
  END IF;

  IF to_regclass('public.user_profiles') IS NOT NULL THEN
    EXECUTE 'ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY';
    EXECUTE 'ALTER TABLE public.user_profiles FORCE ROW LEVEL SECURITY';
    EXECUTE 'DROP POLICY IF EXISTS user_profiles_tenant_select ON public.user_profiles';
    EXECUTE 'DROP POLICY IF EXISTS user_profiles_tenant_insert ON public.user_profiles';
    EXECUTE 'DROP POLICY IF EXISTS user_profiles_tenant_update ON public.user_profiles';
    EXECUTE 'DROP POLICY IF EXISTS user_profiles_tenant_delete ON public.user_profiles';
    EXECUTE 'CREATE POLICY user_profiles_tenant_select ON public.user_profiles FOR SELECT USING (public.current_platform_id() IS NOT NULL AND platform_id = public.current_platform_id())';
    EXECUTE 'CREATE POLICY user_profiles_tenant_insert ON public.user_profiles FOR INSERT WITH CHECK (public.current_platform_id() IS NOT NULL AND platform_id = public.current_platform_id())';
    EXECUTE 'CREATE POLICY user_profiles_tenant_update ON public.user_profiles FOR UPDATE USING (public.current_platform_id() IS NOT NULL AND platform_id = public.current_platform_id()) WITH CHECK (public.current_platform_id() IS NOT NULL AND platform_id = public.current_platform_id())';
    EXECUTE 'CREATE POLICY user_profiles_tenant_delete ON public.user_profiles FOR DELETE USING (public.current_platform_id() IS NOT NULL AND platform_id = public.current_platform_id())';
  END IF;

  IF to_regclass('public.trip_events') IS NOT NULL THEN
    EXECUTE 'ALTER TABLE public.trip_events ENABLE ROW LEVEL SECURITY';
    EXECUTE 'ALTER TABLE public.trip_events FORCE ROW LEVEL SECURITY';
    EXECUTE 'DROP POLICY IF EXISTS trip_events_tenant_select ON public.trip_events';
    EXECUTE 'DROP POLICY IF EXISTS trip_events_tenant_insert ON public.trip_events';
    EXECUTE 'DROP POLICY IF EXISTS trip_events_tenant_update ON public.trip_events';
    EXECUTE 'DROP POLICY IF EXISTS trip_events_tenant_delete ON public.trip_events';
    EXECUTE 'CREATE POLICY trip_events_tenant_select ON public.trip_events FOR SELECT USING (public.current_platform_id() IS NOT NULL AND platform_id = public.current_platform_id())';
    EXECUTE 'CREATE POLICY trip_events_tenant_insert ON public.trip_events FOR INSERT WITH CHECK (public.current_platform_id() IS NOT NULL AND platform_id = public.current_platform_id())';
    EXECUTE 'CREATE POLICY trip_events_tenant_update ON public.trip_events FOR UPDATE USING (public.current_platform_id() IS NOT NULL AND platform_id = public.current_platform_id()) WITH CHECK (public.current_platform_id() IS NOT NULL AND platform_id = public.current_platform_id())';
    EXECUTE 'CREATE POLICY trip_events_tenant_delete ON public.trip_events FOR DELETE USING (public.current_platform_id() IS NOT NULL AND platform_id = public.current_platform_id())';
  END IF;

  IF to_regclass('public.audit_logs') IS NOT NULL THEN
    EXECUTE 'ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY';
    EXECUTE 'ALTER TABLE public.audit_logs FORCE ROW LEVEL SECURITY';
    EXECUTE 'DROP POLICY IF EXISTS audit_logs_tenant_select ON public.audit_logs';
    EXECUTE 'DROP POLICY IF EXISTS audit_logs_tenant_insert ON public.audit_logs';
    EXECUTE 'DROP POLICY IF EXISTS audit_logs_tenant_update ON public.audit_logs';
    EXECUTE 'DROP POLICY IF EXISTS audit_logs_tenant_delete ON public.audit_logs';
    EXECUTE 'CREATE POLICY audit_logs_tenant_select ON public.audit_logs FOR SELECT USING (public.current_platform_id() IS NOT NULL AND platform_id = public.current_platform_id())';
    EXECUTE 'CREATE POLICY audit_logs_tenant_insert ON public.audit_logs FOR INSERT WITH CHECK (public.current_platform_id() IS NOT NULL AND platform_id = public.current_platform_id())';
    EXECUTE 'CREATE POLICY audit_logs_tenant_update ON public.audit_logs FOR UPDATE USING (public.current_platform_id() IS NOT NULL AND platform_id = public.current_platform_id()) WITH CHECK (public.current_platform_id() IS NOT NULL AND platform_id = public.current_platform_id())';
    EXECUTE 'CREATE POLICY audit_logs_tenant_delete ON public.audit_logs FOR DELETE USING (public.current_platform_id() IS NOT NULL AND platform_id = public.current_platform_id())';
  END IF;

  IF to_regclass('public.emergency_alerts') IS NOT NULL THEN
    EXECUTE 'ALTER TABLE public.emergency_alerts ENABLE ROW LEVEL SECURITY';
    EXECUTE 'ALTER TABLE public.emergency_alerts FORCE ROW LEVEL SECURITY';
    EXECUTE 'DROP POLICY IF EXISTS emergency_alerts_tenant_select ON public.emergency_alerts';
    EXECUTE 'DROP POLICY IF EXISTS emergency_alerts_tenant_insert ON public.emergency_alerts';
    EXECUTE 'DROP POLICY IF EXISTS emergency_alerts_tenant_update ON public.emergency_alerts';
    EXECUTE 'DROP POLICY IF EXISTS emergency_alerts_tenant_delete ON public.emergency_alerts';
    EXECUTE 'CREATE POLICY emergency_alerts_tenant_select ON public.emergency_alerts FOR SELECT USING (public.current_platform_id() IS NOT NULL AND platform_id = public.current_platform_id())';
    EXECUTE 'CREATE POLICY emergency_alerts_tenant_insert ON public.emergency_alerts FOR INSERT WITH CHECK (public.current_platform_id() IS NOT NULL AND platform_id = public.current_platform_id())';
    EXECUTE 'CREATE POLICY emergency_alerts_tenant_update ON public.emergency_alerts FOR UPDATE USING (public.current_platform_id() IS NOT NULL AND platform_id = public.current_platform_id()) WITH CHECK (public.current_platform_id() IS NOT NULL AND platform_id = public.current_platform_id())';
    EXECUTE 'CREATE POLICY emergency_alerts_tenant_delete ON public.emergency_alerts FOR DELETE USING (public.current_platform_id() IS NOT NULL AND platform_id = public.current_platform_id())';
  END IF;

  IF to_regclass('public.trip_passengers') IS NOT NULL THEN
    EXECUTE 'ALTER TABLE public.trip_passengers ENABLE ROW LEVEL SECURITY';
    EXECUTE 'ALTER TABLE public.trip_passengers FORCE ROW LEVEL SECURITY';
    EXECUTE 'DROP POLICY IF EXISTS trip_passengers_tenant_select ON public.trip_passengers';
    EXECUTE 'DROP POLICY IF EXISTS trip_passengers_tenant_insert ON public.trip_passengers';
    EXECUTE 'DROP POLICY IF EXISTS trip_passengers_tenant_update ON public.trip_passengers';
    EXECUTE 'DROP POLICY IF EXISTS trip_passengers_tenant_delete ON public.trip_passengers';
    EXECUTE 'CREATE POLICY trip_passengers_tenant_select ON public.trip_passengers FOR SELECT USING (public.current_platform_id() IS NOT NULL AND platform_id = public.current_platform_id())';
    EXECUTE 'CREATE POLICY trip_passengers_tenant_insert ON public.trip_passengers FOR INSERT WITH CHECK (public.current_platform_id() IS NOT NULL AND platform_id = public.current_platform_id())';
    EXECUTE 'CREATE POLICY trip_passengers_tenant_update ON public.trip_passengers FOR UPDATE USING (public.current_platform_id() IS NOT NULL AND platform_id = public.current_platform_id()) WITH CHECK (public.current_platform_id() IS NOT NULL AND platform_id = public.current_platform_id())';
    EXECUTE 'CREATE POLICY trip_passengers_tenant_delete ON public.trip_passengers FOR DELETE USING (public.current_platform_id() IS NOT NULL AND platform_id = public.current_platform_id())';
  END IF;
END;
$$;