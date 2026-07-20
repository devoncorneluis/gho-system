import type { SecurityAuditEvent } from "./securityAudit";
import { createSecurityAuditEvent, summarizeSecurityAudit } from "./securityAudit";

export type { SecurityAuditEvent };

export interface AuditValidationResult {
  valid: boolean;
  errors: string[];
}

export function validateAuditEvent(event: SecurityAuditEvent): AuditValidationResult {
  const errors: string[] = [];

  if (!event.userId) errors.push("userId is required.");
  if (!event.platformId) errors.push("platformId is required.");
  if (!event.action) errors.push("action is required.");
  if (!event.createdAt) errors.push("createdAt is required.");

  const createdAt = new Date(event.createdAt).getTime();
  if (Number.isNaN(createdAt)) {
    errors.push("createdAt is not a valid ISO date.");
  }

  if (!event.success && !event.reason) {
    errors.push("reason is required for failed audit events.");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

export function validateAuditCoverage(events: SecurityAuditEvent[], minimumEvents = 1): AuditValidationResult {
  const errors: string[] = [];

  if (events.length < minimumEvents) {
    errors.push(`Expected at least ${minimumEvents} audit events, got ${events.length}.`);
  }

  const invalidEvents = events.filter((event) => !validateAuditEvent(event).valid);
  if (invalidEvents.length > 0) {
    errors.push(`${invalidEvents.length} audit events failed validation.`);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

export function createValidatedAuditEvent(
  input: Omit<SecurityAuditEvent, "id" | "createdAt">
): { event: SecurityAuditEvent; validation: AuditValidationResult } {
  const event = createSecurityAuditEvent(input);
  return {
    event,
    validation: validateAuditEvent(event),
  };
}

export function summarizeValidatedAudit(events: SecurityAuditEvent[]) {
  return {
    ...summarizeSecurityAudit(events),
    validation: validateAuditCoverage(events),
  };
}
