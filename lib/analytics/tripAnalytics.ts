export type TripMetric = {
  status: string;
  passengerCount?: number;
  durationMinutes?: number;
};

export function calculateTripSuccessRate(trips: TripMetric[]): number {
  if (!trips.length) return 0;
  const completedTrips = trips.filter((trip) => trip.status === "Completed").length;
  return Math.round((completedTrips / trips.length) * 100);
}

export function calculateAverageOccupancy(trips: TripMetric[]): number {
  if (!trips.length) return 0;
  const totalPassengers = trips.reduce((sum, trip) => sum + (trip.passengerCount ?? 0), 0);
  return Number((totalPassengers / trips.length).toFixed(1));
}
