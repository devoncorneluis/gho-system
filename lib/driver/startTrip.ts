import { supabase } from "../supabase";
import { logActivity } from "../activity/logActivity";

type StartTripArgs = {
  platformId: string;
  tripId: string;
  tripCode: string;
  driverName: string;
};

export async function startTrip({
  platformId,
  tripId,
  tripCode,
  driverName,
}: StartTripArgs) {
  const { error } = await supabase
    .from("trips")
    .update({
      status: "In Progress",
      actual_start_time: new Date().toISOString(),
    })
    .eq("id", tripId)
    .eq("platform_id", platformId);

  if (error) {
    throw error;
  }

  await logActivity({
    platformId,
    activityType: "trip_started",
    entityType: "trip",
    entityId: tripId,
    entityName: tripCode,
    createdByName: driverName,
  });

  return true;
}