import { getHealthMetricsSnapshot } from "../observability/healthMetrics";
import { getOperatorAnalyticsSummary } from "../observability/operatorAnalytics";

export function buildCompanyInsights(platformId = "platform-demo") {
  const health = getHealthMetricsSnapshot(platformId);
  const operator = getOperatorAnalyticsSummary(platformId);

  return {
    operationsHealth: health.operationsHealth,
    interventionRate:
      operator.dispatchAttemptsToday > 0
        ? Number(((operator.manualOverrides / operator.dispatchAttemptsToday) * 100).toFixed(2))
        : 0,
    recommendationAdoption:
      operator.dispatchAttemptsToday > 0
        ? Number(((operator.recommendationApprovals / operator.dispatchAttemptsToday) * 100).toFixed(2))
        : 0,
  };
}
