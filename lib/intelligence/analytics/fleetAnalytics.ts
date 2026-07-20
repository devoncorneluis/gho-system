import type { IntelligenceInsight, IntelligenceVehicle } from "../core/intelligenceTypes";

export function calculateFleetAvailabilityInsight(vehicles: IntelligenceVehicle[]): IntelligenceInsight {
  const available = vehicles.filter((vehicle) => vehicle.status === "Available").length;
  const pct = vehicles.length === 0 ? 0 : Math.round((available / vehicles.length) * 100);

  return {
    id: "fleet-availability",
    title: "Fleet availability",
    value: `${pct}%`,
    status: pct >= 70 ? "healthy" : pct >= 45 ? "watch" : "risk",
    explanation: `${available} of ${vehicles.length} vehicle(s) available.`,
  };
}
