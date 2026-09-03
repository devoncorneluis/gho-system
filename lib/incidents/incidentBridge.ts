import type { FleetEvent } from "../fleet/fleetEventEngine";
import { createIncident } from "./incidentEngine";
import { addIncident } from "./incidentStore";

export async function handleFleetEvent(
  event: FleetEvent,
  platformId: string
) {
  switch (event.type) {
    case "emergency":
await addIncident(
  createIncident({
    type: "Emergency",
    severity: "Critical",
    description: event.message,
  }),
  platformId
);
      break;

    case "trip_cancelled":
      await addIncident(
        createIncident({
          type: "Trip Cancelled",
          severity: "Medium",
          description: event.message,
        }),
        platformId
      );
      break;

    case "gps_offline":
      await addIncident(
        createIncident({
          type: "GPS Offline",
          severity: "High",
          description: event.message,
        }),
        platformId
      );
      break;

    case "route_deviation":
      await addIncident(
        createIncident({
          type: "Route Deviation",
          severity: "High",
          description: event.message,
        }),
        platformId
      );
      break;

    default:
      break;
  }
}