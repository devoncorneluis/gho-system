import type { IntelligencePrediction } from "../core/intelligenceTypes";

export function forecastDemand(historicalDemand: number[]): IntelligencePrediction {
  const recent = historicalDemand.slice(-7);
  const value = recent.length === 0 ? 0 : Math.round(recent.reduce((sum, item) => sum + item, 0) / recent.length);

  return {
    id: "demand-forecast",
    label: "Demand forecast",
    value,
    unit: "passengers",
    priority: value >= 120 ? "high" : value >= 90 ? "medium" : "low",
    explanation: [`Forecast based on ${recent.length} recent demand point(s).`],
  };
}
