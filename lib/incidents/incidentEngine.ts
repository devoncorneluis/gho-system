export type IncidentSeverity =
  | "Critical"
  | "High"
  | "Medium"
  | "Low";

export type IncidentStatus =
  | "Open"
  | "Acknowledged"
  | "Resolved";

export type IncidentType =
  | "Emergency"
  | "Trip Cancelled"
  | "GPS Offline"
  | "Route Deviation"
  | "Vehicle Breakdown";

export type Incident = {
  id: string;
  createdAt: string;
  type: IncidentType;
  severity: IncidentSeverity;
  status: IncidentStatus;
  tripCode?: string;
  driverName?: string;
  vehicleName?: string;
  description: string;

  assigned_to?: string;
};

export function createIncident(
  incident: Omit<Incident, "id" | "createdAt" | "status">
): Incident {
  return {
    id: `INC-${Date.now()}`,
    createdAt: new Date().toISOString(),
    status: "Open",
    ...incident,
  };
}