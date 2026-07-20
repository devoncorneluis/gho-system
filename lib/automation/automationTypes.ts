import type { AutomationEscalation, AutomationEvent, AutomationNotification, AutomationPriority, AutomationSeverity } from "../../types/automation";
import type { DriverCandidate, ReassignmentRecommendation, RouteCandidate, VehicleCandidate } from "../../types/recommendation";
import type { WorkflowExecutionResult } from "../../types/workflow";
import type { AutomationConfig } from "./automationConfig";
import type { AutomationScheduler } from "./automationScheduler";

export interface AutomationTripSnapshot {
  tripId: string;
  tripCode?: string;
  status?: string | null;
  pickupDueAt?: string | null;
  dropoffDueAt?: string | null;
  driverResponse?: string | null;
  passengerCount?: number;
  lastLocationUpdatedAt?: string | null;
  routeDeviationMinutes?: number;
  emergencyActive?: boolean;
  responseMinutes?: number;
  pickupMinutes?: number;
  arrivalMinutes?: number;
  emergencyAckMinutes?: number;
}

export interface ReassignmentCandidates {
  drivers: DriverCandidate[];
  vehicles: VehicleCandidate[];
  routes: RouteCandidate[];
}

export interface AutomationContext {
  nowIso: string;
  config: AutomationConfig;
  scheduler: AutomationScheduler;
}

export interface AutomationNotificationDraft {
  title: string;
  message: string;
  severity: AutomationSeverity;
  priority: AutomationPriority;
  audience?: string[];
  metadata?: Record<string, string>;
}

export interface WorkflowArtifacts {
  auditTrail: string[];
  escalationTags: string[];
  notifications: AutomationNotificationDraft[];
  recommendationRequested: boolean;
  operationsUpdateRequested: boolean;
  workflowResults: WorkflowExecutionResult[];
}

export interface AutomationExecutionInput {
  event: AutomationEvent;
  tripSnapshot?: AutomationTripSnapshot;
  candidates?: ReassignmentCandidates;
  scheduler?: AutomationScheduler;
  config?: Partial<AutomationConfig>;
}

export interface AutomationExecutionResult {
  event: AutomationEvent;
  matchedRuleIds: string[];
  workflowArtifacts: WorkflowArtifacts;
  escalations: AutomationEscalation[];
  notifications: AutomationNotification[];
  recommendation?: ReassignmentRecommendation;
  auditTrail: string[];
}
