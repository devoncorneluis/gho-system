import { getOperatorAnalyticsSummary } from "../observability/operatorAnalytics";

export function buildOperatorInsights(platformId = "platform-demo") {
  const summary = getOperatorAnalyticsSummary(platformId);

  return {
    strongestSignal:
      summary.blockedDispatches > 0
        ? "Dispatch guardrails are actively preventing risky actions."
        : "Operators are flowing without major guardrail friction.",
    decisionLatencyBand:
      summary.averageDecisionTimeMs > 1800
        ? "High"
        : summary.averageDecisionTimeMs > 1200
          ? "Moderate"
          : "Low",
    workloadLeaders: summary.operatorWorkload.slice(0, 3),
  };
}
