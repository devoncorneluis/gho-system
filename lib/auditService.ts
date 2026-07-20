import { supabase } from "./supabase";

export interface AuditEvent {
  platform_id?: string | null;
  user_id?: string | null;
  entity_type: string;
  entity_id: string;
  action: string;
  details?: Record<string, unknown>;
}

export async function logAuditEvent(event: AuditEvent) {
  const { error } = await supabase.from("audit_logs").insert({
    platform_id: event.platform_id,
    user_id: event.user_id,
    entity_type: event.entity_type,
    entity_id: event.entity_id,
    action: event.action,
    details: event.details ?? {},
  });

  if (error) {
    throw error;
  }
}
