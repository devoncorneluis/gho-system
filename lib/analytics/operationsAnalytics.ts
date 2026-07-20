import type { OperationsMetrics } from "../../types/analytics";

export interface OperationsAnalyticsInput {
  totalTrips?: number;
  activeTrips?: number;
  assignedTrips?: number;
  completedTrips?: number;
  pendingDriverResponses?: number;
  acceptedDriverResponses?: number;
  rejectedDriverResponses?: number;
  availableDrivers?: number;
  activeDrivers?: number;
  availableVehicles?: number;
  activeEmergencies?: number;
}

export function buildOperationsMetrics(input: OperationsAnalyticsInput): OperationsMetrics {
  return {
    totalTrips: input.totalTrips ?? 0,
    activeTrips: input.activeTrips ?? 0,
    assignedTrips: input.assignedTrips ?? 0,
    completedTrips: input.completedTrips ?? 0,
    pendingDriverResponses: input.pendingDriverResponses ?? 0,
    acceptedDriverResponses: input.acceptedDriverResponses ?? 0,
    rejectedDriverResponses: input.rejectedDriverResponses ?? 0,
    availableDrivers: input.availableDrivers ?? 0,
    activeDrivers: input.activeDrivers ?? 0,
    availableVehicles: input.availableVehicles ?? 0,
    activeEmergencies: input.activeEmergencies ?? 0,
  };
}
