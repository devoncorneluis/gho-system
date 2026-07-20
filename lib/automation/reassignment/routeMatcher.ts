import type { RouteCandidate } from "../../../types/recommendation";

export interface RouteMatchResult {
  candidate: RouteCandidate;
  score: number;
  reasons: string[];
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function matchRoute(candidate: RouteCandidate): RouteMatchResult {
  const etaScore = clamp(100 - candidate.etaMinutes * 4, 0, 100) * 0.45;
  const trafficScore = clamp(100 - candidate.trafficScore, 0, 100) * 0.25;
  const deviationScore = clamp(100 - candidate.deviationRisk, 0, 100) * 0.2;
  const distanceScore = clamp(100 - candidate.distanceKm * 2, 0, 100) * 0.1;

  const score = Math.round(etaScore + trafficScore + deviationScore + distanceScore);
  const reasons: string[] = [
    `ETA ${candidate.etaMinutes} minutes.`,
    `Traffic score ${candidate.trafficScore}.`,
    `Deviation risk ${candidate.deviationRisk}.`,
  ];

  return {
    candidate,
    score: clamp(score, 0, 100),
    reasons,
  };
}
