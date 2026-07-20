import { rankScores, weightedScore } from "../core/scoringEngine";
import type { IntelligenceScore, IntelligenceTrip, IntelligenceVehicle } from "../core/intelligenceTypes";

export function scoreVehicleForTrip(vehicle: IntelligenceVehicle, trip: IntelligenceTrip): IntelligenceScore {
  const availability = vehicle.status === "Available" ? 100 : vehicle.status === "On Trip" ? 35 : 0;
  const capacityFit = vehicle.capacity >= trip.passengerCount ? Math.max(40, 100 - (vehicle.capacity - trip.passengerCount) * 5) : 0;
  const utilization = Math.max(0, 100 - vehicle.utilizationRate);
  const maintenance = Math.max(0, 100 - vehicle.maintenanceRisk * 100);
  const score = weightedScore([
    { value: availability, weight: 0.35 },
    { value: capacityFit, weight: 0.3 },
    { value: utilization, weight: 0.2 },
    { value: maintenance, weight: 0.15 },
  ]);

  return {
    id: vehicle.id,
    label: vehicle.name,
    score,
    reasons: [
      `Status: ${vehicle.status}`,
      `Capacity: ${vehicle.capacity}`,
      `Utilization: ${vehicle.utilizationRate}%`,
      `Maintenance risk: ${Math.round(vehicle.maintenanceRisk * 100)}%`,
    ],
  };
}

export function recommendVehicles(vehicles: IntelligenceVehicle[], trip: IntelligenceTrip): IntelligenceScore[] {
  return rankScores(vehicles.map((vehicle) => scoreVehicleForTrip(vehicle, trip)));
}
