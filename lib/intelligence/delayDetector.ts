import type { DelayAlert } from "./intelligenceTypes";

export interface DelayDetectorInput {
  tripId: string;
  pickupDueAt?: string | null;
  dropoffDueAt?: string | null;
  lastLocationUpdatedAt?: string | null;
  currentStatus?: string | null;
  dwellMinutes?: number;
  deviationMinutes?: number;
}

export function detectDelay(input: DelayDetectorInput): DelayAlert | null {
  const now = new Date();
  const pickupDue = input.pickupDueAt ? new Date(input.pickupDueAt) : null;
  const dropoffDue = input.dropoffDueAt ? new Date(input.dropoffDueAt) : null;

  if (pickupDue && now.getTime() - pickupDue.getTime() > 5 * 60 * 1000) {
    return {
      tripId: input.tripId,
      severity: "high",
      reason: "Pickup overdue",
      minutesLate: Math.max(0, Math.round((now.getTime() - pickupDue.getTime()) / 60000)),
    };
  }

  if (dropoffDue && now.getTime() - dropoffDue.getTime() > 5 * 60 * 1000) {
    return {
      tripId: input.tripId,
      severity: "critical",
      reason: "Drop-off overdue",
      minutesLate: Math.max(0, Math.round((now.getTime() - dropoffDue.getTime()) / 60000)),
    };
  }

  if ((input.dwellMinutes ?? 0) > 15) {
    return {
      tripId: input.tripId,
      severity: "medium",
      reason: "Excessive dwell time",
      minutesLate: input.dwellMinutes ?? 0,
    };
  }

  if ((input.deviationMinutes ?? 0) > 10) {
    return {
      tripId: input.tripId,
      severity: "high",
      reason: "Route deviation",
      minutesLate: input.deviationMinutes ?? 0,
    };
  }

  if (input.currentStatus === "stalled" && (input.dwellMinutes ?? 0) > 8) {
    return {
      tripId: input.tripId,
      severity: "medium",
      reason: "Driver stationary too long",
      minutesLate: input.dwellMinutes ?? 0,
    };
  }

  return null;
}
