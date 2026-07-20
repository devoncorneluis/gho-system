import type { TelemetryEvent } from "./observabilityTypes";

export function telemetryEventToAuditLine(event: TelemetryEvent): string {
  return [
    "Telemetry",
    `${event.outcome.toUpperCase()}`,
    `action=${event.action}`,
    `operator=${event.operatorId}`,
    `platform=${event.platformId}`,
    `screen=${event.screen}`,
    `reason=${event.reason ?? "n/a"}`,
    `at=${event.happenedAt}`,
  ].join(" | ");
}

export function appendTelemetryToAuditTrail(auditTrail: string[], event?: TelemetryEvent): string[] {
  if (!event) return [...auditTrail];
  return [telemetryEventToAuditLine(event), ...auditTrail];
}
