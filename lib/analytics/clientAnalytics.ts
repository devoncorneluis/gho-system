import type { ClientMetrics } from "../../types/analytics";

export interface ClientAnalyticsInput {
  totalTrips?: number;
  activeTrips?: number;
  completedTrips?: number;
  liveVehicles?: number;
  activeDrivers?: number;
  etaCoverage?: number;
  notificationCount?: number;
}

export function buildClientMetrics(input: ClientAnalyticsInput): ClientMetrics {
  return {
    totalTrips: input.totalTrips ?? 0,
    activeTrips: input.activeTrips ?? 0,
    completedTrips: input.completedTrips ?? 0,
    liveVehicles: input.liveVehicles ?? 0,
    activeDrivers: input.activeDrivers ?? 0,
    etaCoverage: input.etaCoverage ?? 0,
    notificationCount: input.notificationCount ?? 0,
  };
}
