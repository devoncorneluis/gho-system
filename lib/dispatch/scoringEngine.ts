export type DriverScoreInput = {
  available: boolean;
  onDuty: boolean;
  hasActiveTrip: boolean;
  hasIncident: boolean;
  gpsFresh: boolean;
};

export function scoreDriver(
  input: DriverScoreInput
): number {
  let score = 100;

  if (!input.available) score -= 40;

  if (!input.onDuty) score -= 20;

  if (input.hasActiveTrip) score -= 35;

  if (input.hasIncident) score -= 25;

  if (!input.gpsFresh) score -= 10;

  return Math.max(score, 0);
}

export type VehicleScoreInput = {
  available: boolean;
  assigned: boolean;
  capacityOk: boolean;
};

export function scoreVehicle(
  input: VehicleScoreInput
): number {
  let score = 100;

  if (!input.available) score -= 40;

  if (input.assigned) score -= 35;

  if (!input.capacityOk) score -= 30;

  return Math.max(score, 0);
}