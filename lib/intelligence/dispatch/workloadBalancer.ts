import type { IntelligenceDriver, IntelligenceInsight } from "../core/intelligenceTypes";

export function calculateWorkloadBalance(drivers: IntelligenceDriver[]): IntelligenceInsight {
  if (drivers.length === 0) {
    return {
      id: "workload-balance",
      title: "Driver workload balance",
      value: "No drivers",
      status: "watch",
      explanation: "No driver data available.",
    };
  }

  const workloads = drivers.map((driver) => driver.workload);
  const average = workloads.reduce((sum, value) => sum + value, 0) / workloads.length;
  const max = Math.max(...workloads);
  const spread = max - average;

  return {
    id: "workload-balance",
    title: "Driver workload balance",
    value: `${average.toFixed(1)} avg / ${max} max`,
    status: spread >= 4 ? "risk" : spread >= 2 ? "watch" : "healthy",
    explanation: spread >= 4 ? "Driver workload is uneven." : "Driver workload is within operating range.",
  };
}
