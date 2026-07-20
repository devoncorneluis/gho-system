import { supabase } from "./supabase";

export async function logAudit(
  action: string,
  tripId: string,
  performedBy: string
) {
  await supabase.from("audit_logs").insert({
    action,
    trip_id: tripId,
    performed_by: performedBy,
    created_at: new Date().toISOString(),
  });
}