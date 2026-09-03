import { ActivityType } from "./activityTypes";

export function formatActivityDescription(
  activityType: ActivityType,
  entityName: string
): string {
  switch (activityType) {
    case "trip_created":
      return `Trip ${entityName} created.`;

    case "trip_assigned":
      return `Trip ${entityName} assigned.`;

    case "trip_started":
      return `Trip ${entityName} started.`;

    case "trip_completed":
      return `Trip ${entityName} completed.`;

    case "trip_cancelled":
      return `Trip ${entityName} cancelled.`;

    case "smart_dispatch":
      return `Smart Dispatch assigned ${entityName}.`;

    case "driver_created":
      return `Driver ${entityName} created.`;

    case "driver_updated":
      return `Driver ${entityName} updated.`;

    case "vehicle_created":
      return `Vehicle ${entityName} created.`;

    case "vehicle_updated":
      return `Vehicle ${entityName} updated.`;

    case "incident_created":
      return `Incident created: ${entityName}.`;

    case "incident_resolved":
      return `Incident resolved: ${entityName}.`;

    case "emergency_created":
      return `Emergency created: ${entityName}.`;

    case "emergency_resolved":
      return `Emergency resolved: ${entityName}.`;

    case "user_login":
      return `${entityName} logged in.`;

    case "user_logout":
      return `${entityName} logged out.`;

    case "report_exported":
      return `${entityName} report exported.`;

    case "invoice_created":
      return `Invoice ${entityName} created.`;

    case "invoice_paid":
      return `Invoice ${entityName} paid.`;

    case "payment_recorded":
      return `Payment recorded for ${entityName}.`;

    default:
      return entityName;
  }
}
