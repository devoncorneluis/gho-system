import type { AutomationPriority, AutomationSeverity } from "../../../types/automation";
import type { WorkflowAction } from "../../../types/workflow";
import type { AutomationContext, AutomationNotificationDraft } from "../automationTypes";

export interface WorkflowActionDelta {
  auditTrail: string[];
  escalationTags: string[];
  notifications: AutomationNotificationDraft[];
  recommendationRequested: boolean;
  operationsUpdateRequested: boolean;
}

function toSeverity(value: unknown): AutomationSeverity {
  return value === "critical" || value === "high" || value === "medium" || value === "low" ? value : "medium";
}

function toPriority(value: unknown): AutomationPriority {
  return value === "p1" || value === "p2" || value === "p3" || value === "p4" ? value : "p3";
}

function normalizeAudience(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string");
}

export function runWorkflowAction(action: WorkflowAction, context: AutomationContext): WorkflowActionDelta {
  const payload = action.payload || {};

  if (action.type === "wait") {
    const waitMs = typeof payload.ms === "number" && payload.ms > 0 ? payload.ms : 0;
    const waitId = `wait-${Date.now()}-${Math.round(Math.random() * 1_000_000)}`;
    context.scheduler.schedule(waitId, waitMs, () => undefined);
    return {
      auditTrail: [`Scheduled workflow wait for ${waitMs} ms (${waitId}).`],
      escalationTags: [],
      notifications: [],
      recommendationRequested: false,
      operationsUpdateRequested: false,
    };
  }

  if (action.type === "generate_recommendation") {
    return {
      auditTrail: ["Workflow requested reassignment recommendation."],
      escalationTags: [],
      notifications: [],
      recommendationRequested: true,
      operationsUpdateRequested: false,
    };
  }

  if (action.type === "escalate") {
    const tag = typeof payload.tag === "string" ? payload.tag : "general";
    return {
      auditTrail: [`Workflow requested escalation (${tag}).`],
      escalationTags: [tag],
      notifications: [],
      recommendationRequested: false,
      operationsUpdateRequested: false,
    };
  }

  if (action.type === "notify") {
    const title = typeof payload.title === "string" ? payload.title : "Automation notification";
    const message = typeof payload.message === "string" ? payload.message : "Automation workflow emitted a notification.";
    return {
      auditTrail: [`Workflow drafted notification: ${title}.`],
      escalationTags: [],
      notifications: [
        {
          title,
          message,
          severity: toSeverity(payload.severity),
          priority: toPriority(payload.priority),
          audience: normalizeAudience(payload.audience),
        },
      ],
      recommendationRequested: false,
      operationsUpdateRequested: false,
    };
  }

  if (action.type === "record_audit") {
    const message = typeof payload.message === "string" ? payload.message : "Workflow audit step recorded.";
    return {
      auditTrail: [message],
      escalationTags: [],
      notifications: [],
      recommendationRequested: false,
      operationsUpdateRequested: false,
    };
  }

  if (action.type === "update_operations") {
    return {
      auditTrail: ["Workflow requested operations centre state refresh."],
      escalationTags: [],
      notifications: [],
      recommendationRequested: false,
      operationsUpdateRequested: true,
    };
  }

  return {
    auditTrail: ["Workflow action ignored due to unknown type."],
    escalationTags: [],
    notifications: [],
    recommendationRequested: false,
    operationsUpdateRequested: false,
  };
}
