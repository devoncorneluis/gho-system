import type { EscalationDecision, EscalationOwner, EscalationSignal } from "./escalationTypes";
import type { AutomationPriority, AutomationSeverity } from "../../../types/automation";

export interface EscalationRule {
  id: string;
  when: (signal: EscalationSignal) => boolean;
  severity: AutomationSeverity;
  priority: AutomationPriority;
  owner: EscalationOwner;
  recommendedAction: string;
  deadlineMinutes: number;
  reason: (signal: EscalationSignal) => string;
  tags: string[];
}

function addMinutes(isoNow: string, minutes: number): string {
  const now = new Date(isoNow);
  return new Date(now.getTime() + minutes * 60_000).toISOString();
}

function buildDecision(rule: EscalationRule, signal: EscalationSignal, nowIso: string): EscalationDecision {
  return {
    id: `${rule.id}-${signal.tripId}-${nowIso}`,
    ruleId: rule.id,
    tripId: signal.tripId,
    severity: rule.severity,
    priority: rule.priority,
    recommendedAction: rule.recommendedAction,
    deadline: addMinutes(nowIso, rule.deadlineMinutes),
    owner: rule.owner,
    reason: rule.reason(signal),
    tags: rule.tags,
  };
}

export const ESCALATION_RULES: EscalationRule[] = [
  {
    id: "driver-response-overdue",
    when: (s) => (s.driverResponseMinutes ?? 0) > 5,
    severity: "high",
    priority: "p2",
    owner: "dispatcher",
    recommendedAction: "Contact backup driver and trigger reassignment.",
    deadlineMinutes: 5,
    reason: (s) => `Driver response overdue by ${s.driverResponseMinutes ?? 0} minutes.`,
    tags: ["driver", "response", "overdue"],
  },
  {
    id: "pickup-overdue",
    when: (s) => (s.pickupDelayMinutes ?? 0) > 5,
    severity: "high",
    priority: "p2",
    owner: "operations",
    recommendedAction: "Re-sequence pickups and notify impacted passengers.",
    deadlineMinutes: 10,
    reason: (s) => `Pickup overdue by ${s.pickupDelayMinutes ?? 0} minutes.`,
    tags: ["pickup", "delay"],
  },
  {
    id: "vehicle-idle",
    when: (s) => (s.vehicleIdleMinutes ?? 0) > 15,
    severity: "medium",
    priority: "p3",
    owner: "operations",
    recommendedAction: "Check driver status and confirm route progress.",
    deadlineMinutes: 15,
    reason: (s) => `Vehicle idle for ${s.vehicleIdleMinutes ?? 0} minutes.`,
    tags: ["vehicle", "idle"],
  },
  {
    id: "emergency-active",
    when: (s) => Boolean(s.emergencyActive),
    severity: "critical",
    priority: "p1",
    owner: "safety",
    recommendedAction: "Activate emergency protocol and dispatch response immediately.",
    deadlineMinutes: 1,
    reason: () => "Emergency signal is active.",
    tags: ["emergency"],
  },
  {
    id: "gps-offline",
    when: (s) => (s.gpsOfflineMinutes ?? 0) > 6,
    severity: "high",
    priority: "p2",
    owner: "operations",
    recommendedAction: "Restore telemetry connectivity and verify driver status.",
    deadlineMinutes: 8,
    reason: (s) => `GPS offline for ${s.gpsOfflineMinutes ?? 0} minutes.`,
    tags: ["gps", "offline"],
  },
  {
    id: "trip-delayed",
    when: (s) => (s.tripDelayMinutes ?? 0) > 5,
    severity: "high",
    priority: "p2",
    owner: "dispatcher",
    recommendedAction: "Generate replacement recommendation and rebalance dispatch.",
    deadlineMinutes: 10,
    reason: (s) => `Trip delayed by ${s.tripDelayMinutes ?? 0} minutes.`,
    tags: ["trip", "delay"],
  },
  {
    id: "route-deviation",
    when: (s) => (s.routeDeviationMinutes ?? 0) > 10,
    severity: "high",
    priority: "p2",
    owner: "operations",
    recommendedAction: "Validate route deviation and issue corrective navigation.",
    deadlineMinutes: 8,
    reason: (s) => `Route deviation exceeds ${s.routeDeviationMinutes ?? 0} minutes.`,
    tags: ["route", "deviation"],
  },
  {
    id: "sla-breach",
    when: (s) => (s.slaBreaches ?? 0) > 0,
    severity: "medium",
    priority: "p3",
    owner: "operations",
    recommendedAction: "Review breached SLA segments and recover schedule.",
    deadlineMinutes: 20,
    reason: (s) => `SLA breaches detected: ${s.slaBreaches ?? 0}.`,
    tags: ["sla", "breach"],
  },
  {
    id: "high-risk-trip",
    when: (s) => (s.riskScore ?? 0) >= 70,
    severity: "critical",
    priority: "p1",
    owner: "executive",
    recommendedAction: "Open command review and assign senior dispatcher.",
    deadlineMinutes: 3,
    reason: (s) => `Risk score is ${s.riskScore ?? 0}.`,
    tags: ["risk"],
  },
];

export function evaluateEscalationRules(signal: EscalationSignal, nowIso: string): EscalationDecision[] {
  return ESCALATION_RULES.filter((rule) => rule.when(signal)).map((rule) => buildDecision(rule, signal, nowIso));
}
