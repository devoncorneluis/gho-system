import fs from "node:fs/promises";
import path from "node:path";
import { buildProductionBuildMetric } from "./buildMetrics";
import { buildApiLatencyMetric, buildDashboardLoadMetric } from "./dashboardMetrics";
import { createPerformanceMetric, getPerformanceStatusLabel, summarizePerformanceStatus } from "./metricsEngine";
import { summarizeQueryStatistics } from "./queryProfiler";
import { buildRealtimeLatencyMetric } from "./realtimeMetrics";
import type { PerformanceMeasurementInput, PerformanceSnapshot } from "./performanceTypes";

const PERFORMANCE_MEASUREMENTS_PATH = path.join(process.cwd(), ".performance-measurements.json");

async function readMeasurementInput(): Promise<PerformanceMeasurementInput> {
  try {
    const raw = await fs.readFile(PERFORMANCE_MEASUREMENTS_PATH, "utf8");
    return JSON.parse(raw) as PerformanceMeasurementInput;
  } catch {
    return {};
  }
}

export function buildPerformanceSnapshot(input: PerformanceMeasurementInput = {}): PerformanceSnapshot {
  const capturedAt = input.capturedAt || null;
  const queryStatistics = summarizeQueryStatistics(input.queryMeasurements || []);

  const metrics = {
    dashboardLoad: buildDashboardLoadMetric(input.dashboardLoadMs ?? null, capturedAt),
    apiLatency: buildApiLatencyMetric(input.apiLatencyMs ?? null, capturedAt),
    realtimeLatency: buildRealtimeLatencyMetric(input.realtimeLatencyMs ?? null, capturedAt),
    monitoringSnapshot: createPerformanceMetric({
      id: "monitoringSnapshot",
      label: "Monitoring snapshot",
      valueMs: input.monitoringSnapshotMs ?? null,
      measurementMethod: "Monitoring snapshot timing",
      capturedAt,
    }),
    seedExecution: createPerformanceMetric({
      id: "seedExecution",
      label: "Seed execution",
      valueMs: input.seedExecutionMs ?? null,
      measurementMethod: "scripts/seed-uat.ts wall-clock timing",
      capturedAt,
    }),
    resetExecution: createPerformanceMetric({
      id: "resetExecution",
      label: "Reset execution",
      valueMs: input.resetExecutionMs ?? null,
      measurementMethod: "scripts/reset-uat.ts wall-clock timing",
      capturedAt,
    }),
    buildDuration: buildProductionBuildMetric(input.buildDurationMs ?? null, capturedAt),
  };

  const status = summarizePerformanceStatus([
    ...Object.values(metrics).map((metric) => metric.status),
    queryStatistics.slowQueryCount > 0 ? "warn" : "pass",
  ]);

  return {
    schemaVersion: "1.0",
    generatedAt: new Date().toISOString(),
    status,
    statusLabel: getPerformanceStatusLabel(status),
    metrics,
    queryStatistics,
    slowQueryCount: queryStatistics.slowQueryCount,
    notes:
      status === "pending"
        ? ["Gate 3 measurement artifact has not been captured yet."]
        : ["Snapshot generated from captured Gate 3 measurements."],
  };
}

export async function getPerformanceSnapshot(): Promise<PerformanceSnapshot> {
  const input = await readMeasurementInput();
  return buildPerformanceSnapshot(input);
}
