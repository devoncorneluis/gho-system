export type FleetTripStatus =
  | "On Time"
  | "Delayed"
  | "GPS Offline"
  | "No Active Trip";

export function getTripStatus(
  hasActiveTrip: boolean,
  gpsUpdatedAt: string | null | undefined
): FleetTripStatus {
  if (!hasActiveTrip) {
    return "No Active Trip";
  }

  if (!gpsUpdatedAt) {
    return "GPS Offline";
  }

  const lastUpdate = new Date(gpsUpdatedAt).getTime();
  const minutesSinceUpdate =
    (Date.now() - lastUpdate) / (1000 * 60);

  if (minutesSinceUpdate > 10) {
    return "Delayed";
  }

  return "On Time";
}
export function getGpsAge(
  gpsUpdatedAt: string | null | undefined
): string {
  if (!gpsUpdatedAt) {
    return "No Signal";
  }

  const minutes = Math.floor(
    (Date.now() - new Date(gpsUpdatedAt).getTime()) /
      (1000 * 60)
  );

  if (minutes < 1) {
    return "Just now";
  }

  if (minutes === 1) {
    return "1 min ago";
  }

  if (minutes < 60) {
    return `${minutes} mins ago`;
  }

  const hours = Math.floor(minutes / 60);

  if (hours === 1) {
    return "1 hour ago";
  }

  return `${hours} hours ago`;
}