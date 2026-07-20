import type { HealthCheck, HealthStatus } from "./monitoringTypes";

export function createHealthCheck(
  component: HealthCheck["component"],
  status: HealthStatus,
  latencyMs?: number,
  message?: string
): HealthCheck {
  return {
    component,
    status,
    latencyMs,
    message,
    checkedAt: new Date().toISOString(),
  };
}

export function summarizeHealth(checks: HealthCheck[]): HealthStatus {
  if (checks.some((check) => check.status === "down")) return "down";
  if (checks.some((check) => check.status === "degraded")) return "degraded";
  return "healthy";
}
