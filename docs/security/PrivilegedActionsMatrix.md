# Privileged Actions Matrix

Status vocabulary source: [../StatusVocabulary.md](../StatusVocabulary.md)

Status legend:

- Complete: Role/permission check and audit evidence found.
- At Risk: Some controls present, but not complete or not linked to action path.
- Blocked: Required control not evidenced in reviewed path.

| Action | Expected Role | Permission Check Location | Audit Evidence | Status | Evidence |
| --- | --- | --- | --- | --- | --- |
| Dispatch trip status transition | dispatcher or platform_admin | Security policy exists but not directly enforced in updateTripStatus path | logAuditEvent called in service | At Risk | [lib/security/policyEngine.ts](../../lib/security/policyEngine.ts), [lib/dispatchService.ts](../../lib/dispatchService.ts) |
| Driver accepts dispatch | driver | No explicit authorizeCapability call in service/page path | logAuditEvent and trip event recorded | At Risk | [lib/dispatchService.ts](../../lib/dispatchService.ts), [app/driver/page.tsx](../../app/driver/page.tsx) |
| Driver rejects dispatch and triggers reassignment flow | driver | No explicit authorizeCapability call in service/page path | logAuditEvent and trip event recorded | At Risk | [lib/dispatchService.ts](../../lib/dispatchService.ts), [app/driver/page.tsx](../../app/driver/page.tsx) |
| Emergency acknowledge | operations or dispatcher | No explicit role check in page mutation path | Centralized audit write in emergency transition service | At Risk | [lib/emergencyTransitionService.ts](../../lib/emergencyTransitionService.ts), [app/emergency-dashboard/page.tsx](../../app/emergency-dashboard/page.tsx), [tests/integration/emergency-transition.integration.test.ts](../../tests/integration/emergency-transition.integration.test.ts) |
| Emergency assign responder | operations or dispatcher | No explicit role check in page mutation path | Centralized audit write in emergency transition service | At Risk | [lib/emergencyTransitionService.ts](../../lib/emergencyTransitionService.ts), [app/emergency-dashboard/page.tsx](../../app/emergency-dashboard/page.tsx), [tests/integration/emergency-transition.integration.test.ts](../../tests/integration/emergency-transition.integration.test.ts) |
| Emergency resolve | operations or dispatcher | No explicit role check in page mutation path | Centralized audit write in emergency transition service | At Risk | [lib/emergencyTransitionService.ts](../../lib/emergencyTransitionService.ts), [app/emergency-dashboard/page.tsx](../../app/emergency-dashboard/page.tsx), [tests/integration/emergency-transition.integration.test.ts](../../tests/integration/emergency-transition.integration.test.ts) |
| Create platform | super_admin | No explicit role check in createPlatform path | No direct audit write in reviewed path | Blocked | [app/super-admin/page.tsx](../../app/super-admin/page.tsx) |
| Create platform admin user | super_admin | API route uses service-role key without caller authorization check | No direct audit write in reviewed path | Blocked | [app/api/create-platform-admin/route.ts](../../app/api/create-platform-admin/route.ts) |
| Create driver user | admin | API route uses service-role key without caller authorization check | No direct audit write in reviewed path | Blocked | [app/api/create-driver-user/route.ts](../../app/api/create-driver-user/route.ts) |
| Create agent user | admin | API route uses service-role key without caller authorization check | No direct audit write in reviewed path | Blocked | [app/app/api/create-agent-user/route.ts](../../app/app/api/create-agent-user/route.ts) |
| Approve recommendation (operations action center) | dispatcher or platform_admin | Guardrail logic present; no persisted permission-gate evidence in reviewed UI path | Telemetry/audit-trail style entries in automation facade | At Risk | [components/operations/ActionCenterPanel.tsx](../../components/operations/ActionCenterPanel.tsx), [lib/automation/automationFacade.ts](../../lib/automation/automationFacade.ts) |
| Resolve alert from trip detail | operations or dispatcher | No explicit role check in page mutation path | No direct audit write in reviewed path | Blocked | [app/trips/[id]/page.tsx](../../app/trips/[id]/page.tsx) |

## Verification Test Log

| Test | Expected | Actual | Result |
| --- | --- | --- | --- |
| Static trace from action entry to permission check | Each privileged action calls shared permission engine or server gate | Shared permission engine exists but not consistently wired | Blocked |
| Static trace from action entry to audit write | Critical state changes produce durable audit records | Dispatch and emergency workflows now route through audited service methods; residual uncovered page paths remain | In Progress |
