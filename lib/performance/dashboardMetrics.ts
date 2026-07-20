import { createPerformanceMetric } from "./metricsEngine";
import type { PerformanceMetric } from "./performanceTypes";

export function buildDashboardLoadMetric(valueMs: number | null, capturedAt?: string | null): PerformanceMetric {
  return createPerformanceMetric({
    id: "dashboardLoad",
    label: "Dashboard load",
    valueMs,
    measurementMethod: "Browser navigation timing",
    capturedAt,
  });
}

export function buildApiLatencyMetric(valueMs: number | null, capturedAt?: string | null): PerformanceMetric {
  return createPerformanceMetric({
    id: "apiLatency",
    label: "API latency",
    valueMs,
    measurementMethod: "Server request timing",
    capturedAt,
  });
}
