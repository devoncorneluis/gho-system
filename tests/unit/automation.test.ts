import { describe, expect, it } from "vitest";
import { runAutomationEngine } from "../../lib/automation/automationEngine";

describe("automation", () => {
  it("produces escalations and notifications for delayed trip", async () => {
    const result = await runAutomationEngine({
      event: {
        id: "evt-1",
        type: "trip_delayed",
        tripId: "trip-104",
        createdAt: new Date().toISOString(),
        source: "test",
        payload: {
          pickupDelayMinutes: 12,
          responseMinutes: 9,
          routeDeviationMinutes: 2,
          slaBreaches: 1,
        },
      },
      tripSnapshot: {
        tripId: "trip-104",
        status: "In Progress",
        pickupDueAt: new Date(Date.now() - 12 * 60_000).toISOString(),
        dropoffDueAt: new Date(Date.now() + 20 * 60_000).toISOString(),
        driverResponse: "pending",
        passengerCount: 8,
        lastLocationUpdatedAt: new Date(Date.now() - 6 * 60_000).toISOString(),
      },
    });

    expect(result.escalations.length).toBeGreaterThan(0);
    expect(result.notifications.length).toBeGreaterThan(0);
    expect(result.auditTrail.length).toBeGreaterThan(0);
  });
});
