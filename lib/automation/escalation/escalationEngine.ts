import type { EscalationDecision, EscalationSignal } from "./escalationTypes";
import { evaluateEscalationRules } from "./escalationRules";

export function runEscalationEngine(signal: EscalationSignal, nowIso = new Date().toISOString()): EscalationDecision[] {
  const decisions = evaluateEscalationRules(signal, nowIso);

  decisions.sort((a, b) => {
    const priorityOrder: Record<string, number> = { p1: 4, p2: 3, p3: 2, p4: 1 };
    const severityOrder: Record<string, number> = { critical: 4, high: 3, medium: 2, low: 1 };

    const byPriority = (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
    if (byPriority !== 0) return byPriority;

    return (severityOrder[b.severity] || 0) - (severityOrder[a.severity] || 0);
  });

  return decisions;
}
