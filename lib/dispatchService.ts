import { supabase } from "./supabase";
import { canTransitionTripStatus } from "./tripStatus";
import { recordTripEvent } from "./tripEventService";
import { logAuditEvent } from "./auditService";
import { applyTripMutationScope, assertPlatformScope } from "./security/tenantScope";
import { recordOperationHistory } from "./operationsHistory";
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
const { data: trip } = await supabase
  .from("trips")
  .select(`
    trip_code,
    driver_name,
    vehicle_name
  `)
  .eq("id", tripId)
  .maybeSingle();
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
await recordOperationHistory({
  tripId,
  tripCode: trip?.trip_code ?? null,

  platformId: scopedPlatformId,

  eventType: nextStatus.toLowerCase(),

  eventTitle: `Trip ${nextStatus}`,

  eventDescription: `Trip status changed from ${currentStatus} to ${nextStatus}.`,

  driverName: trip?.driver_name ?? null,
  vehicleName: trip?.vehicle_name ?? null,

  severity:
    nextStatus === "completed"
      ? "success"
      : nextStatus === "cancelled"
      ? "warning"
      : nextStatus === "dispatched"
      ? "info"
      : "info",
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
await updateTripStatus(
  tripId,
  "dispatched",
  "accepted",
  {
    platformId: scopedPlatformId,
    dispatchedBy: driverId,
  }
);
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
"assigned",
"dispatched",
    {
      platformId,
      dispatchedBy,
    }
  );
}
export async function startTrip(
  supabase: unknown,
  tripId: string,
  platformId: string,
  driverId: string,
  vehicleId: string
) {
  const client = supabase as typeof import("./supabase").supabase;
  const startedAt = new Date().toISOString();

  const { error: tripError } = await client
    .from("trips")
    .update({
      started_at: startedAt,
    })
    .eq("platform_id", platformId)
    .eq("id", tripId);

  if (tripError) throw tripError;

await updateTripStatus(
  tripId,
  "accepted",
  "en_route",
  {
    platformId,
    dispatchedBy: driverId,
  }
);

  const { error: driverError } = await client
    .from("drivers")
    .update({
      status: "On Trip",
      availability_status: "On Trip",
    })
    .eq("platform_id", platformId)
    .eq("id", driverId);

  if (driverError) throw driverError;
const { error: vehicleError } = await client
  .from("vehicles")
  .update({
    status: "On Trip",
    availability_status: "On Trip",
  })
  .eq("platform_id", platformId)
  .eq("id", vehicleId);

if (vehicleError) throw vehicleError;
  return true;
}
export async function arriveAtPickup(
  supabase: unknown,
  tripId: string,
  platformId: string,
  driverId: string
) {
  const client = supabase as typeof import("./supabase").supabase;
  const arrivedAt = new Date().toISOString();

  const { error: tripError } = await client
    .from("trips")
    .update({
      pickup_arrived_at: arrivedAt,
    })
    .eq("platform_id", platformId)
    .eq("id", tripId);

  if (tripError) throw tripError;

  await updateTripStatus(
    tripId,
    "en_route",
    "picking_up",
    {
      platformId,
      dispatchedBy: driverId,
    }
  );

  await recordTripEvent({
    tripId,
    eventType: "arrived_at_pickup",
    eventData: {
      arrivedAt,
      driverId,
    },
  });

  await logAuditEvent({
    platform_id: platformId,
    user_id: driverId,
    entity_type: "trip",
    entity_id: tripId,
    action: "arrived_at_pickup",
    details: {
      arrived_at: arrivedAt,
    },
  });

  return true;
}
export async function completeTrip(
  supabase: unknown,
  tripId: string,
  platformId: string,
  driverId: string,
  vehicleId: string
) {
  const client = supabase as typeof import("./supabase").supabase;
  const completedAt = new Date().toISOString();

  const { error: tripError } = await client
    .from("trips")
    .update({
      completed_at: completedAt,
    })
    .eq("platform_id", platformId)
    .eq("id", tripId);

  if (tripError) throw tripError;

await updateTripStatus(
  tripId,
  "in_transit",
  "completed",
  {
    platformId,
    dispatchedBy: driverId,
  }
);

  await recordTripEvent({
    tripId,
    eventType: "trip_completed",
    eventData: {
      completedAt,
      driverId,
      vehicleId,
    },
  });

  await logAuditEvent({
platform_id: platformId,
    user_id: driverId,
    entity_type: "trip",
    entity_id: tripId,
    action: "trip_completed",
    details: {
      vehicle_id: vehicleId,
      completed_at: completedAt,
    },
  });



const { error: driverError } = await client
  .from("drivers")
  .update({
    status: "Available",
    availability_status: "Available",
  })
  .eq("platform_id", platformId)
  .eq("id", driverId);

if (driverError) throw driverError;


const { error: vehicleError } = await client
  .from("vehicles")
  .update({
    status: "Available",
    availability_status: "Available",
  })
  .eq("platform_id", platformId)
  .eq("id", vehicleId);

if (vehicleError) throw vehicleError;

  return true;
}

export async function cancelTrip(
  supabase: unknown,
  tripId: string,
  platformId: string,
  currentStatus: string,
  driverId: string,
  vehicleId: string,
  reason = "Cancelled by dispatcher"
){
  const client = supabase as typeof import("./supabase").supabase;
  const cancelledAt = new Date().toISOString();

  const { error: tripError } = await client
    .from("trips")
    .update({
      cancelled_at: cancelledAt,
    })
    .eq("platform_id", platformId)
    .eq("id", tripId);

  if (tripError) throw tripError;

  await updateTripStatus(
    tripId,
    currentStatus,
    "cancelled",
    {
      platformId,
      dispatchedBy: driverId,
    }
  );

  await recordTripEvent({
    tripId,
    eventType: "trip_cancelled",
    eventData: {
      cancelledAt,
      reason,
      driverId,
      vehicleId,
    },
  });

  await logAuditEvent({
platform_id: platformId,
    user_id: driverId,
    entity_type: "trip",
    entity_id: tripId,
    action: "trip_cancelled",
    details: {
      cancelled_at: cancelledAt,
      vehicle_id: vehicleId,
      reason,
    },
  });

const { error: driverError } = await client
  .from("drivers")
  .update({
    status: "Available",
    availability_status: "Available",
  })
  .eq("platform_id", platformId)
  .eq("id", driverId);

if (driverError) throw driverError;

const { error: vehicleError } = await client
  .from("vehicles")
  .update({
    status: "Available",
    availability_status: "Available",
  })
  .eq("platform_id", platformId)
  .eq("id", vehicleId);

if (vehicleError) throw vehicleError;

return true;
}
export async function getCurrentTripForDriver(
  supabase: unknown,
  driverId: string,
platformId: string | null
) {
  const client = supabase as typeof import("./supabase").supabase;

  const scopedPlatformId = assertPlatformScope(platformId);

  const { data, error } = await client
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
      passenger_count,
      destination_latitude,
      destination_longitude
    `)
    .eq("platform_id", scopedPlatformId)
    .eq("driver_id", driverId)
    .in("status", [
      "assigned",
      "dispatched",
      "accepted",
      "en_route",
      "picking_up",
      "in_transit",
    ])
    .order("trip_date", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}
export async function getTripPassengers(
  supabase: unknown,
  tripId: string
) {
  const client = supabase as typeof import("./supabase").supabase;
  const { data, error } = await client
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
