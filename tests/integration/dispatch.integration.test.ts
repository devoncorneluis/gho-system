import { describe, expect, it } from "vitest";
import { buildDispatchRecommendation } from "../../lib/dispatch/dispatchEngine";

describe("dispatch integration", () => {
  it("builds a complete dispatch recommendation payload", () => {
    const recommendation = buildDispatchRecommendation(
      "trip-1",
      "driver-1",
      "vehicle-1",
      "route-1",
      "Available",
      5,
      20,
      "Available",
      14,
      80,
      12,
      3,
      4,
    );

    expect(recommendation.bestDriver.score).toBeGreaterThan(0);
    expect(recommendation.bestVehicle.score).toBeGreaterThan(0);
    expect(recommendation.bestRoute.score).toBeGreaterThan(0);
    expect(recommendation.optimizedPlan.score).toBeGreaterThan(0);
  });
});
