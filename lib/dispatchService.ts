import { supabase } from "./supabase";
import { canTransitionTripStatus } from "./tripStatus";
import { recordTripEvent } from "./tripEventService";
import { logAuditEvent } from "./auditService";
import { applyTripMutationScope, assertPlatformScope } from "./security/tenantScope";

type UpdateTripStatusOptions = {
  dispatchedBy?: string;
  platformId?: string;
};

export async function updateTripStatus(
  tripId: string,
  currentStatus: string,
  nextStatus: string,
  options?: UpdateTripStatusOptions
) {
  if (!canTransitionTripStatus(currentStatus, nextStatus)) {
    throw new Error(
      `Invalid status transition: ${currentStatus} → ${nextStatus}`
    );
  }

  const updateData: Record<string, unknown> = {
    status: nextStatus,
  };

  const scopedPlatformId = assertPlatformScope(options?.platformId);

  if (options?.dispatchedBy) {
    updateData.dispatched_at = new Date().toISOString();
    updateData.dispatched_by = options.dispatchedBy;
  }

  const { error } = await applyTripMutationScope(
    supabase
      .from("trips")
      .update(updateData),
    tripId,
    scopedPlatformId
  );

  if (error) {
    throw error;
  }

  await recordTripEvent({
    tripId,
    eventType: "trip_status_changed",
    eventData: {
      from: currentStatus,
      to: nextStatus,
    },
  });

  await logAuditEvent({
    platform_id: scopedPlatformId,
    user_id: options?.dispatchedBy ?? null,
    entity_type: "trip",
    entity_id: tripId,
    action: "trip_status_changed",
    details: {
      from: currentStatus,
      to: nextStatus,
    },
  });

  return true;
}

export async function acceptDriverDispatch(
  tripId: string,
  platformId?: string,
  driverId?: string
) {
  const scopedPlatformId = assertPlatformScope(platformId);

  const { error } = await applyTripMutationScope(
    supabase
      .from("trips")
      .update({
        driver_response: "accepted",
        driver_response_at: new Date().toISOString(),
      }),
    tripId,
    scopedPlatformId
  );

  if (error) throw error;

  await recordTripEvent({
    tripId,
    platformId: scopedPlatformId,
    createdBy: driverId,
    eventType: "driver_accepted_dispatch",
  });

  await logAuditEvent({
    platform_id: scopedPlatformId,
    user_id: driverId ?? null,
    entity_type: "trip",
    entity_id: tripId,
    action: "driver_accepted_dispatch",
  });
}

export async function rejectDriverDispatch(
  tripId: string,
  platformId?: string,
  driverId?: string
) {




  const scopedPlatformId = assertPlatformScope(platformId);




  const { error } = await applyTripMutationScope(
    supabase
      .from("trips")
      .update({
        driver_response: "rejected",
        driver_response_at: new Date().toISOString(),
      }),
    tripId,
    scopedPlatformId
  );

  if (error) throw error;

  await recordTripEvent({
    tripId,
    platformId: scopedPlatformId,
    createdBy: driverId,
    eventType: "driver_rejected_dispatch",
  });

  await logAuditEvent({
    platform_id: scopedPlatformId,
    user_id: driverId ?? null,
    entity_type: "trip",
    entity_id: tripId,
    action: "driver_rejected_dispatch",
  });
}
export async function dispatchTrip(
  tripId: string,
  platformId: string,
  dispatchedBy: string
) {
  return updateTripStatus(
    tripId,
    "Planned",
    "Assigned",
    {
      platformId,
      dispatchedBy,
    }
  );
}
export async function startTrip(
  supabase: any,
  tripId: string,
  driverId: string,
  vehicleId: string
) {
  const startedAt = new Date().toISOString();

  // Update Trip
  const { error: tripError } = await supabase
    .from("trips")
    .update({
      status: "Started",
      started_at: startedAt,
    })
    .eq("id", tripId);

  if (tripError) throw tripError;

  // Update Driver
  const { error: driverError } = await supabase
    .from("drivers")
    .update({
      status: "On Trip",
      availability_status: "On Trip",
    })
    .eq("id", driverId);

  if (driverError) throw driverError;

  // Update Vehicle
  const { error: vehicleError } = await supabase
    .from("vehicles")
    .update({
      availability_status: "On Trip",
    })
    .eq("id", vehicleId);

  if (vehicleError) throw vehicleError;

  return true;
}
export async function getCurrentTripForDriver(
  supabase: any,
  driverId: string
) {
  const { data, error } = await supabase
    .from("trips")
    .select(`
      id,
      trip_code,
      status,
      driver_id,
      vehicle_id,
      driver_name,
      vehicle_name,
      trip_date,
      shift,
      passenger_count
    `)
    .eq("driver_id", driverId)
    .in("status", ["Assigned", "Dispatched", "Started"])
    .order("trip_date", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}
export async function completeTrip(
  supabase: any,
  tripId: string,
  driverId: string,
  vehicleId: string
) {
  const completedAt = new Date().toISOString();

  // Update Trip
  const { error: tripError } = await supabase
    .from("trips")
    .update({
      status: "Completed",
      completed_at: completedAt,
    })
    .eq("id", tripId);

  if (tripError) throw tripError;

  // Update Driver
  const { error: driverError } = await supabase
    .from("drivers")
    .update({
      status: "Available",
      availability_status: "Available",
    })
    .eq("id", driverId);

  if (driverError) throw driverError;

  // Update Vehicle
  const { error: vehicleError } = await supabase
    .from("vehicles")
    .update({
      availability_status: "Available",
    })
    .eq("id", vehicleId);

  if (vehicleError) throw vehicleError;

  return true;
}
export async function getTripPassengers(
  supabase: any,
  tripId: string
) {
  const { data, error } = await supabase
    .from("trip_passengers")
    .select(`
      id,
      full_name,
      phone,
      pickup_address,
      pickup_area,
      pickup_status,
      pickup_time
    `)
    .eq("trip_id", tripId)
    .order("pickup_order");

  if (error) throw error;

  return data || [];
}