import type { ExecutiveTelemetrySummary } from "../observability/observabilityTypes";
import { getOperatorAnalyticsSummary } from "../observability/operatorAnalytics";
import { getPerformanceMetricsSnapshot } from "../observability/performanceMetrics";

export function buildExecutiveInsights(platformId = "platform-demo"): ExecutiveTelemetrySummary {
  const operator = getOperatorAnalyticsSummary(platformId);
  const performance = getPerformanceMetricsSnapshot(platformId);

  const automationAcceptance =
    operator.dispatchAttemptsToday > 0
      ? Number(((operator.recommendationApprovals / operator.dispatchAttemptsToday) * 100).toFixed(2))
      : 0;

  const manualInterventionRate =
    operator.dispatchAttemptsToday > 0
      ? Number(((operator.manualOverrides / operator.dispatchAttemptsToday) * 100).toFixed(2))
      : 0;

  const operatorEfficiency = Math.max(0, Number((100 - manualInterventionRate - (operator.blockedDispatches / 2)).toFixed(2)));
  const workflowCompletion = Math.max(0, Number((100 - operator.blockedDispatches).toFixed(2)));
  const criticalEscalations = Math.round(operator.blockedDispatches * 0.6);
  const operationalCostIndex = Number((120 - operatorEfficiency + manualInterventionRate).toFixed(2));

  return {
    automationAcceptance,
    operatorEfficiency,
    manualInterventionRate,
    averageDispatchTimeMs: performance.averageDispatchDecisionMs,
    recommendationAdoption: automationAcceptance,
    workflowCompletion,
    criticalEscalations,
    operationalCostIndex,
  };
}
