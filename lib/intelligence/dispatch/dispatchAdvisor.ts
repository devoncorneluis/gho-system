import { rankScores, weightedScore } from "../core/scoringEngine";
import type { IntelligenceDriver, IntelligenceScore, IntelligenceTrip } from "../core/intelligenceTypes";

export function scoreDriverForTrip(driver: IntelligenceDriver, trip: IntelligenceTrip): IntelligenceScore {
  const availability = driver.availability === "Available" ? 100 : driver.availability === "On Trip" ? 35 : 0;
  const workload = Math.max(0, 100 - driver.workload * 12);
  const proximity = driver.distanceToPickupKm === undefined ? 60 : Math.max(0, 100 - driver.distanceToPickupKm * 8);
  const reliability = Math.max(0, driver.onTimeRate - driver.cancellationRate * 100 - driver.incidentCount * 8);
  const score = weightedScore([
    { value: availability, weight: 0.35 },
    { value: workload, weight: 0.2 },
    { value: proximity, weight: 0.2 },
    { value: reliability, weight: 0.25 },
  ]);

  return {
    id: driver.id,
    label: driver.name,
    score,
    reasons: [
      `Availability: ${driver.availability}`,
      `Workload: ${driver.workload}`,
      `On-time rate: ${driver.onTimeRate}%`,
      `Trip ${trip.code} passenger count: ${trip.passengerCount}`,
    ],
  };
}

export function recommendDrivers(drivers: IntelligenceDriver[], trip: IntelligenceTrip): IntelligenceScore[] {
  return rankScores(drivers.map((driver) => scoreDriverForTrip(driver, trip)));
}
