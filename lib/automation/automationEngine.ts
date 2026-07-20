import type { AutomationEscalation, AutomationEvent, AutomationNotification, AutomationPriority, AutomationSeverity } from "../../types/automation";
import { detectDelay } from "../intelligence/delayDetector";
import { assessTripRisk } from "../intelligence/riskEngine";
import { buildSlaSummary } from "../intelligence/slaEngine";
import { buildAutomationConfig } from "./automationConfig";
import { evaluateAutomationRules } from "./automationRules";
import { AutomationScheduler } from "./automationScheduler";
import type { AutomationExecutionInput, AutomationExecutionResult, AutomationNotificationDraft, AutomationTripSnapshot } from "./automationTypes";
import { routeNotifications } from "./notifications/notificationRouter";
import { buildReassignmentRecommendation } from "./reassignment/reassignmentEngine";
import { runEscalationEngine } from "./escalation/escalationEngine";
import { executeWorkflowsForEvent } from "./workflow/workflowEngine";

function minutesSince(isoDate?: string | null): number {
  if (!isoDate) return 0;
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return 0;
  return Math.max(0, Math.round((Date.now() - date.getTime()) / 60_000));
}

function toIso(value?: string | null): string | undefined {
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
}

function toSeverityFromPriority(priority: AutomationPriority): AutomationSeverity {
  if (priority === "p1") return "critical";
  if (priority === "p2") return "high";
  if (priority === "p3") return "medium";
  return "low";
}

function convertEscalations(decisions: ReturnType<typeof runEscalationEngine>): AutomationEscalation[] {
  return decisions.map((decision) => ({
    id: decision.id,
    ruleId: decision.ruleId,
    severity: decision.severity,
    priority: decision.priority,
    recommendedAction: decision.recommendedAction,
    deadline: decision.deadline,
    owner: decision.owner,
  }));
}

function draftToNotification(event: AutomationEvent, draft: AutomationNotificationDraft): AutomationNotification {
  return {
    id: `wf-${event.id}-${Math.round(Math.random() * 1_000_000)}`,
    title: draft.title,
    message: draft.message,
    severity: draft.severity,
    priority: draft.priority,
    channels: ["operations_dashboard"],
    audience: draft.audience || [],
    metadata: draft.metadata,
  };
}

function escalationToNotification(event: AutomationEvent, escalation: AutomationEscalation): AutomationNotification {
  return {
    id: `esc-${event.id}-${escalation.id}`,
    title: `Escalation: ${escalation.ruleId}`,
    message: escalation.recommendedAction,
    severity: escalation.severity,
    priority: escalation.priority,
    channels: ["operations_dashboard"],
    audience: [escalation.owner],
    metadata: {
      deadline: escalation.deadline,
      escalationId: escalation.id,
    },
  };
}

function derivePickupOrDropoffDelay(snapshot?: AutomationTripSnapshot): number {
  if (!snapshot) return 0;
  const pickupDue = toIso(snapshot.pickupDueAt);
  const dropoffDue = toIso(snapshot.dropoffDueAt);

  const delayAlert = detectDelay({
    tripId: snapshot.tripId,
    pickupDueAt: pickupDue,
    dropoffDueAt: dropoffDue,
    currentStatus: snapshot.status,
    dwellMinutes: minutesSince(snapshot.lastLocationUpdatedAt),
    deviationMinutes: snapshot.routeDeviationMinutes,
  });

  return delayAlert?.minutesLate ?? 0;
}

export async function runAutomationEngine(input: AutomationExecutionInput): Promise<AutomationExecutionResult> {
  const config = buildAutomationConfig(input.config);
  const scheduler = input.scheduler || new AutomationScheduler();
  const context = {
    nowIso: new Date().toISOString(),
    config,
    scheduler,
  };

  const matchedRuleIds = evaluateAutomationRules(input.event, config);
  const workflowArtifacts = executeWorkflowsForEvent(input.event, context);

  const snapshot = input.tripSnapshot;
  const tripId = snapshot?.tripId || input.event.tripId || "unknown-trip";
  const responseMinutes = snapshot?.responseMinutes ?? 0;
  const pickupMinutes = snapshot?.pickupMinutes ?? derivePickupOrDropoffDelay(snapshot);
  const arrivalMinutes = snapshot?.arrivalMinutes ?? pickupMinutes;
  const emergencyAckMinutes = snapshot?.emergencyAckMinutes ?? 0;

  const delayMinutes = derivePickupOrDropoffDelay(snapshot);
  const gpsOfflineMinutes = minutesSince(snapshot?.lastLocationUpdatedAt);

  const sla = buildSlaSummary({
    responseMinutes,
    pickupMinutes,
    arrivalMinutes,
    emergencyAckMinutes,
  });

  const risk = assessTripRisk({
    tripId,
    delayMinutes,
    driverResponse: snapshot?.driverResponse,
    passengerCount: snapshot?.passengerCount,
    trackingFreshnessMinutes: gpsOfflineMinutes,
    currentStatus: snapshot?.status,
  });

  const escalationDecisions = runEscalationEngine(
    {
      tripId,
      driverResponseMinutes: responseMinutes,
      pickupDelayMinutes: pickupMinutes,
      vehicleIdleMinutes: gpsOfflineMinutes,
      emergencyActive: Boolean(snapshot?.emergencyActive || input.event.type === "emergency"),
      gpsOfflineMinutes,
      tripDelayMinutes: delayMinutes,
      routeDeviationMinutes: snapshot?.routeDeviationMinutes,
      riskScore: risk.score,
      slaBreaches: sla.breaches,
    },
    context.nowIso
  );

  const escalations = convertEscalations(escalationDecisions);

  let recommendation = undefined;
  const needsRecommendation =
    workflowArtifacts.recommendationRequested ||
    matchedRuleIds.includes("driver-response-overdue") ||
    matchedRuleIds.includes("pickup-overdue") ||
    matchedRuleIds.includes("route-deviation");

  if (needsRecommendation && input.candidates) {
    recommendation = buildReassignmentRecommendation({
      tripId,
      passengerCount: snapshot?.passengerCount ?? 0,
      riskScore: risk.score,
      candidates: input.candidates,
    });
  }

  const workflowNotifications = workflowArtifacts.notifications.map((draft) => draftToNotification(input.event, draft));
  const escalationNotifications = escalations.map((escalation) => escalationToNotification(input.event, escalation));
  const owner = escalations[0]?.owner;

  const notifications = routeNotifications({
    event: input.event,
    notifications: [...workflowNotifications, ...escalationNotifications],
    owner,
  });

  const auditTrail = [
    `Automation event received: ${input.event.type}`,
    ...workflowArtifacts.auditTrail,
    `Rules matched: ${matchedRuleIds.length}`,
    `Escalations generated: ${escalations.length}`,
    `Notifications routed: ${notifications.length}`,
    `SLA compliance estimate: ${sla.compliance}%`,
    `Risk score: ${risk.score}`,
    recommendation ? `Reassignment confidence: ${recommendation.confidence}%` : "No reassignment recommendation generated.",
  ];

  return {
    event: input.event,
    matchedRuleIds,
    workflowArtifacts,
    escalations,
    notifications,
    recommendation,
    auditTrail,
  };
}
