import type { AiScore, AiVehicleInput } from "./aiTypes";

function clamp(value: number, min = 0, max = 100): number {
  return Math.min(max, Math.max(min, value));
}

export function scoreVehicle(vehicle: AiVehicleInput): AiScore {
  const availabilityScore = vehicle.status === "Available" ? 35 : vehicle.status === "On Trip" ? 10 : 0;
  const capacityFit =
    vehicle.capacity >= vehicle.requiredCapacity
      ? clamp(30 - (vehicle.capacity - vehicle.requiredCapacity) * 2, 12, 30)
      : -25;
  const utilizationScore = clamp(25 - vehicle.utilizationToday * 0.4, 0, 25);
  const maintenancePenalty = clamp(vehicle.maintenanceRisk * 20, 0, 20);
  const score = Math.round(clamp(availabilityScore + capacityFit + utilizationScore - maintenancePenalty));

  return {
    id: vehicle.id,
    name: vehicle.name,
    score,
    reasons: [
      vehicle.status === "Available" ? "Vehicle available" : `Vehicle status: ${vehicle.status}`,
      vehicle.capacity >= vehicle.requiredCapacity
        ? `Capacity fits ${vehicle.requiredCapacity} passengers`
        : "Capacity below passenger demand",
      vehicle.utilizationToday <= 70 ? "Utilization within target" : "High utilization today",
      vehicle.maintenanceRisk <= 0.3 ? "Low maintenance risk" : "Maintenance risk requires review",
    ],
  };
}

export function rankVehicles(vehicles: AiVehicleInput[]): AiScore[] {
  return vehicles.map(scoreVehicle).sort((a, b) => b.score - a.score);
}
