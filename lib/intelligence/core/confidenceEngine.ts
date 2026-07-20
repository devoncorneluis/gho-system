import type { IntelligenceRecommendation, IntelligenceScore } from "./intelligenceTypes";

export function calculateConfidence(scores: IntelligenceScore[], riskScore: number): number {
  if (scores.length === 0) return 0;
  const average = scores.reduce((sum, item) => sum + item.score, 0) / scores.length;
  return Math.max(1, Math.min(99, Math.round(average * 0.85 + Math.max(0, 100 - riskScore) * 0.15)));
}

export function summarizeRecommendationConfidence(recommendations: IntelligenceRecommendation[]): number {
  if (recommendations.length === 0) return 0;
  return Math.round(recommendations.reduce((sum, item) => sum + item.confidence, 0) / recommendations.length);
}
