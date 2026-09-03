import { supabase } from "../supabase";
import { Recommendation } from "./recommendationEngine";

type AssignArgs = {
  tripId: string;
  platformId: string;
  recommendation: Recommendation;
};

export async function assignRecommendation({
  tripId,
  platformId,
  recommendation,
}: AssignArgs) {
  const { error } = await supabase
    .from("trips")
    .update({
      driver_name: recommendation.driver.name,
      vehicle_name: recommendation.vehicle.name,
      status: "Assigned",
      driver_response: "Pending",
    })
    .eq("id", tripId)
    .eq("platform_id", platformId);

  if (error) {
    throw error;
  }

  return true;
}