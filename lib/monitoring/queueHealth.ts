import type { HealthCheck, HealthStatus } from "./monitoringTypes";

export function evaluateQueueHealth(queueDepth: number, oldestAgeSeconds: number): HealthCheck {
  let status: HealthStatus = "healthy";
  let message = "Queue processing healthy.";

  if (queueDepth > 100 || oldestAgeSeconds > 60) {
    status = "degraded";
    message = "Queue backlog increasing.";
  }

  if (queueDepth > 500 || oldestAgeSeconds > 300) {
    status = "down";
    message = "Queue backlog critical.";
  }

  return {
    component: "queue",
    status,
    message,
    checkedAt: new Date().toISOString(),
  };
}
