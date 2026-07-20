import type { IntelligencePrediction } from "../core/intelligenceTypes";

export function predictWeatherRisk(weatherRisk = 0): IntelligencePrediction {
  const value = Math.round(weatherRisk * 100);

  return {
    id: "weather-risk",
    label: "Weather risk",
    value,
    unit: "score",
    priority: value >= 70 ? "high" : value >= 35 ? "medium" : "low",
    explanation: ["Weather risk is optional until a weather integration is connected."],
  };
}
