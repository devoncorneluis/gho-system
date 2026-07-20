import type { FleetMetrics } from "../../types/analytics";

export function calculateFleetUtilization(activeVehicles: number, totalVehicles: number): number {
  if (!totalVehicles) return 0;
  return Math.round((activeVehicles / totalVehicles) * 100);
}

export function calculateVehicleAvailability(availableVehicles: number, totalVehicles: number): number {
  if (!totalVehicles) return 0;
  return Math.round((availableVehicles / totalVehicles) * 100);
}

export function buildFleetMetricsFromNumbers(totalVehicles: number, availableVehicles: number, activeVehicles: number): FleetMetrics {
  return {
    totalVehicles,
    activeVehicles,
    availableVehicles,
    utilisation: calculateFleetUtilization(activeVehicles, totalVehicles),
    availability: calculateVehicleAvailability(availableVehicles, totalVehicles),
  };
}
