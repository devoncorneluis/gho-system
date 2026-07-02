# Security Findings Register

Related remediation planning document: [SecurityRemediationPlan.md](SecurityRemediationPlan.md)

Status vocabulary source: [../StatusVocabulary.md](../StatusVocabulary.md)

Status legend:

- Blocked: Not remediated and currently blocked from closure.
- In Progress: Remediation in flight.
- Complete: Remediation merged and validated.
- Not Applicable: Explicitly postponed with documented risk acceptance.

| ID | Severity | Finding | Owner | Status | Evidence |
| --- | --- | --- | --- | --- | --- |
| SEC-001 | High | Multiple mutation paths update by id without explicit platform_id guard at call site. | Security + Backend | In Progress | [lib/dispatchService.ts](../../lib/dispatchService.ts), [lib/security/tenantScope.ts](../../lib/security/tenantScope.ts), [app/trips/[id]/page.tsx](../../app/trips/[id]/page.tsx), [app/driver/page.tsx](../../app/driver/page.tsx), [app/emergency-dashboard/page.tsx](../../app/emergency-dashboard/page.tsx), [tests/unit/dispatch-scope.test.ts](../../tests/unit/dispatch-scope.test.ts) |
| SEC-002 | High | Privileged API routes create users with service-role key and no explicit caller authorization gate in route handlers. | Security + API | In Progress | [app/api/create-platform-admin/route.ts](../../app/api/create-platform-admin/route.ts), [app/api/create-driver-user/route.ts](../../app/api/create-driver-user/route.ts), [app/app/api/create-agent-user/route.ts](../../app/app/api/create-agent-user/route.ts), [lib/security/privilegedRouteGuard.ts](../../lib/security/privilegedRouteGuard.ts), [tests/unit/privileged-route-guard.test.ts](../../tests/unit/privileged-route-guard.test.ts) |
| SEC-003 | High | RLS policy evidence is absent from repository SQL artifacts for tenant-sensitive tables. | Security + Data | In Progress | [supabase/sql/create_tenant_rls_policies.sql](../../supabase/sql/create_tenant_rls_policies.sql), [tests/unit/rls-policy-artifacts.test.ts](../../tests/unit/rls-policy-artifacts.test.ts), [docs/security/RLSVerification.md](RLSVerification.md) |
| SEC-004 | High | Emergency workflow state transitions are not evidenced with explicit audit-log writes in reviewed page mutation path. | Security + Operations | In Progress | [lib/emergencyTransitionService.ts](../../lib/emergencyTransitionService.ts), [app/emergency-dashboard/page.tsx](../../app/emergency-dashboard/page.tsx), [tests/unit/emergency-transition.test.ts](../../tests/unit/emergency-transition.test.ts), [tests/integration/emergency-transition.integration.test.ts](../../tests/integration/emergency-transition.integration.test.ts) |
| SEC-005 | Medium | Super-admin platform creation path lacks explicit in-path role/capability check evidence in reviewed client flow. | Security + Platform | Blocked | [app/super-admin/page.tsx](../../app/super-admin/page.tsx), [lib/security/permissionEngine.ts](../../lib/security/permissionEngine.ts) |
| SEC-006 | Medium | Audit and trip-event tables allow nullable platform_id, reducing strict tenant attribution guarantees for critical records. | Security + Data | Blocked | [supabase/sql/create_audit_logs.sql](../../supabase/sql/create_audit_logs.sql), [supabase/sql/create_trip_events.sql](../../supabase/sql/create_trip_events.sql) |
| SEC-007 | Low | Reports and emergency dashboards use a hardcoded platform identifier, which is brittle and risks inconsistent tenant context handling. | Security + Frontend | Blocked | [app/reports/page.tsx](../../app/reports/page.tsx), [app/emergency-dashboard/page.tsx](../../app/emergency-dashboard/page.tsx) |

## Remediation Protocol

For each finding:

1. Create a focused remediation change.
2. Add or update tests to prove control behavior.
3. Run production build.
4. Mark finding status and attach evidence references.

## Phase 1 Execution Evidence (High Findings)

| Finding | Remediation Implemented | Commit or PR | Unit Test Result | Integration Test Result | Production Build Result | Verification Reviewer | Closure Decision |
| --- | --- | --- | --- | --- | --- | --- | --- |
| SEC-001 | Complete (platform-scoped mutation guards implemented) | Complete (commit 2e50857) | Complete (npm run test:run, 25/25 tests) | Complete (integration suite included in npm run test:run) | Complete (npm run build) | Not Started (independent review pending) | In Progress |
| SEC-002 | Complete (route-level authorization guards implemented) | Complete (commit d164142) | Complete (npm run test:run, 25/25 tests) | Complete (integration suite included in npm run test:run) | Complete (npm run build) | Not Started (independent review pending) | In Progress |
| SEC-003 | Complete (tenant RLS policy artifact added for required tenant tables) | Complete (commit 889a1e1) | Complete (npm run test:run, 29/29 tests) | Complete (policy artifact coverage included in npm run test:run) | Complete (npm run build) | Not Started (independent review pending) | In Progress |
| SEC-004 | Complete (centralized emergency transition service with durable audit writes) | Complete (commit 2a523c2) | Complete (npm run test:run, 33/33 tests) | Complete (emergency transition integration test included in npm run test:run) | Complete (npm run build) | Not Started (independent review pending) | In Progress |

Closure contract:

1. A finding moves to Complete only when all evidence fields are Complete.
2. Reviewer verification must be completed before closure.
3. Closure decision must be explicitly recorded in this table and in [SecurityRemediationPlan.md](SecurityRemediationPlan.md).

## Workstream Completion Criteria Mapping

1. No cross-tenant data exposure: requires SEC-001, SEC-003, SEC-006 closure.
2. Privileged actions require roles: requires SEC-002, SEC-005 closure.
3. Audit coverage for critical workflows: requires SEC-004 closure.
