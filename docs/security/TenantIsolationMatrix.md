# Tenant Isolation Matrix

Status vocabulary source: [../StatusVocabulary.md](../StatusVocabulary.md)

Status legend:

- Complete: Clear platform/tenant enforcement evidence.
- At Risk: Some enforcement present, but inconsistent across read/write paths.
- Blocked: No clear enforcement evidence in reviewed paths.

| Table | Tenant Key | Enforcement | Status | Evidence |
| --- | --- | --- | --- | --- |
| trips | platform_id | Reads often filtered by platform_id; multiple writes update by id only | At Risk | [lib/analytics/metricsService.ts](../../lib/analytics/metricsService.ts), [lib/dispatchService.ts](../../lib/dispatchService.ts), [app/trips/[id]/page.tsx](../../app/trips/[id]/page.tsx), [app/driver/page.tsx](../../app/driver/page.tsx) |
| drivers | platform_id | Reads filtered in analytics; write/update paths by id without platform check | At Risk | [lib/analytics/metricsService.ts](../../lib/analytics/metricsService.ts), [app/trips/[id]/page.tsx](../../app/trips/[id]/page.tsx), [app/drivers/page.tsx](../../app/drivers/page.tsx) |
| vehicles | platform_id | Reads filtered in analytics; write/update paths by id without platform check | At Risk | [lib/analytics/metricsService.ts](../../lib/analytics/metricsService.ts), [app/trips/[id]/page.tsx](../../app/trips/[id]/page.tsx), [app/vehicles/page.tsx](../../app/vehicles/page.tsx) |
| user_profiles (agents/admin/driver profiles) | platform_id | Profile reads use current user id or role filters; admin create routes accept platform_id from request body | At Risk | [lib/getUserPlatform.ts](../../lib/getUserPlatform.ts), [app/super-admin/page.tsx](../../app/super-admin/page.tsx), [app/api/create-platform-admin/route.ts](../../app/api/create-platform-admin/route.ts), [app/api/create-driver-user/route.ts](../../app/api/create-driver-user/route.ts), [app/app/api/create-agent-user/route.ts](../../app/app/api/create-agent-user/route.ts) |
| trip_events | platform_id | Insert path supports platform_id, but does not enforce required platform_id | At Risk | [lib/tripEventService.ts](../../lib/tripEventService.ts), [supabase/sql/create_trip_events.sql](../../supabase/sql/create_trip_events.sql) |
| audit_logs | platform_id | Insert path supports platform_id, but nullable platform_id allows unscoped records | At Risk | [lib/auditService.ts](../../lib/auditService.ts), [supabase/sql/create_audit_logs.sql](../../supabase/sql/create_audit_logs.sql) |
| emergency_alerts | platform_id | Reads filtered by platform_id in dashboard; updates by id only in dashboard workflows | At Risk | [app/emergency-dashboard/page.tsx](../../app/emergency-dashboard/page.tsx), [lib/analytics/metricsService.ts](../../lib/analytics/metricsService.ts), [app/trips/[id]/page.tsx](../../app/trips/[id]/page.tsx) |
| trip_passengers | platform_id | Reads filtered in reports; many updates and inserts keyed by trip/id without explicit platform guard | At Risk | [app/reports/page.tsx](../../app/reports/page.tsx), [app/trips/[id]/page.tsx](../../app/trips/[id]/page.tsx), [app/driver/page.tsx](../../app/driver/page.tsx), [app/admin-planner/page.tsx](../../app/admin-planner/page.tsx) |
| platforms | id | Super-admin domain table; no explicit in-file role guard before insert path | Blocked | [app/super-admin/page.tsx](../../app/super-admin/page.tsx) |
| driver_locations and driver_location_history | inferred by driver_id/trip_id | Writes performed by id/driver_id without explicit platform filter in reviewed page paths | Blocked | [app/driver/page.tsx](../../app/driver/page.tsx), [app/trips/[id]/page.tsx](../../app/trips/[id]/page.tsx) |

## Evidence Notes

1. Tenant-aware read patterns are present in several service functions via eq("platform_id", platformId).
2. Multiple mutation paths update entities with eq("id", value) and no additional platform filter in the same call site.
3. SQL files reviewed define tables and indexes but do not include tenant enforcement policies.

## Verification Test Log

| Test | Expected | Actual | Result |
| --- | --- | --- | --- |
| Static scan for platform_id filters in service reads | Tenant-scoped reads visible in shared service layer | Found in metrics services and selected pages | Complete |
| Static scan for mutation filters including platform_id | Mutations include entity id + tenant key guard | Many mutations only filter by id | Blocked |
| SQL artifact review for tenant-enforcing policies | RLS/policy artifacts present in repo SQL | No RLS/policy statements in reviewed SQL files | Blocked |
