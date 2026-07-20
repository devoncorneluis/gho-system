# Contributing Guide

## v1.0 Feature Freeze Policy

Allowed categories:

1. Bug fixes.
2. Security improvements.
3. Performance improvements.
4. Test additions.
5. Documentation and runbook updates.
6. Deployment readiness changes.

Disallowed category:

1. New business features unless they resolve a production blocker.

## Architecture Principles

1. Place logic in the correct layer: Platform, Business, Analytics, Intelligence, Automation, then UI.
2. Keep page components thin and presentation-focused.
3. Build shared services before introducing dashboard-specific code.
4. Use shared types in types for contracts reused across modules.

## Coding Standards

1. TypeScript strict mode compatible code only.
2. Prefer pure functions for business rules.
3. Keep function inputs and outputs typed explicitly.
4. Avoid hidden side effects in service functions.
5. Add concise comments only where logic is non-obvious.

## One Production Build At A Time

1. Complete scoped changes.
2. Run focused lint and test checks for touched modules.
3. Run one production build with npm run build.
4. Fix all relevant issues before merging.

## Shared Services Before Page Logic

1. If a rule can be reused, implement it under lib first.
2. UI components should consume service outputs, not recreate service logic.
3. Avoid direct business-rule conditionals in page components.

## Multi-tenant Design Rules

1. All tenant-aware operations must include platformId context.
2. Enforce platform isolation in permissions and service boundaries.
3. Avoid cross-platform data assumptions in queries and caches.
4. Feature exposure must be controlled by tier/flag services.

## No Duplicated Business Logic

1. Extend existing service modules when behavior overlaps.
2. Extract duplicated calculations into shared utilities.
3. Keep automation, intelligence, and analytics decisions centralized.

## Pull Request Checklist

1. Layer placement validated.
2. Shared types updated where applicable.
3. No duplicated business logic introduced.
4. Security and tenant isolation impacts reviewed.
5. Lint/tests/build run successfully.
6. Docs updated for behavior or architecture changes.

## Build Verification Process

1. Run focused lint checks on changed files.
2. Run test suite for affected modules.
3. Run npm run build.
4. Record build success in release notes or PR description.
