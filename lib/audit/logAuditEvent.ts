import { supabaseAdmin } from "../identity/supabaseAdmin";

interface AuditEvent {
  platform_id: string;
  user_id: string;
  entity_type: string;
  entity_id: string;
  action: string;
  details?: Record<string, unknown>;
}

export async function logAuditEvent({
  platform_id,
  user_id,
  entity_type,
  entity_id,
  action,
  details = {},
}: AuditEvent) {
  const { error } = await supabaseAdmin
    .from("audit_logs")
    .insert({
      platform_id,
      user_id,
      entity_type,
      entity_id,
      action,
      details,
    });

  if (error) {
    console.error("Audit log failed:", error);
  }
}