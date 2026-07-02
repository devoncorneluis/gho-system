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
