import { supabase } from "./supabase";

export async function recordCompletedTrip(tripId: string) {
  const { error } = await supabase
    .from("billing_records")
    .insert({
      trip_id: tripId,
      billing_status: "pending",
      created_at: new Date().toISOString(),
    });

  if (error) {
    throw error;
  }
}