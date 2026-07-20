import type { PlatformHealth, PlatformHealthCheck } from "../../types/platform";

export interface PlatformHealthInput {
  platformId: string;
  database: PlatformHealthCheck["status"];
  realtime: PlatformHealthCheck["status"];
  maps: PlatformHealthCheck["status"];
  automation: PlatformHealthCheck["status"];
  intelligence: PlatformHealthCheck["status"];
  queues: PlatformHealthCheck["status"];
  latencyMs?: Partial<Record<PlatformHealthCheck["component"], number>>;
}

function overallStatus(checks: PlatformHealthCheck[]): PlatformHealth["overallStatus"] {
  if (checks.some((check) => check.status === "down")) return "down";
  if (checks.some((check) => check.status === "degraded")) return "degraded";
  return "healthy";
}

function buildCheck(
  component: PlatformHealthCheck["component"],
  status: PlatformHealthCheck["status"],
  latencyMs?: number
): PlatformHealthCheck {
  return {
    component,
    status,
    latencyMs,
    checkedAt: new Date().toISOString(),
  };
}

export function buildPlatformHealth(input: PlatformHealthInput): PlatformHealth {
  const checks: PlatformHealthCheck[] = [
    buildCheck("database", input.database, input.latencyMs?.database),
    buildCheck("realtime", input.realtime, input.latencyMs?.realtime),
    buildCheck("maps", input.maps, input.latencyMs?.maps),
    buildCheck("automation", input.automation, input.latencyMs?.automation),
    buildCheck("intelligence", input.intelligence, input.latencyMs?.intelligence),
    buildCheck("queues", input.queues, input.latencyMs?.queues),
  ];

  return {
    platformId: input.platformId,
    overallStatus: overallStatus(checks),
    checks,
    checkedAt: new Date().toISOString(),
  };
}
