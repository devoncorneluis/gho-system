import type { IntelligencePriority, IntelligenceScore, IntelligenceStatus } from "./intelligenceTypes";

export function clampScore(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

export function weightedScore(parts: Array<{ value: number; weight: number }>): number {
  const totalWeight = parts.reduce((sum, part) => sum + part.weight, 0);
  if (totalWeight <= 0) return 0;
  const total = parts.reduce((sum, part) => sum + clampScore(part.value) * part.weight, 0);
  return clampScore(total / totalWeight);
}

export function priorityFromScore(score: number): IntelligencePriority {
  if (score >= 85) return "critical";
  if (score >= 65) return "high";
  if (score >= 35) return "medium";
  return "low";
}

export function statusFromScore(score: number): IntelligenceStatus {
  if (score >= 85) return "critical";
  if (score >= 65) return "risk";
  if (score >= 35) return "watch";
  return "healthy";
}

export function rankScores(scores: IntelligenceScore[]): IntelligenceScore[] {
  return [...scores].sort((a, b) => b.score - a.score);
}
