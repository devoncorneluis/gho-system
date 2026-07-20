export type IntelligenceStatus = "healthy" | "watch" | "risk" | "critical";
export type IntelligencePriority = "low" | "medium" | "high" | "critical";

export interface IntelligenceDriver {
  id: string;
  name: string;
  availability: string;
  workload: number;
  onTimeRate: number;
  completedTrips: number;
  cancellationRate: number;
  incidentCount: number;
  distanceToPickupKm?: number;
}

export interface IntelligenceVehicle {
  id: string;
  name: string;
  status: string;
  capacity: number;
  utilizationRate: number;
  maintenanceRisk: number;
  operatingCostPerKm: number;
}

export interface IntelligenceTrip {
  id: string;
  code: string;
  routeGroup: string;
  passengerCount: number;
  pickupTime: string;
  status: string;
  delayMinutes: number;
  slaTargetMinutes: number;
  assignedDriverId?: string;
  assignedVehicleId?: string;
}

export interface IntelligenceRoute {
  id: string;
  name: string;
  routeGroup: string;
  distanceKm: number;
  historicalDelayMinutes: number;
  trafficDelayMinutes?: number;
}

export interface IntelligenceState {
  drivers: IntelligenceDriver[];
  vehicles: IntelligenceVehicle[];
  trips: IntelligenceTrip[];
  routes: IntelligenceRoute[];
  currentEmergencies: number;
  historicalDemand: number[];
  weatherRisk?: number;
  securityAlerts?: number;
}

export interface IntelligenceScore {
  id: string;
  label: string;
  score: number;
  reasons: string[];
}

export interface IntelligenceRisk {
  id: string;
  label: string;
  score: number;
  priority: IntelligencePriority;
  reasons: string[];
}

export interface IntelligencePrediction {
  id: string;
  label: string;
  value: number;
  unit: string;
  priority: IntelligencePriority;
  explanation: string[];
}

export interface IntelligenceInsight {
  id: string;
  title: string;
  value: string;
  status: IntelligenceStatus;
  explanation: string;
}

export interface IntelligenceRecommendation {
  id: string;
  title: string;
  priority: IntelligencePriority;
  confidence: number;
  action: string;
  explanation: string[];
}

export interface EnterpriseIntelligenceSnapshot {
  schemaVersion: "1.0";
  generatedAt: string;
  status: IntelligenceStatus;
  confidence: number;
  recommendations: IntelligenceRecommendation[];
  risks: IntelligenceRisk[];
  predictions: IntelligencePrediction[];
  insights: IntelligenceInsight[];
  explanations: string[];
}
