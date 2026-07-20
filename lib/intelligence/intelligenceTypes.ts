export type AlertSeverity = "low" | "medium" | "high" | "critical";

export interface DelayAlert {
  tripId: string;
  severity: AlertSeverity;
  reason: string;
  minutesLate: number;
}

export interface SlaSummary {
  compliance: number;
  breaches: number;
  warnings: number;
}

export interface EtaEstimate {
  tripId: string;
  liveEtaMinutes: number;
  pickupEtaMinutes: number;
  destinationEtaMinutes: number;
  delayEstimateMinutes: number;
  trafficAdjustedEtaMinutes: number;
}

export interface RiskAssessment {
  tripId: string;
  score: number;
  reasons: string[];
}

export interface DispatchRecommendation {
  tripId: string;
  driverId: string;
  driverName: string;
  score: number;
  reasons: string[];
}

export interface NotificationEvent {
  id: string;
  type: "trip_delayed" | "driver_accepted" | "driver_rejected" | "emergency" | "sla_breach" | "eta_changed";
  title: string;
  message: string;
  severity: AlertSeverity;
  createdAt: string;
}

export interface IntelligenceEvent {
  type: "trip" | "driver_response" | "dispatch" | "emergency" | "system";
  source: string;
  payload: Record<string, unknown>;
  createdAt: string;
}
