import type { AiOperationsContext, AiRiskLevel, DelayPrediction } from "./aiTypes";

function riskFromDelay(minutes: number): AiRiskLevel {
  if (minutes >= 20) return "High";
  if (minutes >= 10) return "Medium";
  return "Low";
}

export function predictDelay(context: AiOperationsContext): DelayPrediction {
  const matchingRoutes = context.routes.filter((route) => route.routeGroup === context.trip.routeGroup);
  const historicalAverage =
    matchingRoutes.length === 0
      ? 0
      : matchingRoutes.reduce((sum, route) => sum + route.historicalDelayMinutes, 0) / matchingRoutes.length;
  const trafficAverage =
    matchingRoutes.length === 0
      ? 0
      : matchingRoutes.reduce((sum, route) => sum + (route.trafficDelayMinutes || 0), 0) / matchingRoutes.length;
  const emergencyImpact = context.currentEmergencies > 0 ? 4 : 0;
  const demandImpact = Math.max(0, context.trip.passengerCount - 8);
  const predictedDelayMinutes = Math.round(historicalAverage + trafficAverage + emergencyImpact + demandImpact);

  return {
    predictedDelayMinutes,
    riskLevel: riskFromDelay(predictedDelayMinutes),
    reasons: [
      `Historical delay average ${Math.round(historicalAverage)} min`,
      context.activeTrafficDataAvailable ? `Traffic impact ${Math.round(trafficAverage)} min` : "Traffic data unavailable",
      context.currentEmergencies > 0 ? "Active emergency may affect dispatch capacity" : "No active emergency pressure",
      demandImpact > 0 ? "Passenger demand is above normal route load" : "Passenger demand within normal range",
    ],
  };
}
