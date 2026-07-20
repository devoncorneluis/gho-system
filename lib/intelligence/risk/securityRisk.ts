import { priorityFromScore } from "../core/scoringEngine";
import type { IntelligenceRisk } from "../core/intelligenceTypes";

export function assessSecurityRisk(securityAlerts = 0): IntelligenceRisk {
  const score = Math.min(100, securityAlerts * 25);

  return {
    id: "security-risk",
    label: "Security risk",
    score,
    priority: priorityFromScore(score),
    reasons: [`${securityAlerts} active security alert(s).`],
  };
}
