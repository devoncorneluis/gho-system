import { supabase } from "../supabase";
import type { FleetStatusItem } from "../automation/automationFacade";

export async function getFleetStatus(): Promise<FleetStatusItem[]> {
  const [
    { data: drivers, error: driverError },
    { data: vehicles, error: vehicleError },
    { data: trips, error: tripError },
    { data: locations, error: locationError },
  ] = await Promise.all([
    supabase.from("drivers").select("*"),
    supabase.from("vehicles").select("*"),
    supabase.from("trips").select("*"),
    supabase.from("driver_locations").select("*"),
  ]);

  if (driverError) throw driverError;
  if (vehicleError) throw vehicleError;
  if (tripError) throw tripError;

  // driver_locations may legitimately be empty
  if (locationError) {
    console.warn(locationError.message);
  }

  const fleet: FleetStatusItem[] = (drivers ?? []).map((driver: any) => {
    const vehicle =
      (vehicles ?? []).find(
        (v: any) => v.assigned_driver === driver.id
      ) ?? null;

    const trip =
      (trips ?? []).find(
        (t: any) =>
          t.driver_id === driver.id &&
          t.status !== "Completed" &&
          t.status !== "Cancelled"
      ) ?? null;

    const location =
      (locations ?? []).find(
        (l: any) => l.driver_id === driver.id
      ) ?? null;

    return {
      id: driver.id,
      driverName:
        driver.full_name ??
        driver.driver_name ??
        "Unknown Driver",

      vehicleName:
        vehicle?.vehicle_name ??
        "No Vehicle",

      tripCode:
        trip?.trip_code ??
        null,

      gpsConnected: !!location,

      status:
        trip
          ? "En Route"
          : vehicle
          ? "Assigned"
          : "Available",

      lastUpdate:
        location?.updated_at ??
        location?.created_at ??
        null,
    };
  });

  return fleet;
}