import { SupabaseClient } from "@supabase/supabase-js";

export async function reassignTrip(
  supabase: SupabaseClient,
  tripId: string,

  oldDriverId: string,
  oldVehicleId: string,

  newDriverId: string,
  newDriverName: string,

  newVehicleId: string,
  newVehicleName: string
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
const { error: tripError } = await supabase
  .from("trips")
  .update({
    driver_id: newDriverId,
    driver_name: newDriverName,
    vehicle_id: newVehicleId,
    vehicle_name: newVehicleName,
  })
  .eq("id", tripId);

if (tripError) {
  throw tripError;
}

const { error: oldDriverError } = await supabase
  .from("drivers")
  .update({
    status: "Available",
    availability_status: "Available",
    assigned_vehicle: null,
    assigned_vehicle_id: null,
  })
  .eq("id", oldDriverId);

if (oldDriverError) {
  throw oldDriverError;
}

const { error: oldVehicleError } = await supabase
  .from("vehicles")
  .update({
    availability_status: "Available",
    assigned_driver: null,
  })
  .eq("id", oldVehicleId);

if (oldVehicleError) {
  throw oldVehicleError;
}

const { error: newDriverError } = await supabase
  .from("drivers")
  .update({
    status: "Assigned",
    availability_status: "Assigned",
    assigned_vehicle: newVehicleName,
    assigned_vehicle_id: newVehicleId,
  })
  .eq("id", newDriverId);

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