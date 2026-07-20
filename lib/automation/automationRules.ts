import type { AutomationEvent } from "../../types/automation";
import type { AutomationConfig } from "./automationConfig";

export interface AutomationRule {
  id: string;
  description: string;
  eventTypes: AutomationEvent["type"][];
  when: (event: AutomationEvent, config: AutomationConfig) => boolean;
}

function asNumber(payload: Record<string, unknown>, key: string): number {
  const value = payload[key];
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

export const AUTOMATION_RULES: AutomationRule[] = [
  {
    id: "driver-response-overdue",
    description: "Escalate when driver response time exceeds threshold.",
    eventTypes: ["driver_response", "driver_response_overdue", "trip_updated"],
    when: (event, config) => asNumber(event.payload, "responseMinutes") > config.thresholds.driverResponseOverdueMinutes,
  },
  {
    id: "pickup-overdue",
    description: "Escalate when pickup is overdue.",
    eventTypes: ["trip_updated", "pickup_overdue", "trip_delayed"],
    when: (event, config) => asNumber(event.payload, "pickupDelayMinutes") > config.thresholds.pickupOverdueMinutes,
  },
  {
    id: "vehicle-idle",
    description: "Escalate when a vehicle remains idle too long.",
    eventTypes: ["trip_updated", "vehicle_idle"],
    when: (event, config) => asNumber(event.payload, "vehicleIdleMinutes") > config.thresholds.vehicleIdleMinutes,
  },
  {
    id: "emergency-active",
    description: "Escalate immediately on emergency events.",
    eventTypes: ["emergency"],
    when: () => true,
  },
  {
    id: "gps-offline",
    description: "Escalate when telemetry is stale or offline.",
    eventTypes: ["gps_offline", "trip_updated"],
    when: (event, config) => asNumber(event.payload, "gpsOfflineMinutes") > config.thresholds.gpsOfflineMinutes,
  },
  {
    id: "route-deviation",
    description: "Escalate when route deviation exceeds threshold.",
    eventTypes: ["route_deviation", "trip_updated"],
    when: (event, config) => asNumber(event.payload, "routeDeviationMinutes") > config.thresholds.routeDeviationMinutes,
  },
  {
    id: "sla-breach",
    description: "Escalate when SLA breach count is positive.",
    eventTypes: ["sla_breach", "trip_updated"],
    when: (event) => asNumber(event.payload, "slaBreaches") > 0,
  },
];

export function evaluateAutomationRules(event: AutomationEvent, config: AutomationConfig): string[] {
  return AUTOMATION_RULES
    .filter((rule) => rule.eventTypes.includes(event.type))
    .filter((rule) => rule.when(event, config))
    .map((rule) => rule.id);
}
