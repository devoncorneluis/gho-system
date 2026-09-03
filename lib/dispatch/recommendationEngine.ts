import {
  scoreDriver,
  scoreVehicle,
} from "./scoringEngine";

import {
  capacityStatus,
} from "./capacityEngine";

import {
  detectDispatchConflicts,
  DispatchConflict,
} from "./conflictEngine";

export type DriverCandidate = {
  id: string;
  name: string;
  available: boolean;
  onDuty: boolean;
  hasActiveTrip: boolean;
  hasIncident: boolean;
  gpsFresh: boolean;
};

export type VehicleCandidate = {
  id: string;
  name: string;
  capacity: number;
  available: boolean;
  assigned: boolean;
};

export type Recommendation = {
  driver: DriverCandidate;
  vehicle: VehicleCandidate;
  driverScore: number;
  vehicleScore: number;
  conflicts: DispatchConflict[];
};

export function recommendDispatch(
  drivers: DriverCandidate[],
  vehicles: VehicleCandidate[],
  passengerCount: number
): Recommendation[] {

  const recommendations: Recommendation[] = [];

  for (const driver of drivers) {

    const driverScore = scoreDriver({
      available: driver.available,
      onDuty: driver.onDuty,
      hasActiveTrip: driver.hasActiveTrip,
      hasIncident: driver.hasIncident,
      gpsFresh: driver.gpsFresh,
    });

    for (const vehicle of vehicles) {

      const capacity = capacityStatus(
        passengerCount,
        vehicle.capacity
      );

      const vehicleScore = scoreVehicle({
        available: vehicle.available,
        assigned: vehicle.assigned,
        capacityOk: capacity.fits,
      });

      const conflicts = detectDispatchConflicts({
        driverAssigned: driver.hasActiveTrip,
        vehicleAssigned: vehicle.assigned,
        capacityOk: capacity.fits,
        driverAvailable: driver.available,
      });

      recommendations.push({
        driver,
        vehicle,
        driverScore,
        vehicleScore,
        conflicts,
      });

    }
  }

  return recommendations.sort((a, b) => {

    const totalA =
      a.driverScore + a.vehicleScore;

    const totalB =
      b.driverScore + b.vehicleScore;

    return totalB - totalA;

  });

}