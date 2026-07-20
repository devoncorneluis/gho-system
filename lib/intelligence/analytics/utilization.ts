import type { IntelligenceInsight, IntelligenceVehicle } from "../core/intelligenceTypes";

export function calculateUtilizationInsight(vehicles: IntelligenceVehicle[]): IntelligenceInsight {
  const average =
    vehicles.length === 0 ? 0 : Math.round(vehicles.reduce((sum, vehicle) => sum + vehicle.utilizationRate, 0) / vehicles.length);

  return {
    id: "vehicle-utilization",
    title: "Vehicle utilization",
    value: `${average}%`,
    status: average >= 90 ? "risk" : average >= 75 ? "watch" : "healthy",
    explanation: "Average utilization across fleet.",
  };
}
