import type { IntelligencePriority } from "../core/intelligenceTypes";

export function actionForPriority(priority: IntelligencePriority): string {
  if (priority === "critical") return "Escalate immediately";
  if (priority === "high") return "Assign owner and monitor";
  if (priority === "medium") return "Monitor and prepare fallback";
  return "Proceed";
}
