# Architecture

## Layering Model

GHO follows a layered architecture to keep business logic reusable and UI thin.

1. Platform layer: tenant, subscription, feature flags, licensing, permissions, health.
2. Business layer: dispatch, trips, fleet operational logic.
3. Analytics layer: KPI and metrics calculations.
4. Intelligence layer: delay, SLA, and risk assessments.
5. Automation layer: workflows, escalation, notification routing, recommendations.
6. UI layer: dashboards and pages that consume services.

## Key Design Rules

- Business logic is implemented in lib services, not React pages.
- Shared types are centralized in types.
- Modules export through index entry points for stable imports.
- New features should target the lowest reusable layer first.

## Multi-tenant Principles

- All tenant-aware logic carries platformId context.
- Permission and session checks enforce platform isolation.
- Feature behavior can vary by subscription tier via feature flags.
