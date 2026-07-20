export type AiRiskLevel = "Low" | "Medium" | "High";

export type RecommendedAction =
  | "Dispatch"
  | "Reassign Driver"
  | "Change Vehicle"
  | "Monitor"
  | "Escalate";

export interface AiDriverInput {
  id: string;
  name: string;
  availability: "Available" | "On Trip" | "Offline" | string;
  workloadToday: number;
  onTimePercentage: number;
  completedTrips: number;
  cancellationRate: number;
  emergencyIncidents: number;
  distanceToPickupKm?: number;
}

export interface AiVehicleInput {
  id: string;
  name: string;
  status: "Available" | "On Trip" | "Maintenance" | string;
  capacity: number;
  requiredCapacity: number;
  utilizationToday: number;
  maintenanceRisk: number;
}

export interface AiRouteInput {
  id: string;
  name: string;
  routeGroup: string;
  distanceKm: number;
  pickupTime: string;
  historicalDelayMinutes: number;
  trafficDelayMinutes?: number;
}

export interface AiTripInput {
  id: string;
  code: string;
  passengerCount: number;
  pickupTime: string;
  routeGroup: string;
  slaTargetMinutes: number;
}

export interface AiOperationsContext {
  trip: AiTripInput;
  drivers: AiDriverInput[];
  vehicles: AiVehicleInput[];
  routes: AiRouteInput[];
  currentEmergencies: number;
  activeTrafficDataAvailable: boolean;
  historicalDemand: number[];
}

export interface AiScore {
  id: string;
  name: string;
  score: number;
  reasons: string[];
}

export interface DelayPrediction {
  predictedDelayMinutes: number;
  riskLevel: AiRiskLevel;
  reasons: string[];
}

export interface AiRecommendation {
  tripId: string;
  tripCode: string;
  bestDriver: AiScore | null;
  bestVehicle: AiScore | null;
  bestRoute: AiScore | null;
  riskScore: number;
  riskLevel: AiRiskLevel;
  confidenceScore: number;
  recommendedAction: RecommendedAction;
  explanation: string[];
  predictedDelay: DelayPrediction;
}

export interface AiOperationsSnapshot {
  schemaVersion: "1.0";
  generatedAt: string;
  recommendations: AiRecommendation[];
  predictedDelays: DelayPrediction[];
  highRiskTrips: AiRecommendation[];
  driverWorkloadBalance: {
    averageWorkload: number;
    maxWorkload: number;
    status: "Balanced" | "Watch" | "Imbalanced";
  };
  vehicleUtilization: {
    averageUtilization: number;
    status: "Healthy" | "Watch" | "Overutilized";
  };
  suggestedReassignments: AiRecommendation[];
};
