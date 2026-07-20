import type { IntelligenceRisk, IntelligenceScore } from "../core/intelligenceTypes";

export function explainRecommendation(parts: {
  driver?: IntelligenceScore;
  vehicle?: IntelligenceScore;
  route?: IntelligenceScore;
  risk?: IntelligenceRisk;
}): string[] {
  return [
    parts.driver ? `Driver: ${parts.driver.reasons[0]}` : "Driver recommendation unavailable",
    parts.vehicle ? `Vehicle: ${parts.vehicle.reasons[1]}` : "Vehicle recommendation unavailable",
    parts.route ? `Route: ${parts.route.reasons[1]}` : "Route recommendation unavailable",
    parts.risk ? `Risk: ${parts.risk.label} is ${parts.risk.priority}` : "Risk assessment unavailable",
  ];
}
