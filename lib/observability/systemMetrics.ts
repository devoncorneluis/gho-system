import type { SystemMetricsSnapshot } from "./observabilityTypes";
import { listTelemetryEvents, seedDemoTelemetryEvents } from "./telemetryEngine";

export function getSystemMetricsSnapshot(platformId = "platform-demo"): SystemMetricsSnapshot {
  seedDemoTelemetryEvents(platformId);
  const events = listTelemetryEvents(platformId);

  if (events.length === 0) {
    return {
      telemetryEventsLastHour: 0,
      blockedRate: 0,
      cautionRate: 0,
      workflowFailureRate: 0,
      generatedAt: new Date().toISOString(),
    };
  }

  const lastHourCutoff = Date.now() - 60 * 60_000;
  const lastHourEvents = events.filter((event) => new Date(event.happenedAt).getTime() >= lastHourCutoff);
  const blocked = events.filter((event) => event.outcome === "blocked").length;
  const caution = events.filter((event) => event.outcome === "caution").length;
  const failedWorkflow = events.filter((event) => event.action === "workflow_execution" && event.outcome === "failed").length;

  return {
    telemetryEventsLastHour: lastHourEvents.length,
    blockedRate: Number(((blocked / events.length) * 100).toFixed(2)),
    cautionRate: Number(((caution / events.length) * 100).toFixed(2)),
    workflowFailureRate: Number(((failedWorkflow / events.length) * 100).toFixed(2)),
    generatedAt: new Date().toISOString(),
  };
}
