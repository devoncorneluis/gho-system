import { describe, expect, it } from "vitest";
import { appendTelemetryToAuditTrail } from "../../lib/observability/auditBridge";
import { getOperatorAnalyticsSummary } from "../../lib/observability/operatorAnalytics";
import { getPerformanceMetricsSnapshot } from "../../lib/observability/performanceMetrics";
import { clearTelemetryEvents, recordTelemetryEvent } from "../../lib/observability/telemetryEngine";

describe("observability", () => {
  it("records telemetry and bridges into audit entries", () => {
    clearTelemetryEvents();

    const event = recordTelemetryEvent({
      action: "approve_recommendation",
      outcome: "blocked",
      operatorId: "ops-1",
      platformId: "platform-test",
      screen: "operations",
      reason: "Guardrail block.",
      dispatchId: "dispatch-1",
      durationMs: 1250,
    });

    const trail = appendTelemetryToAuditTrail([], event);
    expect(trail[0]).toContain("Telemetry");
    expect(trail[0]).toContain("approve_recommendation");
  });

  it("produces operator analytics and performance snapshots", () => {
    clearTelemetryEvents();

    recordTelemetryEvent({
      action: "approve_recommendation",
      outcome: "success",
      operatorId: "ops-1",
      platformId: "platform-test",
      screen: "operations",
      dispatchId: "dispatch-1",
      durationMs: 900,
    });

    recordTelemetryEvent({
      action: "reassign_driver",
      outcome: "blocked",
      operatorId: "ops-1",
      platformId: "platform-test",
      screen: "operations",
      reason: "Monitoring guardrail blocked action.",
      dispatchId: "dispatch-1",
      durationMs: 1400,
    });

    const operator = getOperatorAnalyticsSummary("platform-test");
    const performance = getPerformanceMetricsSnapshot("platform-test");

    expect(operator.dispatchAttemptsToday).toBeGreaterThan(0);
    expect(operator.blockedDispatches).toBeGreaterThan(0);
    expect(performance.averageActionLatencyMs).toBeGreaterThan(0);
  });
});
