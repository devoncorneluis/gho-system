# Automation

## Engines

- automationEngine orchestrates event evaluation.
- workflowEngine runs workflow definitions.
- escalationEngine converts signals into prioritized actions.
- notificationRouter centralizes channel routing.
- reassignmentEngine proposes driver/vehicle/route alternatives.

## Event Flow

1. Event enters automationEngine.
2. Rules are evaluated.
3. Workflows run for matching event type.
4. Escalations and notifications are produced.
5. Reassignment is generated when required.

## Governance

- No dashboard should embed automation business rules.
- Use centralized configuration and feature flags.
- Keep audit trail entries for all significant actions.
