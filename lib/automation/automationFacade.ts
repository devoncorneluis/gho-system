import type { AutomationEventType } from "../../types/automation";
import type { ReassignmentRecommendation } from "../../types/recommendation";
import { calculateDriverReadiness } from "../analytics/driverAnalytics";
import { buildDispatchRecommendation } from "../dispatch/dispatchEngine";
import { assessTripRisk } from "../intelligence/riskEngine";
import type { MonitoringSnapshot } from "../monitoring/monitoringTypes";
import { captureError } from "../monitoring/errorAggregator";
import { composeMonitoringSnapshot } from "../monitoring/snapshotComposer";
import { appendTelemetryToAuditTrail } from "../observability/auditBridge";
import { recordTelemetryEvent } from "../observability/telemetryEngine";
import { runAutomationEngine } from "./automationEngine";
import { AUTOMATION_RULES } from "./automationRules";
import { getFleetStatus } from "../operations/fleetStatus";
import {
  getOperationsTimeline,
  type TimelineEvent,
} from "../operations/timelineService";
export type ControlTowerAction =
  | "approve_recommendation"
  | "reassign_driver"
  | "notify_driver"
  | "escalate"
  | "open_trip"
  | "resolve_alert"
  | "create_emergency_ticket";

export interface ActionGuardrailTelemetry {
  action: ControlTowerAction;
  outcome: "blocked" | "caution";
  reason: string;
  monitoringStatus: MonitoringSnapshot["overallStatus"];
  queueDepth: number;
  errorCountLastHour: number;
  happenedAt: string;
}
export type FleetStatusItem = {
  id: string;
  driverName: string;
  vehicleName: string;
  tripCode: string | null;
  gpsConnected: boolean;
  status: "Available" | "Assigned" | "En Route" | "Emergency";
  lastUpdate: string | null;
};
export interface RecommendationDetails {
  driverScore: number;
  distanceKm: number;
  etaMinutes: number;
  capacity: number;
  currentWorkload: number;
  shiftHours: number;
  acceptanceHistory: number;
  riskScore: number;
  confidence: number;
}

export interface ControlTowerSnapshot {
  recommendation?: ReassignmentRecommendation;
  recommendationDetails?: RecommendationDetails;

  fleetStatus: FleetStatusItem[];

  escalations: Array<{
    id: string;
    severity: "low" | "medium" | "high" | "critical";
    priority: "p1" | "p2" | "p3" | "p4";
    owner: "dispatcher" | "operations" | "safety" | "executive" | "system";
    recommendedAction: string;
    deadline: string;
  }>;

workflows: {
  running: number;
  waiting: number;
  completed: number;
  failed: number;
  paused: number;
};

automationStatus: {
  rulesLoaded: number;
  recommendationsToday: number;
  escalationsToday: number;
  workflowsRunning: number;
  automationHealth: "Healthy" | "Degraded" | "Down";
  lastEvaluation: string;
};

monitoring: MonitoringSnapshot;
timeline: TimelineEvent[];
summaryCards: {
  fleet: number;
  dispatch: number;
  sla: number;
  delay: number;
  risk: number;
  emergencies: number;
  automation: number;
};

auditTrail: string[];
}


function buildDemoCandidates() {
  return {
    drivers: [
      {
        driverId: "drv-1",
        driverName: "Maya Hassan",
        availabilityStatus: "Available",
        acceptanceRate: 95,
        workloadScore: 26,
        shiftHours: 6,
        etaMinutes: 7,
      },
      {
        driverId: "drv-2",
        driverName: "Omar Noor",
        availabilityStatus: "Available",
        acceptanceRate: 88,
        workloadScore: 44,
        shiftHours: 9,
        etaMinutes: 12,
      },
    ],
    vehicles: [
      {
        vehicleId: "veh-1",
        vehicleName: "Toyota Quantum",
        status: "Available",
        capacity: 14,
        etaMinutes: 6,
        riskScore: 18,
      },
      {
        vehicleId: "veh-2",
        vehicleName: "Mercedes Sprinter",
        status: "Available",
        capacity: 18,
        etaMinutes: 10,
        riskScore: 25,
      },
    ],
    routes: [
      {
        routeId: "route-a",
        distanceKm: 14,
        etaMinutes: 22,
        trafficScore: 31,
        deviationRisk: 20,
      },
      {
        routeId: "route-b",
        distanceKm: 18,
        etaMinutes: 26,
        trafficScore: 38,
        deviationRisk: 24,
      },
    ],
  };
}

function toEventType(action?: ControlTowerAction): AutomationEventType {
  if (action === "create_emergency_ticket") return "emergency";
  if (action === "resolve_alert") return "trip_updated";
  if (action === "notify_driver") return "driver_response";
  if (action === "escalate") return "sla_breach";
  if (action === "reassign_driver") return "driver_rejected";
  if (action === "approve_recommendation") return "trip_updated";
  if (action === "open_trip") return "trip_updated";
  return "trip_delayed";
}

export async function evaluateControlTower(
  action?: ControlTowerAction,
  telemetry?: ActionGuardrailTelemetry
): Promise<ControlTowerSnapshot> {
  const candidates = buildDemoCandidates();
  const nowIso = new Date().toISOString();
  const risk = assessTripRisk({
    tripId: "trip-104",
    delayMinutes: 9,
    driverResponse: action === "reassign_driver" ? "rejected" : "pending",
    passengerCount: 11,
    trackingFreshnessMinutes: 7,
    currentStatus: "In Progress",
  });

  const automationResult = await runAutomationEngine({
    event: {
      id: `evt-${Date.now()}`,
      type: toEventType(action),
      tripId: "trip-104",
      createdAt: nowIso,
      source: "operations_control_tower",
      payload: {
        responseMinutes: action === "notify_driver" ? 3 : 8,
        pickupDelayMinutes: 9,
        vehicleIdleMinutes: 7,
        gpsOfflineMinutes: 7,
        routeDeviationMinutes: 6,
        slaBreaches: action === "escalate" ? 1 : 0,
        driverResponse: action === "reassign_driver" ? "rejected" : "pending",
      },
    },
    tripSnapshot: {
      tripId: "trip-104",
      tripCode: "TRIP-104",
      status: "In Progress",
      pickupDueAt: new Date(Date.now() - 9 * 60000).toISOString(),
      dropoffDueAt: new Date(Date.now() + 14 * 60000).toISOString(),
      driverResponse: action === "reassign_driver" ? "rejected" : "pending",
      passengerCount: 11,
      lastLocationUpdatedAt: new Date(Date.now() - 7 * 60000).toISOString(),
      routeDeviationMinutes: 6,
      emergencyActive: action === "create_emergency_ticket",
      responseMinutes: action === "notify_driver" ? 3 : 8,
      pickupMinutes: 9,
      arrivalMinutes: 11,
      emergencyAckMinutes: action === "create_emergency_ticket" ? 1 : 2,
    },
    candidates,
  });

  const driverReadiness = calculateDriverReadiness([
    { availabilityStatus: "Available", responseMinutes: 4, completedTrips: 9 },
    { availabilityStatus: "On Trip", responseMinutes: 8, completedTrips: 7 },
  ]);

  const dispatchRecommendation = buildDispatchRecommendation(
    "trip-104",
    "drv-1",
    "veh-1",
    "route-a",
    "Available",
    4,
    24,
    "Available",
    14,
    82,
    14,
    3,
    4,
  );

  const recommendation = automationResult.recommendation;
  const recommendationDetails: RecommendationDetails | undefined = recommendation
    ? {
        driverScore: dispatchRecommendation.bestDriver.score,
        distanceKm: 14,
        etaMinutes: 22,
        capacity: 14,
        currentWorkload: 26,
        shiftHours: 6,
        acceptanceHistory: 95,
        riskScore: risk.score,
        confidence: recommendation.confidence,
      }
    : undefined;

  const workflowsRunning = automationResult.workflowArtifacts.workflowResults.length;
  const queueDepth = automationResult.escalations.length * 12 + workflowsRunning * 5 + (action === "reassign_driver" ? 120 : 30);
  const oldestQueueAgeSeconds = action === "escalate" ? 310 : action === "reassign_driver" ? 95 : 35;
  const realtimeConnected = action !== "create_emergency_ticket";
  const realtimeReconnectAttempts = realtimeConnected ? 0 : 6;
  const capturedErrors = [
    ...(risk.score >= 75 ? [captureError("risk_engine", "Elevated trip risk score detected.", "high")] : []),
    ...(!realtimeConnected
      ? [captureError("realtime_gateway", "Realtime stream degraded during emergency handling.", "critical")]
      : []),
  ];
  const monitoring = composeMonitoringSnapshot({
    queueDepth,
    oldestQueueAgeSeconds,
    realtimeConnected,
    realtimeReconnectAttempts,
    automation: {
      workflowsRunning,
      escalationsPending: automationResult.escalations.length,
      failedWorkflows: 0,
    },
    capturedErrors,
  });

  const telemetryEvent = telemetry
    ? recordTelemetryEvent({
        action: telemetry.action,
        outcome: telemetry.outcome,
        operatorId: "ops-control-tower",
        platformId: "platform-demo",
        screen: "operations",
        reason: telemetry.reason,
        durationMs: undefined,
        dispatchId: "dispatch-guardrail",
        happenedAt: telemetry.happenedAt,
      })
    : undefined;
const fleetStatus = await getFleetStatus();
const timeline = await getOperationsTimeline();
  return {
    recommendation,
    recommendationDetails,

    fleetStatus,
    timeline,
    escalations: automationResult.escalations,
    workflows: {
      running: workflowsRunning,
      waiting: action === "reassign_driver" ? 1 : 0,
      completed: Math.max(0, workflowsRunning - (action === "reassign_driver" ? 1 : 0)),
      failed: 0,
      paused: 0,
    },
    automationStatus: {
      rulesLoaded: AUTOMATION_RULES.length,
      recommendationsToday: recommendation ? 1 : 0,
      escalationsToday: automationResult.escalations.length,
      workflowsRunning,
      automationHealth: "Healthy",
      lastEvaluation: nowIso,
    },
    monitoring,
    summaryCards: {
      fleet: driverReadiness,
      dispatch: dispatchRecommendation.optimizedPlan.score,
      sla: action === "escalate" ? 72 : 84,
      delay: 9,
      risk: risk.score,
      emergencies: action === "create_emergency_ticket" ? 1 : 0,
      automation: automationResult.notifications.length > 0 ? 100 : 85,
    },
    auditTrail: appendTelemetryToAuditTrail(automationResult.auditTrail, telemetryEvent),
  };
}
