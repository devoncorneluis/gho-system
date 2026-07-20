import { describe, expect, it } from "vitest";
import { summarizeLatency } from "../../lib/performance/latencyTracker";
import { evaluatePerformanceStatus, summarizePerformanceStatus } from "../../lib/performance/metricsEngine";
import { buildPerformanceSnapshot } from "../../lib/performance/performanceSnapshot";
import { summarizeQueryStatistics } from "../../lib/performance/queryProfiler";

describe("performance engine", () => {
  it("generates a pending snapshot when measurements have not been captured", () => {
    const snapshot = buildPerformanceSnapshot();

    expect(snapshot.status).toBe("pending");
    expect(snapshot.metrics.dashboardLoad.displayValue).toBe("Pending Measurement");
    expect(snapshot.slowQueryCount).toBe(0);
  });

  it("evaluates thresholds without storing estimated values", () => {
    expect(evaluatePerformanceStatus(null, "apiLatency")).toBe("pending");
    expect(evaluatePerformanceStatus(250, "apiLatency")).toBe("pass");
    expect(evaluatePerformanceStatus(750, "apiLatency")).toBe("warn");
    expect(evaluatePerformanceStatus(1200, "apiLatency")).toBe("fail");
  });

  it("summarizes aggregate status by severity", () => {
    expect(summarizePerformanceStatus(["pass", "pass"])).toBe("pass");
    expect(summarizePerformanceStatus(["pass", "pending"])).toBe("pending");
    expect(summarizePerformanceStatus(["pass", "warn"])).toBe("warn");
    expect(summarizePerformanceStatus(["pass", "fail", "warn"])).toBe("fail");
  });

  it("aggregates latency samples", () => {
    const summary = summarizeLatency([
      { label: "a", durationMs: 100, capturedAt: "2026-07-06T00:00:00.000Z" },
      { label: "b", durationMs: 200, capturedAt: "2026-07-06T00:00:01.000Z" },
      { label: "c", durationMs: 300, capturedAt: "2026-07-06T00:00:02.000Z" },
    ]);

    expect(summary.sampleCount).toBe(3);
    expect(summary.averageMs).toBe(200);
    expect(summary.p50Ms).toBe(200);
    expect(summary.p95Ms).toBe(300);
  });

  it("calculates query statistics and slow query count", () => {
    const stats = summarizeQueryStatistics([
      {
        queryName: "fast trips",
        table: "trips",
        durationMs: 120,
        capturedAt: "2026-07-06T00:00:00.000Z",
      },
      {
        queryName: "slow passengers",
        table: "trip_passengers",
        durationMs: 650,
        capturedAt: "2026-07-06T00:00:01.000Z",
      },
    ]);

    expect(stats.totalQueries).toBe(2);
    expect(stats.slowQueryCount).toBe(1);
    expect(stats.slowQueries[0].queryName).toBe("slow passengers");
  });

  it("builds a measured snapshot with pass status when all metrics are inside thresholds", () => {
    const snapshot = buildPerformanceSnapshot({
      dashboardLoadMs: 1200,
      apiLatencyMs: 250,
      realtimeLatencyMs: 700,
      monitoringSnapshotMs: 300,
      seedExecutionMs: 12000,
      resetExecutionMs: 18000,
      buildDurationMs: 18000,
      queryMeasurements: [
        {
          queryName: "trips dashboard",
          table: "trips",
          durationMs: 100,
          capturedAt: "2026-07-06T00:00:00.000Z",
        },
      ],
      capturedAt: "2026-07-06T00:00:00.000Z",
    });

    expect(snapshot.status).toBe("pass");
    expect(snapshot.metrics.seedExecution.displayValue).toBe("12.00s");
  });
});
