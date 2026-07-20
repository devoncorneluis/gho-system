export type WorkflowConditionOperator = "eq" | "neq" | "gt" | "gte" | "lt" | "lte" | "includes" | "exists";

export interface WorkflowCondition {
  field: string;
  operator: WorkflowConditionOperator;
  value?: string | number | boolean;
}

export type WorkflowActionType =
  | "wait"
  | "generate_recommendation"
  | "escalate"
  | "notify"
  | "record_audit"
  | "update_operations";

export interface WorkflowAction {
  type: WorkflowActionType;
  payload?: Record<string, unknown>;
}

export interface WorkflowStep {
  id: string;
  name: string;
  conditions?: WorkflowCondition[];
  action: WorkflowAction;
}

export interface WorkflowDefinition {
  id: string;
  name: string;
  triggerEventTypes: string[];
  steps: WorkflowStep[];
}

export interface WorkflowExecutionState {
  workflowId: string;
  currentStepIndex: number;
  startedAt: string;
  finishedAt?: string;
}

export interface WorkflowExecutionResult {
  workflowId: string;
  completed: boolean;
  performedActions: WorkflowAction[];
  auditTrail: string[];
}
