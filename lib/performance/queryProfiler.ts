import { summarizeLatency } from "./latencyTracker";
import type { QueryMeasurement, QueryStatistics } from "./performanceTypes";

export const SLOW_QUERY_THRESHOLD_MS = 500;

export function getSlowQueries(
  measurements: QueryMeasurement[] = [],
  slowQueryThresholdMs = SLOW_QUERY_THRESHOLD_MS
): QueryMeasurement[] {
  return measurements.filter((measurement) => measurement.durationMs >= slowQueryThresholdMs);
}

export function summarizeQueryStatistics(
  measurements: QueryMeasurement[] = [],
  slowQueryThresholdMs = SLOW_QUERY_THRESHOLD_MS
): QueryStatistics {
  const summary = summarizeLatency(
    measurements.map((measurement) => ({
      label: measurement.queryName,
      durationMs: measurement.durationMs,
      capturedAt: measurement.capturedAt,
    }))
  );
  const slowQueries = getSlowQueries(measurements, slowQueryThresholdMs);

  return {
    totalQueries: measurements.length,
    averageMs: summary.averageMs,
    p95Ms: summary.p95Ms,
    slowQueryCount: slowQueries.length,
    slowQueryThresholdMs,
    slowQueries,
  };
}
