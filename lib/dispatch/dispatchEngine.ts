import { scoreDriver, type DriverScore } from "./driverScoring";
import { scoreVehicle, type VehicleScore } from "./vehicleScoring";
import { scoreRoute, type RouteRecommendation } from "./routeScoring";
import { optimizeTripPlan, type OptimizedTripPlan } from "./tripOptimizer";

export type DispatchRecommendation = {
  bestDriver: DriverScore;
  bestVehicle: VehicleScore;
  bestRoute: RouteRecommendation;
  optimizedPlan: OptimizedTripPlan;
};

export function buildDispatchRecommendation(
  tripId: string,
  driverId: string,
  vehicleId: string,
  routeId: string,
  driverStatus: string,
  responseTimeMinutes: number,
  completedTrips: number,
  vehicleStatus: string,
  capacity: number,
  fuelLevel: number,
  distanceKm: number,
  trafficLevel: number,
  demand: number,
): DispatchRecommendation {
  const bestDriver = scoreDriver(driverId, driverStatus, responseTimeMinutes, completedTrips);
  const bestVehicle = scoreVehicle(vehicleId, vehicleStatus, capacity, fuelLevel);
  const bestRoute = scoreRoute(routeId, distanceKm, trafficLevel, demand);
  const optimizedPlan = optimizeTripPlan(tripId, driverId, vehicleId, routeId, bestDriver.score, bestVehicle.score, bestRoute.score);

  return {
    bestDriver,
    bestVehicle,
    bestRoute,
    optimizedPlan,
  };
}
