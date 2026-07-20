import type { AiDriverInput, AiScore } from "./aiTypes";

function clamp(value: number, min = 0, max = 100): number {
  return Math.min(max, Math.max(min, value));
}

export function scoreDriver(driver: AiDriverInput): AiScore {
  const availabilityScore = driver.availability === "Available" ? 35 : driver.availability === "On Trip" ? 10 : 0;
  const workloadScore = clamp(25 - driver.workloadToday * 3, 0, 25);
  const performanceScore = clamp(driver.onTimePercentage * 0.25, 0, 25);
  const reliabilityPenalty = clamp(driver.cancellationRate * 50 + driver.emergencyIncidents * 4, 0, 20);
  const proximityScore =
    driver.distanceToPickupKm === undefined ? 8 : clamp(15 - driver.distanceToPickupKm * 1.5, 0, 15);
  const score = Math.round(clamp(availabilityScore + workloadScore + performanceScore + proximityScore - reliabilityPenalty));

  return {
    id: driver.id,
    name: driver.name,
    score,
    reasons: [
      driver.availability === "Available" ? "Available for dispatch" : `Availability: ${driver.availability}`,
      driver.workloadToday <= 3 ? "Low workload today" : "Higher workload today",
      `On-time score ${driver.onTimePercentage}%`,
      driver.distanceToPickupKm === undefined
        ? "Pickup proximity not measured"
        : `Pickup distance ${driver.distanceToPickupKm.toFixed(1)}km`,
    ],
  };
}

export function rankDrivers(drivers: AiDriverInput[]): AiScore[] {
  return drivers.map(scoreDriver).sort((a, b) => b.score - a.score);
}
