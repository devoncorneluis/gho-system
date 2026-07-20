import { describe, expect, it } from "vitest";
import { calculateAverageOccupancy, calculateTripSuccessRate } from "../../lib/analytics/tripAnalytics";
import { calculateFleetUtilization } from "../../lib/analytics/fleetAnalytics";

describe("analytics", () => {
  it("calculates trip success rate", () => {
    const result = calculateTripSuccessRate([
      { status: "Completed" },
      { status: "Completed" },
      { status: "Assigned" },
    ]);

    expect(result).toBe(67);
  });

  it("calculates average occupancy", () => {
    const occupancy = calculateAverageOccupancy([
      { status: "Completed", passengerCount: 4 },
      { status: "Completed", passengerCount: 6 },
      { status: "Assigned", passengerCount: 2 },
    ]);

    expect(occupancy).toBe(4);
  });

  it("calculates fleet utilization", () => {
    expect(calculateFleetUtilization(5, 10)).toBe(50);
  });
});
