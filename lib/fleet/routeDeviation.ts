export type RouteDeviationStatus =
  | "On Route"
  | "Minor Deviation"
  | "Major Deviation"
  | "No GPS";

export function getRouteDeviation(
  latitude: number | null | undefined,
  longitude: number | null | undefined
): RouteDeviationStatus {
  if (latitude == null || longitude == null) {
    return "No GPS";
  }

  // Placeholder until planned routes are connected.
  // Later this will compare live GPS against the planned route.
  return "On Route";
}