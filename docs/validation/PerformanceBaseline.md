# Performance Baseline

Status vocabulary source: [../StatusVocabulary.md](../StatusVocabulary.md)

## Purpose

Capture baseline performance metrics for v1.0 readiness and future regressions.

## Baseline Fields

| Metric | Baseline Value | Measurement Method | Date | Notes |
| --- | --- | --- | --- | --- |
| Initial dashboard load | Pending Measurement | Browser navigation timing | Pending Measurement | Warning > 2500ms; Fail >= 4000ms |
| API latency | Pending Measurement | Server request timing across critical API routes | Pending Measurement | Warning > 500ms; Fail >= 1000ms |
| Realtime propagation | Pending Measurement | Event emit-to-render timing | Pending Measurement | Warning > 1500ms; Fail >= 3000ms |
| Monitoring snapshot generation | Pending Measurement | `getPerformanceSnapshot` / monitoring snapshot wall-clock timing | Pending Measurement | Warning > 750ms; Fail >= 1500ms |
| UAT seed execution | Pending Measurement | `scripts/seed-uat.ts` wall-clock timing | Pending Measurement | Warning > 30000ms; Fail >= 60000ms |
| UAT reset execution | Pending Measurement | `scripts/reset-uat.ts` wall-clock timing | Pending Measurement | Warning > 45000ms; Fail >= 90000ms |
| Production build duration | Pending Measurement | `npm run build` wall-clock timing | Pending Measurement | Warning > 30000ms; Fail >= 60000ms |
| Query statistics | Pending Measurement | Query profiler p50/p95 and slow-query count | Pending Measurement | Slow query threshold: >= 500ms |
| Google Maps rendering | Pending Measurement | Browser render timing and map interaction observation | Pending Measurement | Warning > 2500ms; Fail >= 4000ms |

## Performance Snapshot Contract

The shared source of truth is [../../lib/performance/performanceSnapshot.ts](../../lib/performance/performanceSnapshot.ts).

The API surface is `/api/performance`.

The Release Dashboard must display the snapshot and must not calculate performance status independently.

## Measurement Guidance

1. Use the same environment profile for repeatability.
2. Run each measurement at least three times and average.
3. Record any anomalies and environmental noise.

## Acceptance Guardrails

1. No metric should regress without documented rationale.
2. Release board must review material regressions before Go decision.

## Evidence Link

Record completed measurements in [ValidationEvidence.md](ValidationEvidence.md).
