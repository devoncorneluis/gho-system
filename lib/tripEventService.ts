import { supabase } from "./supabase";

export interface TripEvent {
  tripId: string;
  platformId?: string | null;
  createdBy?: string | null;
  eventType: string;
  eventData?: Record<string, unknown>;
}

export async function recordTripEvent(event: TripEvent) {
  const { error } = await supabase
    .from("trip_events")
    .insert({
      trip_id: event.tripId,
      platform_id: event.platformId,
      created_by: event.createdBy,
      event_type: event.eventType,
      event_data: event.eventData ?? {},
    });

  if (error) {
    throw error;
  }
}
