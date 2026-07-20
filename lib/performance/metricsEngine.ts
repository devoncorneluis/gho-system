import {
  PERFORMANCE_THRESHOLDS,
  type PerformanceMetric,
  type PerformanceMetricId,
  type PerformanceStatus,
} from "./performanceTypes";

const STATUS_LABELS: Record<PerformanceStatus, string> = {
  pending: "Pending Measurement",
  pass: "Pass",
  warn: "At Risk",
  fail: "Fail",
};

export function formatDuration(valueMs: number | null): string {
  if (valueMs === null) {
    return "Pending Measurement";
  }

  if (valueMs >= 1000) {
    return `${(valueMs / 1000).toFixed(2)}s`;
  }

  return `${Math.round(valueMs)}ms`;
}

export function evaluatePerformanceStatus(valueMs: number | null, metricId: PerformanceMetricId): PerformanceStatus {
  if (valueMs === null || !Number.isFinite(valueMs)) {
    return "pending";
  }

  const threshold = PERFORMANCE_THRESHOLDS[metricId];
  if (valueMs >= threshold.failAboveMs) {
    return "fail";
  }

  if (valueMs >= threshold.warnAboveMs) {
    return "warn";
  }

  return "pass";
}

export function getPerformanceStatusLabel(status: PerformanceStatus): string {
  return STATUS_LABELS[status];
}

export function createPerformanceMetric(input: {
  id: PerformanceMetricId;
  label: string;
  valueMs: number | null;
  measurementMethod: string;
  capturedAt?: string | null;
}): PerformanceMetric {
  const status = evaluatePerformanceStatus(input.valueMs, input.id);

  return {
    id: input.id,
    label: input.label,
    valueMs: input.valueMs,
    displayValue: formatDuration(input.valueMs),
    status,
    threshold: PERFORMANCE_THRESHOLDS[input.id],
    measurementMethod: input.measurementMethod,
    capturedAt: input.capturedAt || null,
  };
}

export function summarizePerformanceStatus(statuses: PerformanceStatus[]): PerformanceStatus {
  if (statuses.includes("fail")) {
    return "fail";
  }

  if (statuses.includes("warn")) {
    return "warn";
  }

  if (statuses.includes("pending")) {
    return "pending";
  }

  return "pass";
}
