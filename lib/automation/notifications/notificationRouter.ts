import type { AutomationEvent, AutomationNotification } from "../../../types/automation";
import { resolveNotificationChannels } from "./notificationPolicy";
import { sortNotificationsByPriority } from "./notificationPriority";

export interface NotificationRouteInput {
  event: AutomationEvent;
  notifications: AutomationNotification[];
  owner?: "dispatcher" | "operations" | "safety" | "executive" | "system";
}

export function routeNotifications(input: NotificationRouteInput): AutomationNotification[] {
  const routed = input.notifications.map((notification) => ({
    ...notification,
    channels: resolveNotificationChannels(notification, {
      eventType: input.event.type,
      owner: input.owner,
    }),
  }));

  return sortNotificationsByPriority(routed);
}
