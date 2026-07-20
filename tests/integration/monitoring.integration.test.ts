import { describe, expect, it } from "vitest";
import { evaluateQueueHealth } from "../../lib/monitoring/queueHealth";
import { evaluateRealtimeHealth } from "../../lib/monitoring/realtimeHealth";
import { evaluateAutomationHealth } from "../../lib/monitoring/automationHealth";
import { composeMonitoringSnapshot } from "../../lib/monitoring/snapshotComposer";

describe("monitoring integration", () => {
  it("applies queue thresholds to health status", () => {
    expect(evaluateQueueHealth(50, 20).status).toBe("healthy");
    expect(evaluateQueueHealth(200, 80).status).toBe("degraded");
    expect(evaluateQueueHealth(600, 400).status).toBe("down");
  });

  it("applies realtime thresholds to health status", () => {
    expect(evaluateRealtimeHealth(true, 0).status).toBe("healthy");
    expect(evaluateRealtimeHealth(false, 2).status).toBe("degraded");
    expect(evaluateRealtimeHealth(false, 7).status).toBe("down");
  });

  it("applies automation thresholds and composes aggregate status", () => {
    expect(
      evaluateAutomationHealth({ workflowsRunning: 4, escalationsPending: 3, failedWorkflows: 0 }).status
    ).toBe("healthy");

    expect(
      evaluateAutomationHealth({ workflowsRunning: 4, escalationsPending: 3, failedWorkflows: 2 }).status
    ).toBe("degraded");

    expect(
      evaluateAutomationHealth({ workflowsRunning: 4, escalationsPending: 25, failedWorkflows: 6 }).status
    ).toBe("down");

    const snapshot = composeMonitoringSnapshot({
      queueDepth: 700,
      oldestQueueAgeSeconds: 500,
      realtimeConnected: false,
      realtimeReconnectAttempts: 8,
      automation: {
        workflowsRunning: 2,
        escalationsPending: 30,
        failedWorkflows: 7,
      },
      capturedErrors: [],
    });

    expect(snapshot.overallStatus).toBe("down");
    expect(snapshot.checks).toHaveLength(3);
  });
});
