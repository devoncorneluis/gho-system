import type { TelemetryEvent, TelemetryEventInput } from "./observabilityTypes";

const telemetryStore: TelemetryEvent[] = [];

function buildTelemetryId(): string {
  return `tel-${Date.now()}-${telemetryStore.length + 1}`;
}

export function recordTelemetryEvent(input: TelemetryEventInput): TelemetryEvent {
  const event: TelemetryEvent = {
    ...input,
    id: buildTelemetryId(),
    happenedAt: input.happenedAt ?? new Date().toISOString(),
  };

  telemetryStore.push(event);
  return event;
}

export function listTelemetryEvents(platformId?: string): TelemetryEvent[] {
  if (!platformId) return [...telemetryStore];
  return telemetryStore.filter((event) => event.platformId === platformId);
}

export function clearTelemetryEvents(): void {
  telemetryStore.length = 0;
}

export function seedDemoTelemetryEvents(platformId = "platform-demo"): void {
  if (telemetryStore.length > 0) return;

  const operators = ["ops-amy", "ops-jordan", "ops-kai"] as const;
  const baseTime = Date.now() - 90 * 60_000;

  for (let i = 0; i < 40; i += 1) {
    const operatorId = operators[i % operators.length];
    const actionCycle = i % 8;
    const action =
      actionCycle === 0
        ? "approve_recommendation"
        : actionCycle === 1
          ? "reassign_driver"
          : actionCycle === 2
            ? "notify_driver"
            : actionCycle === 3
              ? "escalate"
              : actionCycle === 4
                ? "open_trip"
                : actionCycle === 5
                  ? "resolve_alert"
                  : actionCycle === 6
                    ? "create_emergency_ticket"
                    : "manual_override";

    const blocked = i % 9 === 0;
    const caution = !blocked && i % 5 === 0;
    const failed = i % 11 === 0;

    const outcome = blocked ? "blocked" : failed ? "failed" : caution ? "caution" : "success";

    recordTelemetryEvent({
      action,
      outcome,
      operatorId,
      platformId,
      screen: i % 7 === 0 ? "operator_analytics" : "operations",
      workflow: i % 6 === 0 ? "auto_reassign" : "sla_watchdog",
      reason: blocked ? "Monitoring guardrail blocked action." : caution ? "Monitoring degraded caution." : undefined,
      durationMs: 600 + (i % 10) * 120,
      dispatchId: `dispatch-${(i % 12) + 1}`,
      happenedAt: new Date(baseTime + i * 120_000).toISOString(),
    });
  }
}
