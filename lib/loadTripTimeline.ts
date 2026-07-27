import { SupabaseClient } from "@supabase/supabase-js";
import { TimelineEvent } from "../components/timeline/TripTimeline";

export async function loadTripTimeline(
  supabase: SupabaseClient,
  tripId: string
): Promise<TimelineEvent[]> {
const { data, error } = await supabase
  .from("trip_events")
  .select(`
      id,
      event_type,
      event_data,
      created_by,
      created_at
    `)
  .eq("trip_id", tripId)
  .order("created_at", { ascending: true });

  if (error) {
    throw error;
  }

return (data ?? []).map((event) => {
  const details = (event.event_data ?? {}) as Record<string, unknown>;

  return {
    id: event.id,
    title: event.event_type.replace(/_/g, " "),
    description:
      typeof details.description === "string"
        ? details.description
        : JSON.stringify(details),
    performed_by: event.created_by,
    colour: "blue",
    created_at: event.created_at,
  };
});
}