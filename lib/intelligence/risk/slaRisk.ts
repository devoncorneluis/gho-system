import { priorityFromScore } from "../core/scoringEngine";
import type { IntelligenceRisk, IntelligenceTrip } from "../core/intelligenceTypes";

export function assessSlaRisk(trip: IntelligenceTrip): IntelligenceRisk {
  const score = trip.delayMinutes <= trip.slaTargetMinutes ? 20 : Math.min(100, 50 + (trip.delayMinutes - trip.slaTargetMinutes) * 4);

  return {
    id: `sla-risk-${trip.id}`,
    label: `${trip.code} SLA risk`,
    score,
    priority: priorityFromScore(score),
    reasons: [`Delay ${trip.delayMinutes} min`, `SLA target ${trip.slaTargetMinutes} min`],
  };
}
