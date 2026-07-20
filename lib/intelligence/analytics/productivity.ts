import type { IntelligenceDriver, IntelligenceInsight } from "../core/intelligenceTypes";

export function calculateProductivityInsight(drivers: IntelligenceDriver[]): IntelligenceInsight {
  const average = drivers.length === 0 ? 0 : Math.round(drivers.reduce((sum, driver) => sum + driver.completedTrips, 0) / drivers.length);

  return {
    id: "driver-productivity",
    title: "Driver productivity",
    value: `${average} trips`,
    status: average >= 10 ? "healthy" : average >= 6 ? "watch" : "risk",
    explanation: "Average completed trips per driver.",
  };
}
