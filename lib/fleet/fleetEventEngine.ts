export type FleetEventType =
  | "emergency"
  | "trip_started"
  | "trip_completed"
  | "trip_cancelled"
  | "gps_offline"
  | "route_deviation";

export type FleetEvent = {
  type: FleetEventType;
  title: string;
  message: string;
  severity: "success" | "warning" | "danger" | "info";
};

export function getFleetEvent(
  type: FleetEventType,
  details?: {
    driverName?: string;
    tripCode?: string;
    minutes?: number;
  }
): FleetEvent {
  switch (type) {
    case "emergency":
      return {
        type,
        title: "🚨 Emergency Alert",
        message: details?.driverName
          ? `${details.driverName} activated an emergency alert.`
          : "A new emergency has been reported.",
        severity: "danger",
      };

    case "trip_started":
      return {
        type,
        title: "🟢 Trip Started",
        message:
          details?.driverName && details?.tripCode
            ? `${details.driverName} started trip ${details.tripCode}.`
            : "A driver has started a scheduled trip.",
        severity: "success",
      };

    case "trip_completed":
      return {
        type,
        title: "🏁 Trip Completed",
        message:
          details?.driverName && details?.tripCode
            ? `${details.driverName} completed trip ${details.tripCode}.`
            : "A driver has completed a trip.",
        severity: "success",
      };

    case "trip_cancelled":
      return {
        type,
        title: "❌ Trip Cancelled",
        message:
          details?.driverName && details?.tripCode
            ? `${details.driverName} cancelled trip ${details.tripCode}.`
            : "A scheduled trip has been cancelled.",
        severity: "warning",
      };

    case "gps_offline":
      return {
        type,
        title: "📍 GPS Offline",
        message:
          details?.driverName && details?.minutes
            ? `${details.driverName} has not reported GPS for ${details.minutes} minutes.`
            : "Driver GPS has stopped reporting.",
        severity: "warning",
      };

    case "route_deviation":
      return {
        type,
        title: "⚠ Route Deviation",
        message:
          details?.driverName
            ? `${details.driverName} appears to be off the planned route.`
            : "A vehicle appears to have deviated from its planned route.",
        severity: "warning",
      };

    default:
      return {
        type,
        title: "Fleet Event",
        message: "A fleet event occurred.",
        severity: "info",
      };
  }
}