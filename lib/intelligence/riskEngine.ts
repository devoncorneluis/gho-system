import type { RiskAssessment } from "./intelligenceTypes";

export interface RiskEngineInput {
  tripId: string;
  delayMinutes?: number;
  driverResponse?: string | null;
  passengerCount?: number;
  trackingFreshnessMinutes?: number;
  currentStatus?: string | null;
}

export function assessTripRisk(input: RiskEngineInput): RiskAssessment {
  let score = 0;
  const reasons: string[] = [];

  const delayMinutes = input.delayMinutes ?? 0;
  const freshness = input.trackingFreshnessMinutes ?? 0;
  const response = (input.driverResponse || "pending").toLowerCase();
  const passengerCount = input.passengerCount ?? 0;
  const status = (input.currentStatus || "").toLowerCase();

  if (delayMinutes >= 5) {
    score += Math.min(35, 10 + delayMinutes);
    reasons.push(`Delay signal detected (${delayMinutes} min).`);
  }

  if (response === "pending") {
    score += 12;
    reasons.push("Driver dispatch response is pending.");
  } else if (response === "rejected") {
    score += 20;
    reasons.push("Driver rejected dispatch.");
  }

  if (passengerCount >= 10) {
    score += 12;
    reasons.push(`High passenger load (${passengerCount}).`);
  } else if (passengerCount >= 6) {
    score += 7;
    reasons.push(`Medium passenger load (${passengerCount}).`);
  }

  if (freshness >= 8) {
    score += Math.min(18, freshness);
    reasons.push(`Telemetry freshness is ${freshness} minutes.`);
  }

  if (status === "in progress" || status === "in_transit") {
    score += 8;
    reasons.push("Trip is active and operationally exposed.");
  }

  if (status === "completed") {
    score = Math.max(0, score - 25);
    reasons.push("Trip is completed; operational risk reduced.");
  }

  if (status === "cancelled") {
    score = Math.max(0, score - 15);
    reasons.push("Trip is cancelled; active risk reduced.");
  }

  return {
    tripId: input.tripId,
    score: Math.max(0, Math.min(100, Math.round(score))),
    reasons,
  };
}