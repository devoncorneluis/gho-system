# Rollback Runbook

Status vocabulary source: [../StatusVocabulary.md](../StatusVocabulary.md)

## Rollback Triggers

Rollback must be considered when any of the following occur:

1. Critical workflow outage.
2. Authentication failure affecting pilot or production users.
3. Data integrity defect.
4. Emergency workflow failure.
5. Monitoring outage that prevents operational control.
6. Migration failure or unrecoverable deployment error.

## Rollback Procedure

1. Declare rollback decision in the release channel.
2. Assign rollback owner and evidence recorder.
3. Freeze non-essential changes.
4. Identify previous known-good build artifact.
5. Restore application runtime to previous known-good build.
6. Restore database state if required and approved.
7. Verify environment variables and service connectivity.
8. Run rollback smoke tests.
9. Record timestamps, RTO, deviations, and evidence.

## Verification After Rollback

| Check | Expected Result |
| --- | --- |
| Application boot | Application loads without startup errors |
| Login | Required roles can authenticate |
| Dispatch | Dispatch dashboard loads and active trips are coherent |
| Emergency | Emergency queue is reachable |
| Monitoring | Monitoring and release dashboard are reachable |
| Data integrity | Critical tables and tenant-scoped records validate |

## Communication Checklist

| Audience | Message |
| --- | --- |
| Release board | Rollback initiated, owner, expected next update |
| Operations | Current operational impact and workaround |
| Support | Customer-facing response guidance |
| Customer/pilot stakeholders | Impact, mitigation, and next update time |

## Evidence Required

1. Rollback decision timestamp.
2. Build artifact before and after rollback.
3. Validation checklist results.
4. Any deviations from planned rollback.
5. Final rollback status and owner sign-off.
