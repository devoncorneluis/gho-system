import type { ExecutiveMetrics } from "../../types/analytics";

export interface ExecutiveAnalyticsInput {
  totalTrips?: number;
  activeTrips?: number;
  completedTrips?: number;
  fleetUtilisation?: number;
  driverAcceptanceRate?: number;
  slaCompliance?: number;
  activeEmergencies?: number;
}

export function buildExecutiveMetrics(input: ExecutiveAnalyticsInput): ExecutiveMetrics {
  return {
    totalTrips: input.totalTrips ?? 0,
    activeTrips: input.activeTrips ?? 0,
    completedTrips: input.completedTrips ?? 0,
    fleetUtilisation: input.fleetUtilisation ?? 0,
    driverAcceptanceRate: input.driverAcceptanceRate ?? 0,
    slaCompliance: input.slaCompliance ?? 0,
    activeEmergencies: input.activeEmergencies ?? 0,
  };
}
