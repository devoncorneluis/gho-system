import { describe, expect, it } from "vitest";
import { bootstrapTenant } from "../../lib/platform/tenantEngine";
import { isAiDispatchEnabled, isClientPortalEnabled, isExecutiveDashboardEnabled } from "../../lib/platform/featureFlagEngine";
import { buildPlatformHealth } from "../../lib/platform/platformHealth";

describe("platform services", () => {
  it("bootstraps tenant with typed context", () => {
    const result = bootstrapTenant({
      platformId: "platform-1",
      companyId: "company-1",
      platformName: "GHO Platform",
      companyName: "Corneluis Group",
      tier: "growth",
    });

    expect(result.platform.configuration.sla.driverResponseMinutes).toBeGreaterThan(0);
    expect(result.permissions.length).toBeGreaterThan(0);
  });

  it("resolves feature flags by tier", () => {
    const { platform } = bootstrapTenant({
      platformId: "platform-2",
      companyId: "company-2",
      platformName: "GHO Enterprise",
      companyName: "Corneluis Group",
      tier: "enterprise",
    });

    expect(isExecutiveDashboardEnabled(platform)).toBe(true);
    expect(isAiDispatchEnabled(platform)).toBe(true);
    expect(isClientPortalEnabled(platform)).toBe(true);
  });

  it("builds platform health summary", () => {
    const health = buildPlatformHealth({
      platformId: "platform-2",
      database: "healthy",
      realtime: "degraded",
      maps: "healthy",
      automation: "healthy",
      intelligence: "healthy",
      queues: "healthy",
    });

    expect(health.overallStatus).toBe("degraded");
    expect(health.checks.length).toBe(6);
  });
});
