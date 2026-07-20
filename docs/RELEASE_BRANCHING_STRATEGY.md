# Release Branching Strategy

## Branch Model

- main
- develop
- release/v1.0
- hotfix/*

## Rules During v1.0 Stabilization

1. All production-readiness work lands in release/v1.0.
2. No new business features in release/v1.0 unless production-blocking.
3. Use hotfix/* for urgent production fixes after v1.0 launch.
4. Merge release/v1.0 back to main and develop after launch sign-off.

## Merge and Validation Policy

Before merge into release/v1.0:

1. Run focused lint on changed modules.
2. Run tests for affected workstreams.
3. Run one production build.
4. Update readiness evidence and runbook references.

## Ownership

1. Security owner approves Workstream 1 changes.
2. Performance owner approves Workstream 2 changes.
3. QA owner approves Workstream 3 evidence.
4. Operations owner approves Workstream 4 and 5 artifacts.
