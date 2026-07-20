import type { IntelligencePrediction, IntelligenceRoute } from "../core/intelligenceTypes";

export function predictTrafficImpact(routes: IntelligenceRoute[]): IntelligencePrediction {
  const values = routes.map((route) => route.trafficDelayMinutes || 0);
  const value = values.length === 0 ? 0 : Math.round(values.reduce((sum, item) => sum + item, 0) / values.length);

  return {
    id: "traffic-impact",
    label: "Traffic impact",
    value,
    unit: "minutes",
    priority: value >= 15 ? "high" : value >= 8 ? "medium" : "low",
    explanation: ["Average live traffic delay across known routes."],
  };
}
