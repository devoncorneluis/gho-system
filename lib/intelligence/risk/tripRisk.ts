import { priorityFromScore } from "../core/scoringEngine";
import type { IntelligenceRisk, IntelligenceTrip } from "../core/intelligenceTypes";

export function assessTripRiskV2(trip: IntelligenceTrip): IntelligenceRisk {
  const score = Math.min(100, Math.round(trip.delayMinutes * 4 + Math.max(0, trip.passengerCount - 6) * 4));

  return {
    id: `trip-risk-${trip.id}`,
    label: `${trip.code} trip risk`,
    score,
    priority: priorityFromScore(score),
    reasons: [`Delay ${trip.delayMinutes} min`, `Passenger count ${trip.passengerCount}`],
  };
}
