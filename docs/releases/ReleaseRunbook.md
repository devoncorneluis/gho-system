# Release Runbook

Status vocabulary source: [../StatusVocabulary.md](../StatusVocabulary.md)

## Pre-Deployment Checks

1. Confirm release branch and target tag.
2. Confirm Go / No-Go checklist is approved.
3. Confirm no critical or unresolved high defects remain.
4. Confirm UAT, performance, recovery, and pilot evidence links are current.
5. Confirm rollback owner and communication channel are active.

## Environment Verification

| Check | Expected Result |
| --- | --- |
| Environment variables | Production values present and reviewed |
| Supabase connectivity | Auth, database, and realtime reachable |
| Monitoring | Release dashboard and monitoring views reachable |
| Backup | Latest backup point available before deployment |
| Access | Deployment and rollback operators available |

## Database Migrations

1. Review migration list and expected schema changes.
2. Confirm backup exists before applying migrations.
3. Apply migrations through approved deployment process.
4. Verify migration success and schema health.
5. Record migration evidence in ReleaseEvidence.md.

## Seed Verification

Seed verification is required only for UAT, demo, or pilot environments.

1. Confirm `.uat-seed-status.json` schema version.
2. Confirm seed version and build match release candidate.
3. Confirm platform, driver, vehicle, trip, passenger, and emergency counts.

## Health Verification

1. Application boots successfully.
2. Login works for required role accounts.
3. Release Dashboard loads.
4. Monitoring snapshot loads.
5. Critical API routes respond.
6. Realtime health is visible.

## Smoke Tests

| Smoke Test | Expected Result |
| --- | --- |
| Login | Authenticated user lands on correct portal |
| Dispatch view | Active trips and queues load |
| Driver view | Assigned trip is visible |
| Emergency dashboard | Emergency queue loads |
| Reports | Reporting page loads |
| Release Dashboard | Gate status and evidence links render |

## Post-Deployment Validation

1. Capture build/deployment evidence.
2. Run smoke tests and record pass/fail.
3. Confirm monitoring remains healthy for the observation window.
4. Confirm support and escalation channels are staffed.
5. Update ReleaseEvidence.md with deployment evidence.
