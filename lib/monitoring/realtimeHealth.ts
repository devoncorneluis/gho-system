import type { HealthCheck, HealthStatus } from "./monitoringTypes";

export function evaluateRealtimeHealth(connected: boolean, reconnectAttempts: number): HealthCheck {
  let status: HealthStatus = connected ? "healthy" : "degraded";
  let message = connected ? "Realtime connected." : "Realtime disconnected.";

  if (!connected && reconnectAttempts >= 5) {
    status = "down";
    message = "Realtime repeatedly failing to reconnect.";
  }

  return {
    component: "realtime",
    status,
    message,
    checkedAt: new Date().toISOString(),
  };
}
