# Operations Readiness Runbooks

## Deployment Runbook

1. Confirm release/v1.0 commit hash and release notes.
2. Validate environment variables and secrets.
3. Run lint, tests, and production build.
4. Deploy incrementally and monitor health signals.
5. Capture deployment timeline and validation checks.

## Rollback Procedure

1. Trigger rollback decision based on SLO or incident threshold.
2. Revert to previous known-good artifact.
3. Validate application health and data integrity.
4. Record incident timeline and root cause summary.

## Backup Schedule

1. Daily logical backup with retention policy.
2. Weekly restore-point validation.
3. Monthly backup integrity check.

## Restore Drill

1. Restore a backup to non-production environment.
2. Run critical workflow sanity checks.
3. Compare key metrics and record variances.
4. Track restore time objective and recovery point objective compliance.

## Incident Response Guide

1. Classify severity (SEV1-SEV3).
2. Assign incident commander and communication lead.
3. Mitigate, recover, and validate.
4. Publish post-incident report with prevention actions.

## Monitoring Dashboard and Alert Thresholds

Minimum dashboard widgets:

1. Operations health and queue depth.
2. Realtime reliability and reconnect attempts.
3. Guardrail blocked/caution action trends.
4. Workflow failures and escalation backlog.

Minimum alerts:

1. Blocked rate over threshold for 15 minutes.
2. Workflow failure rate over threshold for 10 minutes.
3. Realtime disconnect persistence over threshold.
4. Queue depth or queue age critical threshold exceeded.

## Release Checklist

1. Security sign-off attached.
2. Performance report attached.
3. End-to-end workflow evidence attached.
4. Observability validation report attached.
5. Rollback and incident response contacts confirmed.
