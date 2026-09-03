export interface OperationsMetrics {
  totalTrips: number;
  activeTrips: number;
  assignedTrips: number;
  completedTrips: number;
  pendingDriverResponses: number;
  acceptedDriverResponses: number;
  rejectedDriverResponses: number;
  availableDrivers: number;
  activeDrivers: number;
  availableVehicles: number;
  activeEmergencies: number;
}

export interface FleetMetrics {
  totalVehicles: number;
  activeVehicles: number;
  availableVehicles: number;
  utilisation: number;
  availability: number;
}

export interface DriverMetrics {
  totalDrivers: number;
  availableDrivers: number;
  activeDrivers: number;
  acceptanceRate: number;
  readiness: number;
}

export interface SlaMetrics {
  compliance: number;
  target: number;
  onTimeCount: number;
  totalTrips: number;
}

export interface ExecutiveMetrics {
  revenue: number;
  totalTrips: number;
  activeTrips: number;
  completedTrips: number;
  fleetUtilisation: number;
  driverAcceptanceRate: number;
  slaCompliance: number;
  activeEmergencies: number;
}

export interface ClientMetrics {
  totalTrips: number;
  activeTrips: number;
  completedTrips: number;
  liveVehicles: number;
  activeDrivers: number;
  etaCoverage: number;
  notificationCount: number;
}

export interface AnalyticsSnapshot {
  operations: OperationsMetrics;
  fleet: FleetMetrics;
  drivers: DriverMetrics;
  sla: SlaMetrics;
  executive: ExecutiveMetrics;
  client: ClientMetrics;
}
