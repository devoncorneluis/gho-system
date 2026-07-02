import { describe, expect, it, vi } from "vitest";
import { transitionEmergencyAlert } from "../../lib/emergencyTransitionService";

describe("emergency transition integration", () => {
  it("enforces platform-scoped mutation and writes audit evidence", async () => {
    const mutateAlert = vi.fn().mockResolvedValue(undefined);
    const auditLogger = vi.fn().mockResolvedValue(undefined);

    await transitionEmergencyAlert(
      "assign",
      {
        alertId: "alert-1",
        platformId: "platform-a",
        actorUserId: "user-1",
        assignedAgent: "Ops One",
      },
      {
        mutateAlert,
        auditLogger,
        now: () => "2026-07-02T00:00:00.000Z",
      }
    );

    expect(mutateAlert).toHaveBeenCalledTimes(1);
    expect(mutateAlert).toHaveBeenCalledWith("alert-1", "platform-a", {
      status: "Response Assigned",
      assigned_agent: "Ops One",
    });

    expect(auditLogger).toHaveBeenCalledTimes(1);
    expect(auditLogger).toHaveBeenCalledWith({
      platform_id: "platform-a",
      user_id: "user-1",
      entity_type: "emergency_alert",
      entity_id: "alert-1",
      action: "emergency_alert_assigned",
      details: {
        status_to: "Response Assigned",
        assigned_agent: "Ops One",
      },
    });
  });
});
