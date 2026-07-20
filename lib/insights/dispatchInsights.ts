import { getOperatorAnalyticsSummary } from "../observability/operatorAnalytics";
import { getPerformanceMetricsSnapshot } from "../observability/performanceMetrics";

export function buildDispatchInsights(platformId = "platform-demo") {
  const operator = getOperatorAnalyticsSummary(platformId);
  const performance = getPerformanceMetricsSnapshot(platformId);

  return {
    averageDispatchDecisionMs: performance.averageDispatchDecisionMs,
    blockedDispatches: operator.blockedDispatches,
    averageClicksPerDispatch: operator.averageClicksPerDispatch,
    recommendationApprovalRate:
      operator.dispatchAttemptsToday > 0
        ? Number(((operator.recommendationApprovals / operator.dispatchAttemptsToday) * 100).toFixed(2))
        : 0,
  };
}
