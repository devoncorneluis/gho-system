import { supabase } from "../supabase";
import { TRIP_STATUS } from "../tripStatus";
import { Recommendation } from "./recommendationEngine";
import { notifyDriver } from "../notifications/notifyDriver";
type CreateSmartTripArgs = {
  platformId: string;

  trip: {
    trip_code: string;
    trip_date: string;
    shift: string;
    area: string;
    pickup_time: string;
    dropoff_time: string;
  };

  recommendation: Recommendation;
};

export async function createSmartTrip({
  platformId,
  trip,
  recommendation,
}: CreateSmartTripArgs) {
  const { data, error } = await supabase
    .from("trips")
    .insert({
      platform_id: platformId,

      trip_code: trip.trip_code,
      trip_date: trip.trip_date,
      shift: trip.shift,
      area: trip.area,

      pickup_time: trip.pickup_time,
      dropoff_time: trip.dropoff_time,

      driver_name: recommendation.driver.name,
      vehicle_name: recommendation.vehicle.name,

      status: TRIP_STATUS.ASSIGNED,
      driver_response: "Pending",
    })
    .select()
    .single();

  if (error) {
    throw error;
  }
await notifyDriver({
  platformId,
  tripCode: trip.trip_code,
});
  return data;
}