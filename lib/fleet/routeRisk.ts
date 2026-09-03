export type RouteRisk =
  | "Low"
  | "Medium"
  | "High";

export function getRouteRisk(
  routeStatus:
    | "On Route"
    | "Minor Deviation"
    | "Major Deviation"
    | "No GPS"
): RouteRisk {
  switch (routeStatus) {
    case "Major Deviation":
      return "High";

    case "Minor Deviation":
      return "Medium";

    case "No GPS":
      return "High";

    default:
      return "Low";
  }
}