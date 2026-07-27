import { supabaseAdmin } from "../identity/supabaseAdmin";
import { logAuditEvent } from "../audit/logAuditEvent";

export async function updateTripStatus({
  tripId,
  platformId,
  userId,
  status,
}: {
  tripId: string;
  platformId: string;
  userId: string;
  status: string;
}) {
  const { error } = await supabaseAdmin
    .from("trips")
    .update({
      status,
    })
    .eq("id", tripId);

  if (error) throw error;

  await logAuditEvent({
    platform_id: platformId,
    user_id: userId,
    entity_type: "trip",
    entity_id: tripId,
    action: `TRIP_${status.toUpperCase()}`,
    details: {
      status,
    },
  });
}