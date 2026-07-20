import type { AutomationPriority, AutomationSeverity } from "../../../types/automation";

export type EscalationOwner = "dispatcher" | "operations" | "safety" | "executive" | "system";

export interface EscalationSignal {
  tripId: string;
  driverResponseMinutes?: number;
  pickupDelayMinutes?: number;
  vehicleIdleMinutes?: number;
  emergencyActive?: boolean;
  gpsOfflineMinutes?: number;
  tripDelayMinutes?: number;
  routeDeviationMinutes?: number;
  riskScore?: number;
  slaBreaches?: number;
}

export interface EscalationDecision {
  id: string;
  ruleId: string;
  tripId: string;
  severity: AutomationSeverity;
  priority: AutomationPriority;
  recommendedAction: string;
  deadline: string;
  owner: EscalationOwner;
  reason: string;
  tags: string[];
}
