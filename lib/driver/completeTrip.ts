import { supabase } from "../supabase";
import { logActivity } from "../activity/logActivity";

type CompleteTripArgs = {
  platformId: string;
  tripId: string;
  tripCode: string;
  driverName: string;
};

export async function completeTrip({
  platformId,
  tripId,
  tripCode,
  driverName,
}: CompleteTripArgs) {
  const { error } = await supabase
    .from("trips")
    .update({
      status: "Completed",
      actual_end_time: new Date().toISOString(),
      billable: true,
    })
    .eq("id", tripId)
    .eq("platform_id", platformId);

  if (error) {
    throw error;
  }

  await logActivity({
    platformId,
    activityType: "trip_completed",
    entityType: "trip",
    entityId: tripId,
    entityName: tripCode,
    createdByName: driverName,
  });

  return true;
}
