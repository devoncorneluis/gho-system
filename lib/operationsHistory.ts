import { supabase } from "./supabase";


type OperationHistory = {
  tripId: string;
  tripCode?: string | null;

  platformId?: string | null;

  eventType: string;
  eventTitle: string;
  eventDescription?: string | null;

  driverName?: string | null;
  vehicleName?: string | null;

  severity?: "info" | "success" | "warning" | "critical";
};

export async function recordOperationHistory(
  event: OperationHistory
) {
  const { error } = await supabase
    .from("operations_history")
    .insert({
      trip_id: event.tripId,
      trip_code: event.tripCode ?? null,

      platform_id: event.platformId ?? null,

      event_type: event.eventType,
      event_title: event.eventTitle,
      event_description: event.eventDescription ?? null,

      driver_name: event.driverName ?? null,
      vehicle_name: event.vehicleName ?? null,

      severity: event.severity ?? "info",
    });

  if (error) {
    console.error("Operations history error", error);
  }
}