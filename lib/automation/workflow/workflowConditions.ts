import type { AutomationEvent } from "../../../types/automation";
import type { WorkflowCondition } from "../../../types/workflow";

function getByPath(target: Record<string, unknown>, path: string): unknown {
  const parts = path.split(".");
  let current: unknown = target;

  for (const part of parts) {
    if (typeof current !== "object" || current === null) return undefined;
    current = (current as Record<string, unknown>)[part];
  }

  return current;
}

export function evaluateCondition(event: AutomationEvent, condition: WorkflowCondition): boolean {
  const value = getByPath(event as unknown as Record<string, unknown>, condition.field);

  switch (condition.operator) {
    case "exists":
      return value !== undefined && value !== null;
    case "eq":
      return value === condition.value;
    case "neq":
      return value !== condition.value;
    case "gt":
      return typeof value === "number" && typeof condition.value === "number" && value > condition.value;
    case "gte":
      return typeof value === "number" && typeof condition.value === "number" && value >= condition.value;
    case "lt":
      return typeof value === "number" && typeof condition.value === "number" && value < condition.value;
    case "lte":
      return typeof value === "number" && typeof condition.value === "number" && value <= condition.value;
    case "includes":
      return Array.isArray(value) && value.includes(condition.value);
    default:
      return false;
  }
}

export function evaluateConditions(event: AutomationEvent, conditions?: WorkflowCondition[]): boolean {
  if (!conditions || conditions.length === 0) return true;
  return conditions.every((condition) => evaluateCondition(event, condition));
}
