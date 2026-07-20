import { getSystemMetricsSnapshot } from "../observability/systemMetrics";

export function buildFleetInsights(platformId = "platform-demo") {
  const system = getSystemMetricsSnapshot(platformId);

  return {
    fleetRiskLevel:
      system.workflowFailureRate > 12 ? "high" : system.workflowFailureRate > 6 ? "moderate" : "low",
    blockPressure: system.blockedRate,
    commentary:
      system.blockedRate > 15
        ? "Fleet allocation is facing elevated decision friction."
        : "Fleet decision flow appears stable.",
  };
}
