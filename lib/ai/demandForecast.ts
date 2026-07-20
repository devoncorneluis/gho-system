export function forecastDemand(historicalDemand: number[]): number {
  if (historicalDemand.length === 0) {
    return 0;
  }

  const recent = historicalDemand.slice(-7);
  const total = recent.reduce((sum, value) => sum + value, 0);
  return Math.round(total / recent.length);
}

export function classifyDemand(forecast: number, capacity: number): "Normal" | "Elevated" | "High" {
  if (capacity <= 0) {
    return "High";
  }

  const utilization = forecast / capacity;
  if (utilization >= 0.9) return "High";
  if (utilization >= 0.75) return "Elevated";
  return "Normal";
}
