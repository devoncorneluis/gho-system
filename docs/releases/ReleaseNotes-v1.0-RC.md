# Release Notes - GHO Enterprise v1.0 RC

## Release Overview

Version: v1.0.0-rc1 candidate

Release phase: RC3 Stabilization

Status: Not yet approved for production (Go/No-Go pending).

## Major Capabilities Delivered

1. Multi-tenant transport operations workflows across super admin, admin, operations, dispatch, driver, and client experiences.
2. Dispatch and trip lifecycle handling with shared dispatch/intelligence/automation service layers.
3. Operations control-tower workflows with monitoring and telemetry-backed governance.
4. Security governance artifacts including review, findings register, and remediation board.
5. Production readiness governance framework including release board, validation plan, and acceptance criteria.

## Breaking Changes

1. No confirmed breaking API contract changes documented in this RC note.
2. Any discovered breaking changes must be appended before final v1.0 approval.

## Known Limitations

1. Some UAT scenarios remain blocked pending credentialed role-based execution in controlled environment.
2. Load testing report is planned but not yet executed.
3. Disaster recovery drill requires infrastructure access and is not yet completed.
4. RLS policy evidence remains tracked as an open security workstream item.

## Upgrade Notes

1. Follow release branch governance in [RC3-Stabilization.md](RC3-Stabilization.md).
2. Apply schema/index changes through reviewed SQL artifacts before environment promotion.
3. Confirm readiness and validation evidence updates before pilot rollout.

## Production Readiness Status

1. Security review: In Progress.
2. Validation evidence: In Progress.
3. Build verification: Passing.
4. Test baseline: Passing (unit and integration suites currently green).
5. Final recommendation: Hold until release blockers are resolved or formally accepted.

## References

1. [RC3 Stabilization Governance](RC3-Stabilization.md)
2. [Readiness Checklist](../ReadinessChecklist.md)
3. [Security Remediation Plan](../security/SecurityRemediationPlan.md)
4. [Validation Evidence](../validation/ValidationEvidence.md)
5. [Production Acceptance Criteria](../validation/ProductionAcceptanceCriteria.md)
