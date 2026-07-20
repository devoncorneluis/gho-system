import type { OperatorAnalyticsSummary, OperatorWorkload, TelemetryEvent } from "./observabilityTypes";
import { listTelemetryEvents, seedDemoTelemetryEvents } from "./telemetryEngine";

function average(values: number[]): number {
  if (values.length === 0) return 0;
  const total = values.reduce((sum, value) => sum + value, 0);
  return Number((total / values.length).toFixed(2));
}

function buildFailureRanking(events: TelemetryEvent[]): Array<{ reason: string; count: number }> {
  const map = new Map<string, number>();
  for (const event of events) {
    if (event.outcome !== "blocked" && event.outcome !== "failed") continue;
    const reason = event.reason ?? "Unknown failure";
    map.set(reason, (map.get(reason) ?? 0) + 1);
  }

  return [...map.entries()]
    .map(([reason, count]) => ({ reason, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
}

function buildWorkload(events: TelemetryEvent[]): OperatorWorkload[] {
  const map = new Map<string, OperatorWorkload>();

  for (const event of events) {
    const workload = map.get(event.operatorId) ?? {
      operatorId: event.operatorId,
      attempts: 0,
      blocked: 0,
      cautioned: 0,
      success: 0,
    };

    workload.attempts += 1;
    if (event.outcome === "blocked") workload.blocked += 1;
    if (event.outcome === "caution") workload.cautioned += 1;
    if (event.outcome === "success") workload.success += 1;

    map.set(event.operatorId, workload);
  }

  return [...map.values()].sort((a, b) => b.attempts - a.attempts);
}

export function getOperatorAnalyticsSummary(platformId = "platform-demo"): OperatorAnalyticsSummary {
  seedDemoTelemetryEvents(platformId);
  const events = listTelemetryEvents(platformId);

  const dispatchActions = new Set([
    "approve_recommendation",
    "reassign_driver",
    "notify_driver",
    "escalate",
    "open_trip",
    "resolve_alert",
  ]);

  const dispatchEvents = events.filter((event) => dispatchActions.has(event.action));
  const dispatchIds = new Set(dispatchEvents.map((event) => event.dispatchId).filter(Boolean));
  const decisionTimes = dispatchEvents.map((event) => event.durationMs ?? 0).filter((duration) => duration > 0);

  return {
    dispatchAttemptsToday: dispatchEvents.length,
    blockedDispatches: dispatchEvents.filter((event) => event.outcome === "blocked").length,
    manualOverrides: events.filter((event) => event.action === "manual_override").length,
    recommendationApprovals: events.filter((event) => event.action === "approve_recommendation" && event.outcome === "success")
      .length,
    recommendationIgnores: events.filter((event) => event.action === "resolve_alert").length,
    averageDecisionTimeMs: average(decisionTimes),
    emergencyAcknowledgements: events.filter((event) => event.action === "create_emergency_ticket").length,
    mostCommonFailures: buildFailureRanking(events),
    operatorWorkload: buildWorkload(events),
    averageClicksPerDispatch: dispatchIds.size > 0 ? Number((dispatchEvents.length / dispatchIds.size).toFixed(2)) : 0,
  };
}
