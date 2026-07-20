export type PerformanceStatus = "pending" | "pass" | "warn" | "fail";

export type PerformanceMetricId =
  | "dashboardLoad"
  | "apiLatency"
  | "realtimeLatency"
  | "monitoringSnapshot"
  | "seedExecution"
  | "resetExecution"
  | "buildDuration";

export interface PerformanceThreshold {
  warnAboveMs: number;
  failAboveMs: number;
}

export interface LatencySample {
  label: string;
  durationMs: number;
  capturedAt: string;
}

export interface LatencySummary {
  sampleCount: number;
  averageMs: number | null;
  p50Ms: number | null;
  p95Ms: number | null;
  minMs: number | null;
  maxMs: number | null;
}

export interface PerformanceMetric {
  id: PerformanceMetricId;
  label: string;
  valueMs: number | null;
  displayValue: string;
  status: PerformanceStatus;
  threshold: PerformanceThreshold;
  measurementMethod: string;
  capturedAt: string | null;
}

export interface QueryMeasurement {
  queryName: string;
  table: string;
  durationMs: number;
  capturedAt: string;
}

export interface QueryStatistics {
  totalQueries: number;
  averageMs: number | null;
  p95Ms: number | null;
  slowQueryCount: number;
  slowQueryThresholdMs: number;
  slowQueries: QueryMeasurement[];
}

export interface PerformanceMeasurementInput {
  dashboardLoadMs?: number;
  apiLatencyMs?: number;
  realtimeLatencyMs?: number;
  monitoringSnapshotMs?: number;
  seedExecutionMs?: number;
  resetExecutionMs?: number;
  buildDurationMs?: number;
  queryMeasurements?: QueryMeasurement[];
  capturedAt?: string;
}

export interface PerformanceSnapshot {
  schemaVersion: "1.0";
  generatedAt: string;
  status: PerformanceStatus;
  statusLabel: string;
  metrics: {
    dashboardLoad: PerformanceMetric;
    apiLatency: PerformanceMetric;
    realtimeLatency: PerformanceMetric;
    monitoringSnapshot: PerformanceMetric;
    seedExecution: PerformanceMetric;
    resetExecution: PerformanceMetric;
    buildDuration: PerformanceMetric;
  };
  queryStatistics: QueryStatistics;
  slowQueryCount: number;
  notes: string[];
}

export const PERFORMANCE_THRESHOLDS: Record<PerformanceMetricId, PerformanceThreshold> = {
  dashboardLoad: { warnAboveMs: 2500, failAboveMs: 4000 },
  apiLatency: { warnAboveMs: 500, failAboveMs: 1000 },
  realtimeLatency: { warnAboveMs: 1500, failAboveMs: 3000 },
  monitoringSnapshot: { warnAboveMs: 750, failAboveMs: 1500 },
  seedExecution: { warnAboveMs: 30000, failAboveMs: 60000 },
  resetExecution: { warnAboveMs: 45000, failAboveMs: 90000 },
  buildDuration: { warnAboveMs: 30000, failAboveMs: 60000 },
};
