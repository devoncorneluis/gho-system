import { NotificationType } from "./notificationTypes";

export function formatNotification(
  type: NotificationType,
  entity: string
) {
  switch (type) {
    case "trip_assigned":
      return {
        title: "Trip Assigned",
        message: `You have been assigned to ${entity}.`,
      };

    case "trip_started":
      return {
        title: "Trip Started",
        message: `${entity} has started.`,
      };

    case "trip_completed":
      return {
        title: "Trip Completed",
        message: `${entity} has been completed.`,
      };

    case "trip_cancelled":
      return {
        title: "Trip Cancelled",
        message: `${entity} has been cancelled.`,
      };

    case "driver_assigned":
      return {
        title: "Driver Assigned",
        message: `${entity} has been assigned.`,
      };

    case "incident_created":
      return {
        title: "Incident",
        message: `New incident: ${entity}.`,
      };

    case "incident_resolved":
      return {
        title: "Incident Resolved",
        message: `${entity} resolved.`,
      };

    case "emergency_created":
      return {
        title: "Emergency Alert",
        message: `${entity}.`,
      };

    case "emergency_resolved":
      return {
        title: "Emergency Cleared",
        message: `${entity}.`,
      };

    default:
      return {
        title: "System Notification",
        message: entity,
      };
  }
}