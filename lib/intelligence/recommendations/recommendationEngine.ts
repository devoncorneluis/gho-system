import { calculateConfidence } from "../core/confidenceEngine";
import { priorityFromScore } from "../core/scoringEngine";
import type {
  IntelligenceRecommendation,
  IntelligenceRisk,
  IntelligenceScore,
  IntelligenceTrip,
} from "../core/intelligenceTypes";
import { actionForPriority } from "./actionPlanner";
import { explainRecommendation } from "./explanationEngine";

export function buildDispatchRecommendation(input: {
  trip: IntelligenceTrip;
  driver?: IntelligenceScore;
  vehicle?: IntelligenceScore;
  route?: IntelligenceScore;
  risk?: IntelligenceRisk;
}): IntelligenceRecommendation {
  const scores = [input.driver, input.vehicle, input.route].filter(Boolean) as IntelligenceScore[];
  const riskScore = input.risk?.score || 0;
  const priority = priorityFromScore(riskScore);

  return {
    id: `recommendation-${input.trip.id}`,
    title: `Recommendation for ${input.trip.code}`,
    priority,
    confidence: calculateConfidence(scores, riskScore),
    action: actionForPriority(priority),
    explanation: explainRecommendation(input),
  };
}

export function rankRecommendations(recommendations: IntelligenceRecommendation[]): IntelligenceRecommendation[] {
  const priorityWeight = { critical: 4, high: 3, medium: 2, low: 1 };
  return [...recommendations].sort(
    (a, b) => priorityWeight[b.priority] - priorityWeight[a.priority] || b.confidence - a.confidence
  );
}
