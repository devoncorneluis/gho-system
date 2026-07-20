export type DriverScore = {
  driverId: string;
  score: number;
  reasons: string[];
};

export function scoreDriver(driverId: string, availability: string, responseTimeMinutes: number, completedTrips: number): DriverScore {
  const availabilityWeight = availability === "Available" ? 0.35 : 0.1;
  const responseWeight = Math.max(0, 1 - responseTimeMinutes / 30);
  const volumeWeight = Math.min(1, completedTrips / 20);
  const score = Math.round((availabilityWeight * 100 + responseWeight * 60 + volumeWeight * 40) * 10) / 10;

  return {
    driverId,
    score,
    reasons: [
      availability === "Available" ? "Available for dispatch" : "Currently occupied",
      responseTimeMinutes <= 10 ? "Fast response window" : "Response window is longer than target",
      `Completed trips: ${completedTrips}`,
    ],
  };
}
