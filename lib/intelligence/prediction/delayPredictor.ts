import { priorityFromScore } from "../core/scoringEngine";
import type { IntelligencePrediction, IntelligenceRoute, IntelligenceTrip } from "../core/intelligenceTypes";

export function predictTripDelay(trip: IntelligenceTrip, routes: IntelligenceRoute[], currentEmergencies: number): IntelligencePrediction {
  const matchingRoutes = routes.filter((route) => route.routeGroup === trip.routeGroup);
  const routeDelay =
    matchingRoutes.length === 0
      ? 0
      : matchingRoutes.reduce((sum, route) => sum + route.historicalDelayMinutes + (route.trafficDelayMinutes || 0), 0) /
        matchingRoutes.length;
  const emergencyImpact = currentEmergencies > 0 ? 5 : 0;
  const demandImpact = Math.max(0, trip.passengerCount - 8);
  const value = Math.round(routeDelay + emergencyImpact + demandImpact);

  return {
    id: `delay-${trip.id}`,
    label: `${trip.code} delay`,
    value,
    unit: "minutes",
    priority: priorityFromScore(value * 4),
    explanation: [`Route delay ${Math.round(routeDelay)} min`, `Emergency impact ${emergencyImpact} min`],
  };
}
