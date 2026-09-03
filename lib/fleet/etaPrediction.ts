export type EtaStatus =
  | "On Schedule"
  | "Running Late"
  | "No GPS";

export function getEtaPrediction(
  gpsUpdatedAt: string | null | undefined
): EtaStatus {
  if (!gpsUpdatedAt) {
    return "No GPS";
  }

  const minutes =
    (Date.now() -
      new Date(gpsUpdatedAt).getTime()) /
    (1000 * 60);

  if (minutes > 10) {
    return "Running Late";
  }

  return "On Schedule";
}