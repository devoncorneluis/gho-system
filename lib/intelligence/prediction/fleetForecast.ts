import type { IntelligencePrediction, IntelligenceTrip, IntelligenceVehicle } from "../core/intelligenceTypes";

export function forecastFleetRequirement(trips: IntelligenceTrip[], vehicles: IntelligenceVehicle[]): IntelligencePrediction {
  const activeTrips = trips.filter((trip) => trip.status !== "Completed" && trip.status !== "Cancelled").length;
  const availableVehicles = vehicles.filter((vehicle) => vehicle.status === "Available").length;
  const value = Math.max(0, activeTrips - availableVehicles);

  return {
    id: "fleet-requirement",
    label: "Additional fleet required",
    value,
    unit: "vehicles",
    priority: value >= 5 ? "high" : value >= 2 ? "medium" : "low",
    explanation: [`${activeTrips} active trip(s), ${availableVehicles} available vehicle(s).`],
  };
}
