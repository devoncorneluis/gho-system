import type { IntelligencePriority, IntelligenceState } from "./intelligenceTypes";
import { TRIP_STATUS } from "../../tripStatus";

export interface IntelligenceRuleResult {
  id: string;
  priority: IntelligencePriority;
  message: string;
}

export function evaluateOperationalRules(state: IntelligenceState): IntelligenceRuleResult[] {
  const results: IntelligenceRuleResult[] = [];
  const availableDrivers = state.drivers.filter((driver) => driver.availability === "Available").length;
  const activeTrips = state.trips.filter((trip) => trip.status !== TRIP_STATUS.COMPLETED && trip.status !== TRIP_STATUS.CANCELLED).length;
  const availableVehicles = state.vehicles.filter((vehicle) => vehicle.status === "Available").length;

  if (availableDrivers < Math.ceil(activeTrips * 0.3)) {
    results.push({
      id: "driver-capacity",
      priority: "high",
      message: "Available driver capacity is below active trip demand.",
    });
  }

  if (availableVehicles < Math.ceil(activeTrips * 0.25)) {
    results.push({
      id: "vehicle-capacity",
      priority: "high",
      message: "Available vehicle capacity is below active trip demand.",
    });
  }

  if (state.currentEmergencies > 0) {
    results.push({
      id: "active-emergency",
      priority: "critical",
      message: "Active emergency requires dispatcher attention.",
    });
  }

  return results;
}
