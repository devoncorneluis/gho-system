import type { AutomationEvent, AutomationNotification } from "../../../types/automation";

export interface NotificationPolicyContext {
  eventType: AutomationEvent["type"];
  owner?: "dispatcher" | "operations" | "safety" | "executive" | "system";
}

export function resolveNotificationChannels(
  notification: AutomationNotification,
  context: NotificationPolicyContext
): AutomationNotification["channels"] {
  const base: AutomationNotification["channels"] = ["operations_dashboard"];

  if (context.owner === "dispatcher") {
    base.push("driver_dashboard");
  }

  if (context.owner === "safety" || notification.severity === "critical") {
    base.push("sms", "push");
  }

  if (context.owner === "executive" || notification.priority === "p1") {
    base.push("executive_dashboard", "email");
  }

  if (context.eventType === "trip_delayed" || context.eventType === "pickup_overdue") {
    base.push("client_portal");
  }

  return [...new Set(base)];
}
