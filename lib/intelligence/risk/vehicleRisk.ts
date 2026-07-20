import { priorityFromScore } from "../core/scoringEngine";
import type { IntelligenceRisk, IntelligenceVehicle } from "../core/intelligenceTypes";

export function assessVehicleRisk(vehicle: IntelligenceVehicle): IntelligenceRisk {
  const score = Math.min(100, Math.round(vehicle.maintenanceRisk * 70 + Math.max(0, vehicle.utilizationRate - 80)));

  return {
    id: `vehicle-risk-${vehicle.id}`,
    label: `${vehicle.name} vehicle risk`,
    score,
    priority: priorityFromScore(score),
    reasons: [`Maintenance risk ${Math.round(vehicle.maintenanceRisk * 100)}%`, `Utilization ${vehicle.utilizationRate}%`],
  };
}
