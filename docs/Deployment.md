# Deployment

## Build and Verification

Primary production verification command:

- npm run build

Recommended pre-release checks:

1. npm run lint on changed modules.
2. npm run test:run for unit/integration suites.
3. npm run build for production compilation.

## Runtime Requirements

- Valid Supabase environment variables.
- Optional Google Maps API key for map features.

## Production Environment Review

1. Confirm environment variable completeness and secret rotation policy.
2. Validate platform-level feature flags and subscription behavior in staging.
3. Verify security policies for tenant isolation and session handling.

## Backup and Recovery

1. Define database backup cadence and retention windows.
2. Validate restore workflow in a non-production environment.
3. Keep a documented restore verification checklist for data integrity.

## Disaster Recovery

1. Define RTO and RPO targets for platform-critical services.
2. Maintain runbooks for infrastructure failover and rollback of schema migrations.
3. Schedule periodic DR drills and capture corrective actions.

## Release and Rollback Process

1. Run lint, test:run, and build before release tagging.
2. Deploy incrementally and monitor automation/queue/realtime health.
3. If degradation is detected, execute rollback to previous stable artifact.
4. Record incident timeline, root cause, and prevention actions after rollback.

## Release Discipline

- Prefer small, scoped release increments.
- Keep schema/index scripts versioned in supabase/sql.
- Validate multi-tenant access boundaries in staging.
