export function calculateCompletionRate(
  completed: number,
  total: number
) {
  if (total === 0) return 0;

  return Math.round((completed / total) * 100);
}

export function calculateCancellationRate(
  cancelled: number,
  total: number
) {
  if (total === 0) return 0;

  return Math.round((cancelled / total) * 100);
}

export function calculateFleetAvailability(
  available: number,
  total: number
) {
  if (total === 0) return 0;

  return Math.round((available / total) * 100);
}

export function calculateIncidentRate(
  incidents: number,
  trips: number
) {
  if (trips === 0) return 0;

  return Number(((incidents / trips) * 100).toFixed(1));
}