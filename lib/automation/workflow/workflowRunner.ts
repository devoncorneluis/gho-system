import type { AutomationEvent } from "../../../types/automation";
import type { WorkflowAction, WorkflowDefinition, WorkflowExecutionResult } from "../../../types/workflow";
import type { AutomationContext, WorkflowArtifacts } from "../automationTypes";
import { runWorkflowAction, type WorkflowActionDelta } from "./workflowActions";
import { evaluateConditions } from "./workflowConditions";

export interface WorkflowRunOutput {
  execution: WorkflowExecutionResult;
  artifacts: Omit<WorkflowArtifacts, "workflowResults">;
}

function mergeDelta(target: Omit<WorkflowArtifacts, "workflowResults">, delta: WorkflowActionDelta) {
  target.auditTrail.push(...delta.auditTrail);
  target.escalationTags.push(...delta.escalationTags);
  target.notifications.push(...delta.notifications);
  target.recommendationRequested = target.recommendationRequested || delta.recommendationRequested;
  target.operationsUpdateRequested = target.operationsUpdateRequested || delta.operationsUpdateRequested;
}

export function runWorkflow(workflow: WorkflowDefinition, event: AutomationEvent, context: AutomationContext): WorkflowRunOutput {
  const performedActions: WorkflowAction[] = [];
  const auditTrail: string[] = [];
  const artifacts: Omit<WorkflowArtifacts, "workflowResults"> = {
    auditTrail: [],
    escalationTags: [],
    notifications: [],
    recommendationRequested: false,
    operationsUpdateRequested: false,
  };

  for (const step of workflow.steps) {
    if (!evaluateConditions(event, step.conditions)) {
      auditTrail.push(`Skipped step ${step.id} due to conditions.`);
      continue;
    }

    performedActions.push(step.action);
    auditTrail.push(`Executed step ${step.id} (${step.name}).`);
    const delta = runWorkflowAction(step.action, context);
    mergeDelta(artifacts, delta);
  }

  const execution: WorkflowExecutionResult = {
    workflowId: workflow.id,
    completed: true,
    performedActions,
    auditTrail,
  };

  return {
    execution,
    artifacts,
  };
}
