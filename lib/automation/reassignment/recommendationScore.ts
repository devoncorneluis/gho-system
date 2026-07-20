import type { RecommendationReason } from "../../../types/recommendation";

export interface RecommendationScoreInput {
  driverScore: number;
  vehicleScore: number;
  routeScore: number;
  riskScore: number;
}

export interface RecommendationScoreResult {
  confidence: number;
  reasons: RecommendationReason[];
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function buildRecommendationScore(input: RecommendationScoreInput): RecommendationScoreResult {
  const weighted =
    input.driverScore * 0.4 +
    input.vehicleScore * 0.25 +
    input.routeScore * 0.2 +
    clamp(100 - input.riskScore, 0, 100) * 0.15;

  const confidence = Math.round(clamp(weighted, 0, 100));
  const reasons: RecommendationReason[] = [
    { code: "driver", message: `Driver score ${input.driverScore}.` },
    { code: "vehicle", message: `Vehicle score ${input.vehicleScore}.` },
    { code: "route", message: `Route score ${input.routeScore}.` },
    { code: "risk", message: `Adjusted against risk score ${input.riskScore}.` },
  ];

  return {
    confidence,
    reasons,
  };
}
