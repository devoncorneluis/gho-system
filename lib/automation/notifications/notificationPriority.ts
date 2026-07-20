import type { AutomationNotification } from "../../../types/automation";

const priorityWeight: Record<AutomationNotification["priority"], number> = {
  p1: 4,
  p2: 3,
  p3: 2,
  p4: 1,
};

const severityWeight: Record<AutomationNotification["severity"], number> = {
  critical: 4,
  high: 3,
  medium: 2,
  low: 1,
};

export function notificationRank(notification: AutomationNotification): number {
  return priorityWeight[notification.priority] * 10 + severityWeight[notification.severity];
}

export function sortNotificationsByPriority(notifications: AutomationNotification[]): AutomationNotification[] {
  return [...notifications].sort((a, b) => notificationRank(b) - notificationRank(a));
}
