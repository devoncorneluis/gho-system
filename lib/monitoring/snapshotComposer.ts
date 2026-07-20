import { evaluateAutomationHealth, type AutomationHealthInput } from "./automationHealth";
import { aggregateErrors, type CapturedError } from "./errorAggregator";
import { evaluateQueueHealth } from "./queueHealth";
import { evaluateRealtimeHealth } from "./realtimeHealth";
import { summarizeHealth } from "./healthChecks";
import type { MonitoringSnapshot } from "./monitoringTypes";

export interface MonitoringInput {
  queueDepth: number;
  oldestQueueAgeSeconds: number;
  realtimeConnected: boolean;
  realtimeReconnectAttempts: number;
  automation: AutomationHealthInput;
  capturedErrors: CapturedError[];
}

export function composeMonitoringSnapshot(input: MonitoringInput): MonitoringSnapshot {
  const queueCheck = evaluateQueueHealth(input.queueDepth, input.oldestQueueAgeSeconds);
  const realtimeCheck = evaluateRealtimeHealth(input.realtimeConnected, input.realtimeReconnectAttempts);
  const automationCheck = evaluateAutomationHealth(input.automation);
  const checks = [queueCheck, realtimeCheck, automationCheck];
  const errorSummary = aggregateErrors(input.capturedErrors);

  return {
    overallStatus: summarizeHealth(checks),
    checks,
    errorCountLastHour: errorSummary.total,
    queueDepth: input.queueDepth,
    realtimeConnected: input.realtimeConnected,
    capturedAt: new Date().toISOString(),
  };
}
