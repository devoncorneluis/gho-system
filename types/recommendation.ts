export interface RecommendationReason {
  code: string;
  message: string;
}

export interface DriverCandidate {
  driverId: string;
  driverName: string;
  availabilityStatus: string;
  acceptanceRate: number;
  workloadScore: number;
  shiftHours: number;
  etaMinutes: number;
}

export interface VehicleCandidate {
  vehicleId: string;
  vehicleName: string;
  status: string;
  capacity: number;
  etaMinutes: number;
  riskScore: number;
}

export interface RouteCandidate {
  routeId: string;
  distanceKm: number;
  etaMinutes: number;
  trafficScore: number;
  deviationRisk: number;
}

export interface ReassignmentRecommendation {
  tripId: string;
  recommendedDriverId: string;
  recommendedVehicleId: string;
  recommendedRouteId: string;
  confidence: number;
  reasons: RecommendationReason[];
}
