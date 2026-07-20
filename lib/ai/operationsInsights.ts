import type { AiOperationsSnapshot } from "./aiTypes";

export function summarizeOperationsInsights(snapshot: AiOperationsSnapshot): string[] {
  return [
    `${snapshot.recommendations.length} dispatch recommendation(s) generated`,
    `${snapshot.highRiskTrips.length} high-risk trip(s) detected`,
    `Driver workload balance: ${snapshot.driverWorkloadBalance.status}`,
    `Vehicle utilization: ${snapshot.vehicleUtilization.status}`,
  ];
}
