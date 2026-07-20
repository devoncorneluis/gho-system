import type { HealthCheck, HealthStatus } from "./monitoringTypes";

export interface AutomationHealthInput {
  workflowsRunning: number;
  escalationsPending: number;
  failedWorkflows: number;
}

export function evaluateAutomationHealth(input: AutomationHealthInput): HealthCheck {
  let status: HealthStatus = "healthy";
  let message = "Automation operating normally.";

  if (input.failedWorkflows > 0) {
    status = "degraded";
    message = "Workflow failures detected.";
  }

  if (input.failedWorkflows >= 5 || input.escalationsPending >= 20) {
    status = "down";
    message = "Automation pressure exceeds safe threshold.";
  }

  return {
    component: "automation",
    status,
    message,
    checkedAt: new Date().toISOString(),
  };
}
