# Security Remediation Plan (v1.0)

Status vocabulary source: [../StatusVocabulary.md](../StatusVocabulary.md)

## Release Governance Board

This document is a release-governance artifact, not only a remediation tracker. It determines whether GHO Enterprise v1.0 is eligible to ship.

### Executive Summary

| Metric | Value |
| --- | --- |
| Total Findings | 7 |
| Critical Blocked | 0 |
| High Blocked | 0 |
| Medium Blocked | 2 |
| Low Blocked | 1 |
| Overall Security Status | In Progress |
| Release Recommendation | Blocked |

Snapshot basis:

1. Current finding counts are sourced from [SecurityFindings.md](SecurityFindings.md).
2. Values must be updated whenever finding status changes.

## References

1. Findings source: [SecurityFindings.md](SecurityFindings.md)
2. Review context: [SecurityReview.md](SecurityReview.md)
3. Tenant evidence: [TenantIsolationMatrix.md](TenantIsolationMatrix.md)
4. Privileged workflows: [PrivilegedActionsMatrix.md](PrivilegedActionsMatrix.md)
5. RLS evidence: [RLSVerification.md](RLSVerification.md)
6. Readiness chain entry: [../ReadinessChecklist.md](../ReadinessChecklist.md)

## Batch Strategy

Batch priority is launch-driven and may be stricter than the initial finding severity label.

### Batch 1 - High (Launch Blockers)

1. SEC-001
2. SEC-002
3. SEC-003

### Batch 2 - Medium

1. SEC-004
2. SEC-005

### Batch 3 - Medium

1. SEC-006

### Batch 4 - Low / Technical Debt

1. SEC-007
2. Future hardening items

## Remediation Execution Tracker

| Finding | Severity | Engineering Owner | Verification Owner | Target Milestone | Status | Release Blocker |
| --- | --- | --- | --- | --- | --- | --- |
| SEC-001 | High | TBD | TBD | RC3 Stabilization | Blocked | Yes |
| SEC-002 | High | TBD | TBD | RC3 Stabilization | In Progress | Yes |
| SEC-003 | High | TBD | TBD | RC3 Stabilization | In Progress | Yes |
| SEC-004 | High | TBD | TBD | RC3 Stabilization | In Progress | Yes |
| SEC-005 | Medium | TBD | TBD | RC3 Stabilization | Blocked | No |
| SEC-006 | Medium | TBD | TBD | RC3 Stabilization | Blocked | No |
| SEC-007 | Low | TBD | TBD | RC3 Stabilization | Blocked | No |

## Phase 1 Evidence Register (Release-Blocking Findings)

Scope:

1. Current register contains no Critical findings.
2. Evidence capture applies to all High findings (SEC-001 through SEC-004).

| Finding | Remediation Implemented | Commit or PR Reference | Unit Test Evidence | Integration Test Evidence | Production Build Result | Verification Reviewer | Closure Decision |
| --- | --- | --- | --- | --- | --- | --- | --- |
| SEC-001 | Complete (platform-scoped mutation guards implemented) | Complete (commit 2e50857) | Complete (npm run test:run, 25/25 tests) | Complete (integration suite included in npm run test:run) | Complete (npm run build) | Not Started (independent review pending) | In Progress |
| SEC-002 | Complete (route-level authorization guards implemented) | Complete (commit d164142) | Complete (npm run test:run, 25/25 tests) | Complete (integration suite included in npm run test:run) | Complete (npm run build) | Not Started (independent review pending) | In Progress |
| SEC-003 | Complete (tenant RLS policy artifact added for required tenant tables) | Complete (commit 889a1e1) | Complete (npm run test:run, 29/29 tests) | Complete (policy artifact coverage included in npm run test:run) | Complete (npm run build) | Not Started (independent review pending) | In Progress |
| SEC-004 | Complete (centralized emergency transition service with durable audit writes) | Complete (commit 2a523c2) | Complete (npm run test:run, 33/33 tests) | Complete (emergency transition integration test included in npm run test:run) | Complete (npm run build) | Not Started (independent review pending) | In Progress |

Evidence reference note:

1. Build evidence baseline is sourced from the latest recorded production build in [../releases/RC3-Stabilization.md](../releases/RC3-Stabilization.md).
2. Finding-specific closure requires all fields above to be populated with concrete evidence.

## Gate 1 Contract (Security)

For each High finding, closure is objective and non-discretionary.

| Requirement | Required |
| --- | --- |
| Root cause documented | Yes |
| Remediation implemented | Yes |
| Unit tests complete | Yes |
| Integration tests complete | Yes |
| Production build complete | Yes |
| Reviewer approval complete | Yes |
| Evidence linked | Yes |
| Closure recorded | Yes |

Contract rule:

1. A finding cannot move to Complete until every required item above is Complete.
2. Partial evidence does not qualify for closure.
3. Reviewer approval must be independent of the implementation author.

## Execution Policy (Phase 1)

Findings are executed one at a time, end-to-end, to reduce context switching and maximize auditable progress.

Current execution target:

1. SEC-003

Execution sequence per finding:

1. Fix
2. Tests
3. Build
4. Reviewer verification
5. Evidence update
6. Close

## Weekly Review Board

### New findings (added this week)

- None recorded this week.

### Complete findings (verified this week)

- None recorded this week.

### Blocked findings (and why)

- None recorded this week.

### In Progress findings (execution evidence updated this week)

- SEC-001: Platform-scoped mutation guards implemented in shared and page-level trip workflows. Awaiting reviewer approval for closure.
- SEC-002: Route-level caller authorization and platform assignment guards implemented for privileged user-creation endpoints. Awaiting independent reviewer approval for closure.
- SEC-003: Repository RLS policy artifact and tenant policy coverage tests added for tenant-sensitive tables. Awaiting independent reviewer approval for closure.
- SEC-004: Emergency acknowledge, assign, and resolve transitions now flow through a centralized audited service with dedicated unit and integration evidence. Awaiting independent reviewer approval for closure.

### Risk changes (severity increased/decreased)

- None recorded this week.

### Weekly Go / No-Go recommendation

- Recommendation: No-Go (blocked release blockers remain).

## Finding Governance Records

### SEC-001

- Finding: Mutation paths update by id without consistent tenant guard evidence.
- Root cause: Tenant-aware write controls are not consistently centralized in shared services.
- Planned fix: Tenant-scoped service wrappers plus id + platform guard enforcement.
- Current state: In Progress.
- Pull request: Complete (commit 2e50857).
- Tests: Complete (npm run test:run, 25/25 passed).
- Production build: Complete (npm run build passed).
- Updated documentation: Complete.

Evidence checklist:

- [x] Root cause documented
- [x] Fix implemented
- [x] Unit tests complete
- [x] Integration tests complete
- [x] Production build complete
- [x] Documentation updated
- [ ] Verification complete
- [ ] Finding complete

### SEC-002

- Finding: Privileged user-creation routes rely on service-role operations without explicit caller authorization gating in route handlers.
- Root cause: Missing route-level role/capability guard before privileged action execution.
- Planned fix: Authenticated caller checks and centralized authorization middleware/guard.
- Current state: In Progress.
- Pull request: Complete (commit d164142).
- Tests: Complete (npm run test:run, 25/25 passed).
- Production build: Complete (npm run build passed).
- Updated documentation: Complete.

Evidence checklist:

- [x] Root cause documented
- [x] Fix implemented
- [x] Unit tests complete
- [x] Integration tests complete
- [x] Production build complete
- [x] Documentation updated
- [ ] Verification complete
- [ ] Finding complete

### SEC-003

- Finding: RLS policy evidence is absent in repository SQL artifacts for tenant-sensitive tables.
- Root cause: Missing migration/policy artifacts in repository versioned SQL.
- Planned fix: Add explicit RLS migrations and policy verification checklist/script.
- Current state: In Progress.
- Pull request: Complete (commit 889a1e1).
- Tests: Complete (npm run test:run, 29/29 passed).
- Production build: Complete (npm run build passed).
- Updated documentation: Complete.

Evidence checklist:

- [x] Root cause documented
- [x] Fix implemented
- [x] Unit tests complete
- [x] Integration tests complete
- [x] Production build complete
- [x] Documentation updated
- [ ] Verification complete
- [ ] Finding complete

### SEC-004

- Finding: Emergency workflow transitions do not show complete durable audit coverage evidence.
- Root cause: Emergency state changes are page-driven and not consistently routed through audited service methods.
- Planned fix: Centralized audited emergency transition service and validation tests.
- Current state: In Progress.
- Pull request: Complete (commit 2a523c2).
- Tests: Complete (npm run test:run, 33/33 passed).
- Production build: Complete (npm run build passed).
- Updated documentation: Complete.

Evidence checklist:

- [x] Root cause documented
- [x] Fix implemented
- [x] Unit tests complete
- [x] Integration tests complete
- [x] Production build complete
- [x] Documentation updated
- [ ] Verification complete
- [ ] Finding complete

### SEC-005

- Finding: Super-admin platform creation lacks explicit in-path role/capability verification evidence.
- Root cause: Privileged flow relies on UI assumptions rather than explicit server-side authorization gate.
- Planned fix: Secure server route with super_admin capability guard and audit write.
- Current state: Blocked.
- Pull request: Not Started.
- Tests: Not Started.
- Production build: Not Started.
- Updated documentation: Not Started.

Evidence checklist:

- [ ] Root cause documented
- [ ] Fix implemented
- [ ] Unit tests complete
- [ ] Integration tests complete
- [ ] Production build complete
- [ ] Documentation updated
- [ ] Verification complete
- [ ] Finding complete

### SEC-006

- Finding: audit_logs and trip_events allow nullable platform_id, reducing strict tenant attribution guarantees.
- Root cause: Schema and service-level validation do not force tenant attribution for tenant-scoped events.
- Planned fix: Schema/validation enforcement with explicit global-event exception path.
- Current state: Blocked.
- Pull request: Not Started.
- Tests: Not Started.
- Production build: Not Started.
- Updated documentation: Not Started.

Evidence checklist:

- [ ] Root cause documented
- [ ] Fix implemented
- [ ] Unit tests complete
- [ ] Integration tests complete
- [ ] Production build complete
- [ ] Documentation updated
- [ ] Verification complete
- [ ] Finding complete

### SEC-007

- Finding: Hardcoded platform identifiers in pages create brittle tenant-context handling.
- Root cause: Static tenant placeholders remain in page-level query paths.
- Planned fix: Replace hardcoded identifiers with authenticated tenant resolution pattern.
- Current state: Blocked.
- Pull request: Not Started.
- Tests: Not Started.
- Production build: Not Started.
- Updated documentation: Not Started.

Evidence checklist:

- [ ] Root cause documented
- [ ] Fix implemented
- [ ] Unit tests complete
- [ ] Integration tests complete
- [ ] Production build complete
- [ ] Documentation updated
- [ ] Verification complete
- [ ] Finding complete

## Verification Checklist (Required For Closure)

No finding may be closed until all applicable checks are complete.

- [ ] Root cause confirmed
- [ ] Code reviewed
- [ ] Unit tests complete
- [ ] Integration tests complete
- [ ] Production build complete
- [ ] Documentation updated
- [ ] Security review complete
- [ ] Regression testing complete
- [ ] Verification owner complete
- [ ] Finding complete

## Remediation Workflow (Mandatory)

No finding may skip a stage.

Not Started
-> Root Cause Identified
-> Fix Implemented
-> Unit Tests Complete
-> Integration Tests Complete
-> Production Build Complete
-> Security Review Complete
-> Complete

## Evidence Requirements (Per Finding)

Each finding closure must include references to:

1. Commit hash or PR link containing the remediation.
2. Unit and integration test evidence.
3. Production build evidence.
4. Updated documentation and matrix entries.

Tracking fields to populate during remediation:

- PR/Commit:
- Unit Test Evidence:
- Integration Test Evidence:
- Build Evidence:
- Docs Updated:
- Security Verification Note:

## Release Gates

### Gate 1 - Security

PASS requires all of the following:

1. No Blocked Critical findings.
2. No Blocked High findings.
3. Evidence chain Complete for every remediated finding.
4. Production build Complete after final remediation in scope.
5. Security review signed.
6. Release board approval recorded.

Gate transition rule:

1. Gate 1 remains In Progress until all PASS conditions are satisfied.
2. Gate 1 moves to Complete only when all PASS conditions are satisfied.

### Gate 2 - Quality

1. Production build passes.
2. Required test suites pass.
3. No known release-blocking defects.

### Gate 3 - Operations

1. Monitoring validated.
2. Alert thresholds verified.
3. Backup and restore exercised.
4. Runbooks reviewed.

### Gate 4 - Release

1. Documentation complete.
2. Readiness checklist signed off.
3. Security remediation complete.
4. Final release approval.

## Launch Gate Summary

| Severity | Blocked | Complete | Launch Blocker |
| --- | --- | --- | --- |
| Critical | 0 | 0 | Yes |
| High | 1 | 0 | Yes |
| Medium | 3 | 0 | No |
| Low | 1 | 0 | No |

Status mapping for this table:

1. Open means Blocked.
2. Closed means Complete.

Gate rules:

1. No Critical findings may remain Blocked before v1.0.
2. No High findings may remain Blocked unless formally accepted and documented.
3. Medium and Low findings require explicit disposition (fix now, defer, or accept risk).

## Release Decision

| Reviewer | Area | Decision | Date |
| --- | --- | --- | --- |
| Security | Security | ☐ Approve ☐ Reject | TBD |
| Engineering | Engineering | ☐ Approve ☐ Reject | TBD |
| Operations | Operations | ☐ Approve ☐ Reject | TBD |
| Product | Product | ☐ Approve ☐ Reject | TBD |

Overall Release Decision

- ☐ GO
- ☐ NO GO
- Approved Version: GHO Enterprise v1.0

## Traceability Chain

Readiness Checklist
-> Security Review
-> Security Findings
-> Security Remediation Plan
-> Tests + Build Evidence
-> Release Sign-off
