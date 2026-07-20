import type { AutomationEvent } from "../../../types/automation";
import type { WorkflowArtifacts } from "../automationTypes";
import type { AutomationContext } from "../automationTypes";
import { getWorkflowsForEventType } from "../automationWorkflow";
import { runWorkflow } from "./workflowRunner";

function uniqueStrings(values: string[]): string[] {
  return [...new Set(values)];
}

export function executeWorkflowsForEvent(event: AutomationEvent, context: AutomationContext): WorkflowArtifacts {
  const workflows = getWorkflowsForEventType(event.type);

  const artifacts: WorkflowArtifacts = {
    auditTrail: [],
    escalationTags: [],
    notifications: [],
    recommendationRequested: false,
    operationsUpdateRequested: false,
    workflowResults: [],
  };

  for (const workflow of workflows) {
    const output = runWorkflow(workflow, event, context);
    artifacts.workflowResults.push(output.execution);
    artifacts.auditTrail.push(...output.execution.auditTrail, ...output.artifacts.auditTrail);
    artifacts.escalationTags.push(...output.artifacts.escalationTags);
    artifacts.notifications.push(...output.artifacts.notifications);
    artifacts.recommendationRequested = artifacts.recommendationRequested || output.artifacts.recommendationRequested;
    artifacts.operationsUpdateRequested = artifacts.operationsUpdateRequested || output.artifacts.operationsUpdateRequested;
  }

  artifacts.escalationTags = uniqueStrings(artifacts.escalationTags);
  return artifacts;
}
