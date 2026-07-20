import { createPerformanceMetric } from "./metricsEngine";
import type { PerformanceMetric } from "./performanceTypes";

export function buildProductionBuildMetric(valueMs: number | null, capturedAt?: string | null): PerformanceMetric {
  return createPerformanceMetric({
    id: "buildDuration",
    label: "Build duration",
    valueMs,
    measurementMethod: "npm run build timing",
    capturedAt,
  });
}
