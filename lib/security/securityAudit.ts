import type { SecurityCapability } from "./roleEngine";

export interface SecurityAuditEvent {
  id: string;
  userId: string;
  platformId: string;
  action: string;
  capability?: SecurityCapability;
  resourceType?: string;
  resourceId?: string;
  success: boolean;
  reason?: string;
  createdAt: string;
}

export function createSecurityAuditEvent(input: Omit<SecurityAuditEvent, "id" | "createdAt">): SecurityAuditEvent {
  return {
    ...input,
    id: `audit-${Date.now()}-${Math.round(Math.random() * 1_000_000)}`,
    createdAt: new Date().toISOString(),
  };
}

export function summarizeSecurityAudit(events: SecurityAuditEvent[]) {
  const total = events.length;
  const success = events.filter((event) => event.success).length;
  const failed = total - success;

  return {
    total,
    success,
    failed,
    successRate: total > 0 ? Math.round((success / total) * 100) : 100,
  };
}
