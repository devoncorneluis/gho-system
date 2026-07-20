import type { LatencySample, LatencySummary } from "./performanceTypes";

export function calculatePercentile(values: number[], percentile: number): number | null {
  if (values.length === 0) {
    return null;
  }

  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.ceil((percentile / 100) * sorted.length) - 1;
  return sorted[Math.min(Math.max(index, 0), sorted.length - 1)];
}

export function summarizeLatency(samples: LatencySample[]): LatencySummary {
  const values = samples
    .map((sample) => sample.durationMs)
    .filter((value) => Number.isFinite(value) && value >= 0);

  if (values.length === 0) {
    return {
      sampleCount: 0,
      averageMs: null,
      p50Ms: null,
      p95Ms: null,
      minMs: null,
      maxMs: null,
    };
  }

  const total = values.reduce((sum, value) => sum + value, 0);

  return {
    sampleCount: values.length,
    averageMs: Math.round(total / values.length),
    p50Ms: calculatePercentile(values, 50),
    p95Ms: calculatePercentile(values, 95),
    minMs: Math.min(...values),
    maxMs: Math.max(...values),
  };
}

export function createLatencySample(label: string, durationMs: number, capturedAt = new Date().toISOString()): LatencySample {
  return {
    label,
    durationMs,
    capturedAt,
  };
}
