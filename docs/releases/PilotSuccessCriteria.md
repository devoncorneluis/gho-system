# Pilot Success Criteria

Status vocabulary source: [../StatusVocabulary.md](../StatusVocabulary.md)

## Measurable Criteria

| Metric | Target | Measurement Source |
| --- | --- | --- |
| Uptime | >= 99% during pilot window | Monitoring evidence |
| Dispatch success | 100% of planned dispatch scenarios complete | UAT evidence |
| Driver login success | >= 99% successful login attempts | Auth telemetry or UAT log |
| Emergency workflow | 100% emergency scenarios acknowledged and resolved | UAT and operations evidence |
| Monitoring availability | 100% during pilot checkpoints | Monitoring evidence |
| Critical defects | 0 open or unresolved | Defect log |
| High defects | 0 unresolved at Go/No-Go | Defect log |
| Reporting availability | 100% of required reports available | Reporting evidence |
| Recovery readiness | Backup/restore drill complete within RTO/RPO | Recovery evidence |

## Successful Pilot Definition

A pilot is successful only when:

1. All required daily pilot checks are completed with evidence.
2. All production-critical workflows pass.
3. Monitoring, telemetry, and reporting are available throughout the pilot.
4. No critical defects remain open.
5. No high defects remain unresolved without release-board approval.
6. Recovery validation is complete or explicitly waived by the release board.
7. ReleaseEvidence.md links all pilot, validation, and decision artifacts.

## Failure Conditions

The pilot is not successful if any of the following occur:

1. A critical workflow cannot be completed.
2. Emergency workflow evidence is missing or failed.
3. Monitoring is unavailable during a required checkpoint.
4. A critical defect remains open.
5. A high defect remains unresolved without approved mitigation.
