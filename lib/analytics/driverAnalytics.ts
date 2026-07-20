import type { DriverMetrics } from "../../types/analytics";

export interface DriverMetric {
  availabilityStatus: string;
  responseMinutes: number;
  completedTrips: number;
}

export interface DriverAnalyticsInput {
  totalDrivers?: number;
  availableDrivers?: number;
  activeDrivers?: number;
  acceptanceRate?: number;
  readiness?: number;
}

export function calculateDriverReadiness(metrics: DriverMetric[]): number {
  if (!metrics.length) return 0;
  const score = metrics.reduce((sum, metric) => {
    const availabilityScore = metric.availabilityStatus === "Available" ? 1 : 0.3;
    const responseScore = Math.max(0, 1 - metric.responseMinutes / 20);
    const volumeScore = Math.min(1, metric.completedTrips / 10);
    return sum + (availabilityScore * 0.4 + responseScore * 0.35 + volumeScore * 0.25);
  }, 0);

  return Math.round((score / metrics.length) * 100);
}

export function buildDriverMetrics(input: DriverAnalyticsInput): DriverMetrics {
  return {
    totalDrivers: input.totalDrivers ?? 0,
    availableDrivers: input.availableDrivers ?? 0,
    activeDrivers: input.activeDrivers ?? 0,
    acceptanceRate: input.acceptanceRate ?? 0,
    readiness: input.readiness ?? 0,
  };
}
