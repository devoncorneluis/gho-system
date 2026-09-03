import type { RouteRisk } from "./routeRisk";
import type { EtaStatus } from "./etaPrediction";

export type FleetPriority =
  | "Normal"
  | "Attention"
  | "Immediate";

export function getFleetPriority(
  health: "Healthy" | "Warning" | "Critical",
  risk: RouteRisk,
  eta: EtaStatus
): FleetPriority {
  if (
    health === "Critical" ||
    risk === "High" ||
    eta === "No GPS"
  ) {
    return "Immediate";
  }

  if (
    health === "Warning" ||
    risk === "Medium" ||
    eta === "Running Late"
  ) {
    return "Attention";
  }

  return "Normal";
}