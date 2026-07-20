export type RouteRecommendation = {
  routeId: string;
  score: number;
  reasons: string[];
};

export function scoreRoute(routeId: string, distanceKm: number, trafficLevel: number, demand: number): RouteRecommendation {
  const distancePenalty = Math.max(0, distanceKm / 30);
  const trafficPenalty = trafficLevel / 10;
  const demandBonus = Math.min(1, demand / 5);
  const score = Math.max(0, Math.round((100 - (distancePenalty * 25 + trafficPenalty * 30) + demandBonus * 20) * 10) / 10);

  return {
    routeId,
    score,
    reasons: [
      `${distanceKm} km route length`,
      trafficLevel < 4 ? "Traffic conditions are favorable" : "Traffic conditions are heavy",
      demand > 2 ? "Demand is elevated" : "Demand is moderate",
    ],
  };
}
