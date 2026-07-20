# Status Vocabulary

This document defines the official governance status vocabulary for GHO release management.

All governance artifacts must use only these values for status fields.

## Approved Status Values

| Status | Meaning |
| --- | --- |
| Complete | Work finished and verified. |
| In Progress | Actively being worked. |
| Blocked | Cannot proceed because of dependency, risk, or unresolved blocker. |
| Not Started | Planned but not yet begun. |
| At Risk | Progressing but at risk of missing target. |
| Not Applicable | Not required for this release scope. |

## Scope

Applies to all release governance documents, including:

1. Readiness and release board records.
2. Security remediation governance artifacts.
3. Validation execution and evidence trackers.

## Usage Rules

1. Status fields in tables must use an exact value from this vocabulary.
2. Do not use free-form alternatives such as Done, Finished, Open, Closed, Pending, or Nearly Complete.
3. Numeric metrics and recommendations may retain their native values.
4. If status is unknown, use Not Started until the owner confirms active execution.

## Normalization Map

Use this map when converting existing content:

| Legacy Value | Standard Value |
| --- | --- |
| Done / Finished / Verified | Complete |
| Open / Hold / No-Go | Blocked |
| Pending / Planned / TBD | Not Started |
| Active / Ongoing | In Progress |
| Partial / Needs Attention | At Risk |
| N/A | Not Applicable |
