import type { DriverCandidate } from "../../../types/recommendation";

export interface DriverMatchResult {
  candidate: DriverCandidate;
  score: number;
  reasons: string[];
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function matchDriver(candidate: DriverCandidate): DriverMatchResult {
  const availabilityScore = candidate.availabilityStatus === "Available" ? 35 : 10;
  const acceptanceScore = clamp(candidate.acceptanceRate, 0, 100) * 0.3;
  const workloadScore = clamp(100 - candidate.workloadScore, 0, 100) * 0.2;
  const shiftPenalty = candidate.shiftHours > 10 ? -10 : 0;
  const etaScore = clamp(100 - candidate.etaMinutes * 4, 0, 100) * 0.15;

  const score = Math.round(availabilityScore + acceptanceScore + workloadScore + etaScore + shiftPenalty);
  const reasons: string[] = [];

  reasons.push(candidate.availabilityStatus === "Available" ? "Closest available driver." : "Driver availability is limited.");
  reasons.push(`Acceptance rate ${candidate.acceptanceRate}%.`);
  reasons.push(candidate.workloadScore <= 40 ? "Low workload profile." : "Workload above preferred threshold.");

  return {
    candidate,
    score: clamp(score, 0, 100),
    reasons,
  };
}
