import { supabase } from "../supabase";
import { logActivity } from "../activity/logActivity";

type RespondToTripArgs = {
  platformId: string;
  tripId: string;
  response: "Accepted" | "Rejected";
  driverName: string;
};

export async function respondToTrip({
  platformId,
  tripId,
  response,
  driverName,
}: RespondToTripArgs) {
  const { error } = await supabase
    .from("trips")
    .update({
      driver_response: response,
      status:
        response === "Accepted"
          ? "Accepted"
          : "Awaiting Reassignment",
    })
    .eq("id", tripId)
    .eq("platform_id", platformId);

  if (error) throw error;

  await logActivity({
    platformId,
    activityType: "trip_updated",
    entityType: "trip",
    entityId: tripId,
    entityName: driverName,
    createdByName: driverName,
  });

  return true;
}