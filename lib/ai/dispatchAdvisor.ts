import type { AiOperationsContext, AiOperationsSnapshot } from "./aiTypes";
import { generateRecommendations } from "./recommendationEngine";

export function buildDispatchAdvisorSnapshot(contexts: AiOperationsContext[]): AiOperationsSnapshot {
  const recommendations = generateRecommendations(contexts);
  const drivers = contexts.flatMap((context) => context.drivers);
  const vehicles = contexts.flatMap((context) => context.vehicles);
  const workloads = drivers.map((driver) => driver.workloadToday);
  const utilizations = vehicles.map((vehicle) => vehicle.utilizationToday);
  const averageWorkload =
    workloads.length === 0 ? 0 : Math.round(workloads.reduce((sum, value) => sum + value, 0) / workloads.length);
  const maxWorkload = workloads.length === 0 ? 0 : Math.max(...workloads);
  const averageUtilization =
    utilizations.length === 0
      ? 0
      : Math.round(utilizations.reduce((sum, value) => sum + value, 0) / utilizations.length);

  return {
    schemaVersion: "1.0",
    generatedAt: new Date().toISOString(),
    recommendations,
    predictedDelays: recommendations.map((recommendation) => recommendation.predictedDelay),
    highRiskTrips: recommendations.filter((recommendation) => recommendation.riskLevel === "High"),
    driverWorkloadBalance: {
      averageWorkload,
      maxWorkload,
      status: maxWorkload - averageWorkload >= 4 ? "Imbalanced" : maxWorkload - averageWorkload >= 2 ? "Watch" : "Balanced",
    },
    vehicleUtilization: {
      averageUtilization,
      status: averageUtilization >= 90 ? "Overutilized" : averageUtilization >= 75 ? "Watch" : "Healthy",
    },
    suggestedReassignments: recommendations.filter((recommendation) =>
      ["Reassign Driver", "Change Vehicle", "Escalate"].includes(recommendation.recommendedAction)
    ),
  };
}
