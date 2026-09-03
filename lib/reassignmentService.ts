import { SupabaseClient } from "@supabase/supabase-js";

export async function reassignTrip(
  supabase: SupabaseClient,
  tripId: string,

  oldDriverId: string,
  oldVehicleId: string,

  newDriverId: string,
  newDriverName: string,

  newVehicleId: string,
  newVehicleName: string,
  platformId?: string
) {
  // Basic validation
  if (!tripId) {
    throw new Error("Trip ID is required.");
  }

  if (!newDriverId) {
    throw new Error("Please select a new driver.");
  }

  if (!newVehicleId) {
    throw new Error("Please select a new vehicle.");
  }

  if (oldDriverId === newDriverId) {
    throw new Error("The new driver must be different from the current driver.");
  }

  if (oldVehicleId === newVehicleId) {
    throw new Error("The new vehicle must be different from the current vehicle.");
  }
if (!newDriverName.trim()) {
  throw new Error("New driver name is required.");
}

if (!newVehicleName.trim()) {
  throw new Error("New vehicle name is required.");
}
let tripMutation = supabase
  .from("trips")
  .update({
    driver_id: newDriverId,
    driver_name: newDriverName,
    vehicle_id: newVehicleId,
    vehicle_name: newVehicleName,
  })
  .eq("id", tripId);

if (platformId) {
  tripMutation = tripMutation.eq("platform_id", platformId);
}

const { error: tripError } = await tripMutation;

if (tripError) {
  throw tripError;
}

let oldDriverMutation = supabase
  .from("drivers")
  .update({
    status: "Available",
    availability_status: "Available",
    assigned_vehicle: null,
    assigned_vehicle_id: null,
  })
  .eq("id", oldDriverId);

if (platformId) {
  oldDriverMutation = oldDriverMutation.eq("platform_id", platformId);
}

const { error: oldDriverError } = await oldDriverMutation;

if (oldDriverError) {
  throw oldDriverError;
}

let oldVehicleMutation = supabase
  .from("vehicles")
  .update({
    availability_status: "Available",
    assigned_driver: null,
  })
  .eq("id", oldVehicleId);

if (platformId) {
  oldVehicleMutation = oldVehicleMutation.eq("platform_id", platformId);
}

const { error: oldVehicleError } = await oldVehicleMutation;

if (oldVehicleError) {
  throw oldVehicleError;
}

let newDriverMutation = supabase
  .from("drivers")
  .update({
    status: "Assigned",
    availability_status: "Assigned",
    assigned_vehicle: newVehicleName,
    assigned_vehicle_id: newVehicleId,
  })
  .eq("id", newDriverId);

if (platformId) {
  newDriverMutation = newDriverMutation.eq("platform_id", platformId);
}

const { error: newDriverError } = await newDriverMutation;

if (newDriverError) {
  throw newDriverError;
}

  // Step 6
  // Assign new vehicle

  // Step 7
  // Record trip event

  // Step 8
  // Record audit log

  return true;
}