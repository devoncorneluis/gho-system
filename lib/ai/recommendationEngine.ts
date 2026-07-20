import type { AiOperationsContext, AiRecommendation, AiRiskLevel, RecommendedAction } from "./aiTypes";
import { predictDelay } from "./delayPredictor";
import { rankDrivers } from "./driverScoring";
import { rankRoutes } from "./routeOptimizer";
import { rankVehicles } from "./vehicleScoring";

function riskFromScore(score: number): AiRiskLevel {
  if (score >= 70) return "High";
  if (score >= 40) return "Medium";
  return "Low";
}

function actionForRisk(riskScore: number, hasDriver: boolean, hasVehicle: boolean): RecommendedAction {
  if (!hasDriver) return "Reassign Driver";
  if (!hasVehicle) return "Change Vehicle";
  if (riskScore >= 70) return "Escalate";
  if (riskScore >= 40) return "Monitor";
  return "Dispatch";
}

export function calculateConfidenceScore(driverScore: number, vehicleScore: number, routeScore: number, riskScore: number): number {
  const fitScore = driverScore * 0.35 + vehicleScore * 0.3 + routeScore * 0.25;
  const riskAdjustment = Math.max(0, 100 - riskScore) * 0.1;
  return Math.round(Math.min(99, Math.max(1, fitScore + riskAdjustment)));
}

export function generateRecommendation(context: AiOperationsContext): AiRecommendation {
  const drivers = rankDrivers(context.drivers);
  const vehicles = rankVehicles(context.vehicles);
  const routes = rankRoutes(context.routes);
  const predictedDelay = predictDelay(context);
  const bestDriver = drivers[0] || null;
  const bestVehicle = vehicles[0] || null;
  const bestRoute = routes[0] || null;
  const riskScore = Math.min(
    100,
    Math.round(
      predictedDelay.predictedDelayMinutes * 3 +
        (context.currentEmergencies > 0 ? 12 : 0) +
        (bestDriver ? Math.max(0, 75 - bestDriver.score) * 0.4 : 35) +
        (bestVehicle ? Math.max(0, 75 - bestVehicle.score) * 0.3 : 25)
    )
  );
  const confidenceScore =
    bestDriver && bestVehicle && bestRoute
      ? calculateConfidenceScore(bestDriver.score, bestVehicle.score, bestRoute.score, riskScore)
      : 1;

  return {
    tripId: context.trip.id,
    tripCode: context.trip.code,
    bestDriver,
    bestVehicle,
    bestRoute,
    riskScore,
    riskLevel: riskFromScore(riskScore),
    confidenceScore,
    recommendedAction: actionForRisk(riskScore, Boolean(bestDriver), Boolean(bestVehicle)),
    explanation: [
      bestDriver ? `Driver: ${bestDriver.reasons[0]}` : "No driver candidate available",
      bestVehicle ? `Vehicle: ${bestVehicle.reasons[1]}` : "No vehicle candidate available",
      bestRoute ? `Route: ${bestRoute.reasons[2]}` : "No route candidate available",
      `Predicted delay ${predictedDelay.predictedDelayMinutes} min`,
    ],
    predictedDelay,
  };
}

export function generateRecommendations(contexts: AiOperationsContext[]): AiRecommendation[] {
  return contexts.map(generateRecommendation).sort((a, b) => b.riskScore - a.riskScore);
}
