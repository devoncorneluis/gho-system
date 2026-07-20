import type { IntelligenceInsight, IntelligenceRoute, IntelligenceVehicle } from "../core/intelligenceTypes";

export function calculateCostInsight(vehicles: IntelligenceVehicle[], routes: IntelligenceRoute[]): IntelligenceInsight {
  const avgCost = vehicles.length === 0 ? 0 : vehicles.reduce((sum, vehicle) => sum + vehicle.operatingCostPerKm, 0) / vehicles.length;
  const avgDistance = routes.length === 0 ? 0 : routes.reduce((sum, route) => sum + route.distanceKm, 0) / routes.length;
  const estimated = Math.round(avgCost * avgDistance);

  return {
    id: "trip-cost",
    title: "Estimated trip cost",
    value: `R${estimated}`,
    status: estimated <= 250 ? "healthy" : estimated <= 400 ? "watch" : "risk",
    explanation: "Estimated from average vehicle operating cost and route distance.",
  };
}
