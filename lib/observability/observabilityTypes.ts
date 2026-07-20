export type TelemetryOutcome = "attempted" | "success" | "blocked" | "caution" | "failed";

export type TelemetryAction =
  | "approve_recommendation"
  | "reassign_driver"
  | "notify_driver"
  | "escalate"
  | "open_trip"
  | "resolve_alert"
  | "create_emergency_ticket"
  | "manual_override"
  | "workflow_execution"
  | "screen_view";

export interface TelemetryEvent {
  id: string;
  action: TelemetryAction;
  outcome: TelemetryOutcome;
  operatorId: string;
  platformId: string;
  screen: "operations" | "operator_analytics" | "executive" | "dispatch" | "other";
  workflow?: string;
  reason?: string;
  durationMs?: number;
  dispatchId?: string;
  happenedAt: string;
}

export interface TelemetryEventInput extends Omit<TelemetryEvent, "id" | "happenedAt"> {
  happenedAt?: string;
}

export interface OperatorWorkload {
  operatorId: string;
  attempts: number;
  blocked: number;
  cautioned: number;
  success: number;
}

export interface OperatorAnalyticsSummary {
  dispatchAttemptsToday: number;
  blockedDispatches: number;
  manualOverrides: number;
  recommendationApprovals: number;
  recommendationIgnores: number;
  averageDecisionTimeMs: number;
  emergencyAcknowledgements: number;
  mostCommonFailures: Array<{ reason: string; count: number }>;
  operatorWorkload: OperatorWorkload[];
  averageClicksPerDispatch: number;
}

export interface ExecutiveTelemetrySummary {
  automationAcceptance: number;
  operatorEfficiency: number;
  manualInterventionRate: number;
  averageDispatchTimeMs: number;
  recommendationAdoption: number;
  workflowCompletion: number;
  criticalEscalations: number;
  operationalCostIndex: number;
}

export interface SystemMetricsSnapshot {
  telemetryEventsLastHour: number;
  blockedRate: number;
  cautionRate: number;
  workflowFailureRate: number;
  generatedAt: string;
}

export interface HealthMetricsSnapshot {
  operationsHealth: "healthy" | "degraded" | "down";
  alertCount: number;
  realtimeReliability: number;
  generatedAt: string;
}

export interface PerformanceMetricsSnapshot {
  averageActionLatencyMs: number;
  p95ActionLatencyMs: number;
  averageDispatchDecisionMs: number;
  generatedAt: string;
}

export interface EventTimelinePoint {
  bucketIso: string;
  total: number;
  blocked: number;
  caution: number;
  failed: number;
}
