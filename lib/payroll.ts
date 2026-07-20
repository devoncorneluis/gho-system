import { supabase } from "./supabase";

export async function recordDriverTrip(
  driverId: string,
  tripId: string,
  estimatedKm: number | null
) {
  const { error } = await supabase
    .from("driver_payroll")
    .insert({
      driver_id: driverId,
      trip_id: tripId,
      kilometres: estimatedKm ?? 0,
      payroll_status: "pending",
      created_at: new Date().toISOString(),
    });

  if (error) {
    throw error;
  }
}