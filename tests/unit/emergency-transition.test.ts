import { describe, expect, it } from "vitest";
import { buildEmergencyTransitionPayload } from "../../lib/emergencyTransitionService";

describe("emergency transition payload", () => {
  const occurredAt = "2026-07-02T00:00:00.000Z";

  it("builds acknowledge payload with durable transition timestamp", () => {
    const payload = buildEmergencyTransitionPayload("acknowledge", occurredAt);

    expect(payload.updateData).toEqual({
      status: "Acknowledged",
      acknowledged_at: occurredAt,
    });
    expect(payload.auditAction).toBe("emergency_alert_acknowledged");
    expect(payload.auditDetails).toEqual({ status_to: "Acknowledged" });
  });

  it("requires assigned agent for assign transition", () => {
    expect(() =>
      buildEmergencyTransitionPayload("assign", occurredAt, {
        assignedAgent: "   ",
      })
    ).toThrowError(/assignedAgent is required/);
  });

  it("requires resolution notes for resolve transition", () => {
    expect(() =>
      buildEmergencyTransitionPayload("resolve", occurredAt, {
        resolutionNotes: "",
      })
    ).toThrowError(/resolutionNotes is required/);
  });
});
