export type OptimizedTripPlan = {
  tripId: string;
  assignedDriverId: string;
  assignedVehicleId: string;
  routeId: string;
  score: number;
};

export function optimizeTripPlan(tripId: string, driverId: string, vehicleId: string, routeId: string, driverScore: number, vehicleScore: number, routeScore: number): OptimizedTripPlan {
  const score = Math.round((driverScore * 0.45 + vehicleScore * 0.3 + routeScore * 0.25) * 10) / 10;

  return {
    tripId,
    assignedDriverId: driverId,
    assignedVehicleId: vehicleId,
    routeId,
    score,
  };
}
