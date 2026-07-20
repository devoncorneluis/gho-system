import type { AiRouteInput, AiScore } from "./aiTypes";

function clamp(value: number, min = 0, max = 100): number {
  return Math.min(max, Math.max(min, value));
}

export function scoreRoute(route: AiRouteInput): AiScore {
  const distanceScore = clamp(35 - route.distanceKm, 0, 35);
  const delayPenalty = clamp((route.historicalDelayMinutes + (route.trafficDelayMinutes || 0)) * 2, 0, 35);
  const predictabilityScore = route.historicalDelayMinutes <= 5 ? 30 : route.historicalDelayMinutes <= 12 ? 18 : 8;
  const score = Math.round(clamp(distanceScore + predictabilityScore + 35 - delayPenalty));

  return {
    id: route.id,
    name: route.name,
    score,
    reasons: [
      `Route group ${route.routeGroup}`,
      `Distance ${route.distanceKm}km`,
      `Historical delay ${route.historicalDelayMinutes} min`,
      route.trafficDelayMinutes === undefined
        ? "Live traffic unavailable"
        : `Traffic delay ${route.trafficDelayMinutes} min`,
    ],
  };
}

export function rankRoutes(routes: AiRouteInput[]): AiScore[] {
  return routes.map(scoreRoute).sort((a, b) => b.score - a.score);
}
