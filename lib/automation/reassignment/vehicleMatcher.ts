import type { VehicleCandidate } from "../../../types/recommendation";

export interface VehicleMatchResult {
  candidate: VehicleCandidate;
  score: number;
  reasons: string[];
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function matchVehicle(candidate: VehicleCandidate, passengerCount: number): VehicleMatchResult {
  const statusScore = candidate.status === "Available" ? 40 : 8;
  const capacityScore = candidate.capacity >= passengerCount ? 30 : 5;
  const etaScore = clamp(100 - candidate.etaMinutes * 5, 0, 100) * 0.2;
  const riskScore = clamp(100 - candidate.riskScore, 0, 100) * 0.1;

  const score = Math.round(statusScore + capacityScore + etaScore + riskScore);
  const reasons: string[] = [];

  reasons.push(candidate.status === "Available" ? "Suitable vehicle is available." : "Vehicle is not immediately available.");
  reasons.push(candidate.capacity >= passengerCount ? "Capacity fits trip demand." : "Capacity below desired threshold.");
  reasons.push(`Vehicle risk score ${candidate.riskScore}.`);

  return {
    candidate,
    score: clamp(score, 0, 100),
    reasons,
  };
}
