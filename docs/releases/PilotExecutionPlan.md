# Pilot Execution Plan

Status vocabulary source: [../StatusVocabulary.md](../StatusVocabulary.md)

## Pilot Objectives

1. Validate all production workflows with seeded UAT data and pilot operators.
2. Validate monitoring visibility during active dispatch operations.
3. Validate telemetry capture for critical user and system events.
4. Validate reporting outputs for operational and executive review.
5. Validate recovery readiness evidence before release-candidate approval.

## Pilot Scope

| Scope Item | Pilot Target |
| --- | --- |
| Platform | 1 platform |
| Drivers | 8 drivers |
| Agents | 100 agents |
| Daily trips | 15 daily trips |
| Live GPS | Enabled for active trips |
| Dispatch | Planned, assigned, dispatched, reassigned |
| Emergency | 1 active emergency scenario |
| Reports | Daily operations and executive summaries |

## Daily Checklist

### Morning

| Check | Expected Result | Evidence |
| --- | --- | --- |
| Verify seed version | Release Dashboard shows expected UAT seed version and build | Release Dashboard screenshot or export |
| Verify monitoring | Monitoring panels are reachable and current | Monitoring evidence note |
| Verify release dashboard | Release Dashboard loads and gate statuses match source artifacts | Release Dashboard evidence note |
| Verify active trips | 15 daily trips visible for the pilot platform | UAT evidence reference |

### Midday

| Check | Expected Result | Evidence |
| --- | --- | --- |
| Observe dispatch latency | Dispatch action latency captured for Gate 3 | Performance evidence reference |
| Monitor realtime | Realtime status and propagation timing captured | Performance evidence reference |
| Check emergency queue | Active emergency appears and can be managed through workflow | UAT evidence reference |

### End Of Day

| Check | Expected Result | Evidence |
| --- | --- | --- |
| Verify completed trips | Completed trip count and statuses match pilot execution | UAT evidence reference |
| Review alerts | Critical/high alerts reviewed and dispositioned | Pilot issue log |
| Export evidence | Day evidence linked in ReleaseEvidence.md | Release evidence index |

## Execution Rules

1. Do not mark a pilot day successful without objective evidence.
2. Defects must be recorded with severity, owner, and release disposition.
3. Any critical defect pauses pilot progression until triaged by the release board.
