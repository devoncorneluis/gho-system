# User Acceptance Testing

Status vocabulary source: [../StatusVocabulary.md](../StatusVocabulary.md)

Use this document to execute and record role-based UAT scripts.

## Execution Record Template

- Preconditions:
- Steps:

- Expected Result:
- Actual Result:
- Status:
- Tester:
- Date:
- Environment:
- Defects Found:
- Evidence Reference:

## Gate 2 Execution Run 1 (2026-07-02)

Execution type: Live local app run at [http://localhost:3000](http://localhost:3000) using release/v1.0 branch.

| Workflow Role | Route(s) Exercised | Observed Outcome | Status | Tester | Environment | Evidence Reference |
| --- | --- | --- | --- | --- | --- | --- |
| Super Admin | /super-admin | Super-admin portal route rendered and navigation shell loaded. Full create/configure action flow requires approved UAT credential and tenancy dataset. | In Progress | GitHub Copilot | Local release/v1.0 dev server | [ValidationEvidence.md](ValidationEvidence.md) |
| Platform Admin | /admin | Admin route redirected to /login without active authenticated session. Full entity-creation workflows require credentialed platform-admin account and seeded tenancy data. | In Progress | GitHub Copilot | Local release/v1.0 dev server | [ValidationEvidence.md](ValidationEvidence.md) |
| Dispatcher | /operations | Operations control tower route rendered. Queue/reassignment/exception-resolution actions require credentialed dispatcher session with seeded dispatch queue data. | In Progress | GitHub Copilot | Local release/v1.0 dev server | [ValidationEvidence.md](ValidationEvidence.md) |
| Driver | /driver, /login | Driver route redirected to /login without active driver session. Accept/reject/complete/emergency scenario remains blocked pending credentialed driver account and assigned trip data. | Blocked | GitHub Copilot | Local release/v1.0 dev server | [ValidationEvidence.md](ValidationEvidence.md) |
| Client | /client | Client portal route rendered successfully. Live-tracking and report validation cannot be completed without client-scoped seeded trips/passenger records. | In Progress | GitHub Copilot | Local release/v1.0 dev server | [ValidationEvidence.md](ValidationEvidence.md) |
| Executive | /executive | Executive dashboard route rendered with KPI shell. Data-quality validation requires authenticated executive dataset and KPI acceptance baseline. | In Progress | GitHub Copilot | Local release/v1.0 dev server | [ValidationEvidence.md](ValidationEvidence.md) |

Run notes:

1. Release dashboard route (/release) redirected to /login as expected for unauthenticated users.
2. This run provides objective Gate 2 execution evidence for environment and route-level workflow reachability.
3. Credentialed end-to-end workflow completion is still required for final UAT closure.

## Super Admin Scripts

### Script SA-01: Create company

- Preconditions: Super Admin logged in.
- Steps:

1. Open Super Admin portal.
2. Enter new platform/company details.
3. Submit create action.

- Expected Result: Company/platform record is created and visible.
- Actual Result: Not executed in this environment (requires super-admin credentialed UAT session).
- Status: Blocked
- Tester: GitHub Copilot (validation prep)
- Date: 2026-07-02
- Environment: Local release/v1.0 (no seeded UAT credentials provided)
- Defects Found: None (execution blocked)
- Evidence Reference: [ValidationEvidence.md](ValidationEvidence.md)

### Script SA-02: Configure platform

- Preconditions: Existing company created.
- Steps:

1. Open platform configuration.
2. Update package/settings fields.
3. Save changes.

- Expected Result: Configuration updates persist and reload correctly.
- Actual Result: Not executed in this environment (requires super-admin credentialed UAT session).
- Status: Blocked
- Tester: GitHub Copilot (validation prep)
- Date: 2026-07-02
- Environment: Local release/v1.0 (no seeded UAT credentials provided)
- Defects Found: None (execution blocked)
- Evidence Reference: [ValidationEvidence.md](ValidationEvidence.md)

### Script SA-03: Manage subscriptions

- Preconditions: Platform exists with subscription metadata.
- Steps:

1. Open billing/subscription area.
2. Modify subscription tier/status.
3. Save and reload.

- Expected Result: Subscription changes are applied correctly.
- Actual Result: Not executed in this environment (billing/subscription workflow requires UAT tenancy data).
- Status: Blocked
- Tester: GitHub Copilot (validation prep)
- Date: 2026-07-02
- Environment: Local release/v1.0
- Defects Found: None (execution blocked)
- Evidence Reference: [ValidationEvidence.md](ValidationEvidence.md)

## Platform Admin Scripts

### Script PA-01: Import agents

- Preconditions: Platform Admin logged in.
- Steps:

1. Open agents management.
2. Create/import sample agents.
3. Validate records displayed.

- Expected Result: Agents are created and associated to platform.
- Actual Result: Not executed in this environment (platform admin credential and dataset not provided).
- Status: Blocked
- Tester: GitHub Copilot (validation prep)
- Date: 2026-07-02
- Environment: Local release/v1.0
- Defects Found: None (execution blocked)
- Evidence Reference: [ValidationEvidence.md](ValidationEvidence.md)

### Script PA-02: Plan routes

- Preconditions: Agents, drivers, vehicles available.
- Steps:

1. Open planner.
2. Create route plan for date/shift.
3. Save plan.

- Expected Result: Plan saved with expected trip grouping.
- Actual Result: Not executed in this environment (requires planner UAT data and role session).
- Status: Blocked
- Tester: GitHub Copilot (validation prep)
- Date: 2026-07-02
- Environment: Local release/v1.0
- Defects Found: None (execution blocked)
- Evidence Reference: [ValidationEvidence.md](ValidationEvidence.md)

### Script PA-03: Dispatch trips

- Preconditions: Planned routes available.
- Steps:

1. Dispatch planned trip.
2. Confirm trip state changes.
3. Confirm dispatch visibility to driver.

- Expected Result: Trip enters dispatched state and is visible downstream.
- Actual Result: Not executed in this environment (requires end-to-end role sessions and seeded trips).
- Status: Blocked
- Tester: GitHub Copilot (validation prep)
- Date: 2026-07-02
- Environment: Local release/v1.0
- Defects Found: None (execution blocked)
- Evidence Reference: [ValidationEvidence.md](ValidationEvidence.md)

### Script PA-04: Reassign driver

- Preconditions: Active trip and alternate driver available.
- Steps:

1. Trigger reassignment action.
2. Select alternate driver.
3. Confirm updated assignment.

- Expected Result: Driver assignment updates and audit/telemetry path is visible.
- Actual Result: Not executed in this environment (requires active dispatch and alternate driver setup).
- Status: Blocked
- Tester: GitHub Copilot (validation prep)
- Date: 2026-07-02
- Environment: Local release/v1.0
- Defects Found: None (execution blocked)
- Evidence Reference: [ValidationEvidence.md](ValidationEvidence.md)

### Script PA-05: Resolve emergencies

- Preconditions: Emergency alert exists.
- Steps:

1. Acknowledge emergency.
2. Assign responder.
3. Resolve with notes.

- Expected Result: Workflow progresses Open -> Acknowledged -> Resolved.
- Actual Result: Not executed in this environment (requires emergency scenario setup and role-based actors).
- Status: Blocked
- Tester: GitHub Copilot (validation prep)
- Date: 2026-07-02
- Environment: Local release/v1.0
- Defects Found: None (execution blocked)
- Evidence Reference: [ValidationEvidence.md](ValidationEvidence.md)

## Driver Scripts

### Script DR-01: Login

- Preconditions: Driver account active.
- Steps:

1. Login to driver interface.
2. Verify active session.

- Expected Result: Driver lands on authenticated dashboard.
- Actual Result: Not executed in this environment (requires driver credential set).
- Status: Blocked
- Tester: GitHub Copilot (validation prep)
- Date: 2026-07-02
- Environment: Local release/v1.0
- Defects Found: None (execution blocked)
- Evidence Reference: [ValidationEvidence.md](ValidationEvidence.md)

### Script DR-02: Accept trip

- Preconditions: Assigned trip pending driver response.
- Steps:

1. Open assigned trip.
2. Accept trip.

- Expected Result: Driver response updates to accepted.
- Actual Result: Not executed in this environment (requires active assigned trip for driver role).
- Status: Blocked
- Tester: GitHub Copilot (validation prep)
- Date: 2026-07-02
- Environment: Local release/v1.0
- Defects Found: None (execution blocked)
- Evidence Reference: [ValidationEvidence.md](ValidationEvidence.md)

### Script DR-03: Reject trip

- Preconditions: Assigned trip pending response.
- Steps:

1. Open assigned trip.
2. Reject trip.

- Expected Result: Driver response updates to rejected and reassignment path is triggered.
- Actual Result: Not executed in this environment (requires active assigned trip for driver role).
- Status: Blocked
- Tester: GitHub Copilot (validation prep)
- Date: 2026-07-02
- Environment: Local release/v1.0
- Defects Found: None (execution blocked)
- Evidence Reference: [ValidationEvidence.md](ValidationEvidence.md)

### Script DR-04: Navigate

- Preconditions: Active trip and location permission granted.
- Steps:

1. Start navigation flow.
2. Verify route opens and location updates are sent.

- Expected Result: Navigation and tracking are active.
- Actual Result: Not executed in this environment (requires browser geolocation-enabled manual run).
- Status: Blocked
- Tester: GitHub Copilot (validation prep)
- Date: 2026-07-02
- Environment: Local release/v1.0
- Defects Found: None (execution blocked)
- Evidence Reference: [ValidationEvidence.md](ValidationEvidence.md)

### Script DR-05: Complete trip

- Preconditions: Trip in progress.
- Steps:

1. Mark trip completed.
2. Verify downstream state updates.

- Expected Result: Trip is completed and related statuses are synchronized.
- Actual Result: Not executed in this environment (requires active trip progression sequence).
- Status: Blocked
- Tester: GitHub Copilot (validation prep)
- Date: 2026-07-02
- Environment: Local release/v1.0
- Defects Found: None (execution blocked)
- Evidence Reference: [ValidationEvidence.md](ValidationEvidence.md)

### Script DR-06: Trigger emergency

- Preconditions: Active trip.
- Steps:

1. Trigger emergency action.
2. Verify emergency appears in dashboard.

- Expected Result: Emergency alert is created and visible to operations.
- Actual Result: Not executed in this environment (requires coordinated driver and operations UAT session).
- Status: Blocked
- Tester: GitHub Copilot (validation prep)
- Date: 2026-07-02
- Environment: Local release/v1.0
- Defects Found: None (execution blocked)
- Evidence Reference: [ValidationEvidence.md](ValidationEvidence.md)

## Client Scripts

### Script CL-01: View live trips

- Preconditions: Client role logged in and active trips exist.
- Steps:

1. Open client dashboard.
2. View trip list/map.

- Expected Result: Live trip status is visible.
- Actual Result: Not executed in this environment (requires client account and seeded live trip data).
- Status: Blocked
- Tester: GitHub Copilot (validation prep)
- Date: 2026-07-02
- Environment: Local release/v1.0
- Defects Found: None (execution blocked)
- Evidence Reference: [ValidationEvidence.md](ValidationEvidence.md)

### Script CL-02: Track employees

- Preconditions: Trips with passenger/employee records exist.
- Steps:

1. Open tracking view.
2. Inspect employee transport status.

- Expected Result: Employee movement/status is visible and current.
- Actual Result: Not executed in this environment (requires client scope and passenger tracking data).
- Status: Blocked
- Tester: GitHub Copilot (validation prep)
- Date: 2026-07-02
- Environment: Local release/v1.0
- Defects Found: None (execution blocked)
- Evidence Reference: [ValidationEvidence.md](ValidationEvidence.md)

### Script CL-03: Review reports

- Preconditions: Historical trip data exists.
- Steps:

1. Open reports.
2. Review operational summary widgets.

- Expected Result: Reports load and reflect scoped platform data.
- Actual Result: Not executed in this environment (requires client credential and representative report dataset).
- Status: Blocked
- Tester: GitHub Copilot (validation prep)
- Date: 2026-07-02
- Environment: Local release/v1.0
- Defects Found: None (execution blocked)
- Evidence Reference: [ValidationEvidence.md](ValidationEvidence.md)
