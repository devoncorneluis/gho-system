export type HealthStatus = "healthy" | "degraded" | "down";

export interface HealthCheck {
  component: "database" | "realtime" | "automation" | "intelligence" | "queue" | "application";
  status: HealthStatus;
  latencyMs?: number;
  message?: string;
  checkedAt: string;
}

export interface MonitoringSnapshot {
  overallStatus: HealthStatus;
  checks: HealthCheck[];
  errorCountLastHour: number;
  queueDepth: number;
  realtimeConnected: boolean;
  capturedAt: string;
}
