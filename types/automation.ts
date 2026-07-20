import type { ReassignmentRecommendation } from "./recommendation";

export type AutomationEventType =
  | "trip_created"
  | "trip_updated"
  | "driver_response"
  | "driver_rejected"
  | "driver_response_overdue"
  | "pickup_overdue"
  | "vehicle_idle"
  | "emergency"
  | "gps_offline"
  | "trip_delayed"
  | "route_deviation"
  | "sla_breach";

export interface AutomationEvent {
  id: string;
  type: AutomationEventType;
  platformId?: string;
  tripId?: string;
  createdAt: string;
  source: string;
  payload: Record<string, unknown>;
}

export type AutomationSeverity = "low" | "medium" | "high" | "critical";
export type AutomationPriority = "p1" | "p2" | "p3" | "p4";

export interface AutomationEscalation {
  id: string;
  ruleId: string;
  severity: AutomationSeverity;
  priority: AutomationPriority;
  recommendedAction: string;
  deadline: string;
  owner: "dispatcher" | "operations" | "safety" | "executive" | "system";
}

export interface AutomationNotification {
  id: string;
  title: string;
  message: string;
  severity: AutomationSeverity;
  priority: AutomationPriority;
  channels: Array<"operations_dashboard" | "driver_dashboard" | "client_portal" | "executive_dashboard" | "email" | "sms" | "push">;
  audience: string[];
  metadata?: Record<string, string>;
}

export interface AutomationRunSummary {
  eventId: string;
  workflowIds: string[];
  escalations: AutomationEscalation[];
  notifications: AutomationNotification[];
  recommendation?: ReassignmentRecommendation;
  auditTrail: string[];
}
