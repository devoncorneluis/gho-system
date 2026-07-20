import { rankScores, weightedScore } from "../core/scoringEngine";
import type { IntelligenceRoute, IntelligenceScore, IntelligenceTrip } from "../core/intelligenceTypes";

export function scoreRouteForTrip(route: IntelligenceRoute, trip: IntelligenceTrip): IntelligenceScore {
  const distance = Math.max(0, 100 - route.distanceKm * 3);
  const delay = Math.max(0, 100 - (route.historicalDelayMinutes + (route.trafficDelayMinutes || 0)) * 5);
  const groupFit = route.routeGroup === trip.routeGroup ? 100 : 35;
  const score = weightedScore([
    { value: distance, weight: 0.3 },
    { value: delay, weight: 0.4 },
    { value: groupFit, weight: 0.3 },
  ]);

  return {
    id: route.id,
    label: route.name,
    score,
    reasons: [
      `Distance: ${route.distanceKm}km`,
      `Historical delay: ${route.historicalDelayMinutes} min`,
      route.trafficDelayMinutes === undefined ? "Traffic unavailable" : `Traffic delay: ${route.trafficDelayMinutes} min`,
    ],
  };
}

export function recommendRoutes(routes: IntelligenceRoute[], trip: IntelligenceTrip): IntelligenceScore[] {
  return rankScores(routes.map((route) => scoreRouteForTrip(route, trip)));
}
