import type { PerformanceMetricsSnapshot } from "./observabilityTypes";
import { listTelemetryEvents, seedDemoTelemetryEvents } from "./telemetryEngine";

function percentile(values: number[], p: number): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.min(sorted.length - 1, Math.ceil((p / 100) * sorted.length) - 1);
  return sorted[index];
}

export function getPerformanceMetricsSnapshot(platformId = "platform-demo"): PerformanceMetricsSnapshot {
  seedDemoTelemetryEvents(platformId);
  const events = listTelemetryEvents(platformId);
  const actionDurations = events.map((event) => event.durationMs ?? 0).filter((value) => value > 0);
  const dispatchDurations = events
    .filter((event) => event.action !== "screen_view")
    .map((event) => event.durationMs ?? 0)
    .filter((value) => value > 0);

  const avgAction =
    actionDurations.length > 0
      ? Number((actionDurations.reduce((sum, value) => sum + value, 0) / actionDurations.length).toFixed(2))
      : 0;

  const avgDispatch =
    dispatchDurations.length > 0
      ? Number((dispatchDurations.reduce((sum, value) => sum + value, 0) / dispatchDurations.length).toFixed(2))
      : 0;

  return {
    averageActionLatencyMs: avgAction,
    p95ActionLatencyMs: percentile(actionDurations, 95),
    averageDispatchDecisionMs: avgDispatch,
    generatedAt: new Date().toISOString(),
  };
}
