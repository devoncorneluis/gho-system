import { describe, expect, it } from "vitest";
import { detectDelay } from "../../lib/intelligence/delayDetector";
import { assessTripRisk } from "../../lib/intelligence/riskEngine";
import { buildSlaSummary } from "../../lib/intelligence/slaEngine";

describe("intelligence", () => {
  it("detects pickup delay", () => {
    const fiveMinutesAgo = new Date(Date.now() - 10 * 60_000).toISOString();
    const result = detectDelay({
      tripId: "trip-1",
      pickupDueAt: fiveMinutesAgo,
    });

    expect(result).not.toBeNull();
    expect(result?.reason).toContain("Pickup overdue");
  });

  it("assesses risk with delay and pending response", () => {
    const result = assessTripRisk({
      tripId: "trip-1",
      delayMinutes: 12,
      driverResponse: "pending",
      passengerCount: 10,
      trackingFreshnessMinutes: 9,
      currentStatus: "In Progress",
    });

    expect(result.score).toBeGreaterThan(40);
    expect(result.reasons.length).toBeGreaterThan(0);
  });

  it("builds sla summary", () => {
    const summary = buildSlaSummary({
      responseMinutes: 8,
      pickupMinutes: 11,
      arrivalMinutes: 9,
      emergencyAckMinutes: 2,
    });

    expect(summary.breaches).toBe(2);
    expect(summary.compliance).toBe(60);
  });
});
