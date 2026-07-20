import type { HealthMetricsSnapshot } from "./observabilityTypes";
import { getSystemMetricsSnapshot } from "./systemMetrics";

export function getHealthMetricsSnapshot(platformId = "platform-demo"): HealthMetricsSnapshot {
  const system = getSystemMetricsSnapshot(platformId);

  const operationsHealth =
    system.blockedRate >= 25 || system.workflowFailureRate >= 20
      ? "down"
      : system.blockedRate >= 12 || system.workflowFailureRate >= 10
        ? "degraded"
        : "healthy";

  return {
    operationsHealth,
    alertCount: Math.round(system.blockedRate / 2 + system.workflowFailureRate),
    realtimeReliability: Math.max(0, Number((100 - system.cautionRate - system.workflowFailureRate).toFixed(2))),
    generatedAt: new Date().toISOString(),
  };
}
