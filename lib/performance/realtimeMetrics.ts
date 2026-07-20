import { createPerformanceMetric } from "./metricsEngine";
import type { PerformanceMetric } from "./performanceTypes";

export function buildRealtimeLatencyMetric(valueMs: number | null, capturedAt?: string | null): PerformanceMetric {
  return createPerformanceMetric({
    id: "realtimeLatency",
    label: "Realtime latency",
    valueMs,
    measurementMethod: "Event emit-to-render timing",
    capturedAt,
  });
}
