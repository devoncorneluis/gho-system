export interface PerformanceMetricPoint {
  name: string;
  value: number;
  recordedAt: string;
}

export interface PerformanceSummary {
  name: string;
  min: number;
  max: number;
  avg: number;
  samples: number;
}

export function summarizeMetrics(name: string, points: PerformanceMetricPoint[]): PerformanceSummary {
  if (points.length === 0) {
    return {
      name,
      min: 0,
      max: 0,
      avg: 0,
      samples: 0,
    };
  }

  const values = points.map((point) => point.value);
  const sum = values.reduce((total, value) => total + value, 0);

  return {
    name,
    min: Math.min(...values),
    max: Math.max(...values),
    avg: Number((sum / values.length).toFixed(2)),
    samples: values.length,
  };
}
