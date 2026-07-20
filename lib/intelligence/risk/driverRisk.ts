import { priorityFromScore } from "../core/scoringEngine";
import type { IntelligenceDriver, IntelligenceRisk } from "../core/intelligenceTypes";

export function assessDriverRisk(driver: IntelligenceDriver): IntelligenceRisk {
  const score = Math.min(100, Math.round((100 - driver.onTimeRate) + driver.cancellationRate * 100 + driver.incidentCount * 12));

  return {
    id: `driver-risk-${driver.id}`,
    label: `${driver.name} driver risk`,
    score,
    priority: priorityFromScore(score),
    reasons: [`On-time ${driver.onTimeRate}%`, `Cancellation rate ${driver.cancellationRate}`, `Incidents ${driver.incidentCount}`],
  };
}
