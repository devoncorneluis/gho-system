import { supabase } from "../supabase";
import type { FleetStatusItem } from "../automation/automationFacade";

type DriverRow = {
  id: string;
  full_name?: string | null;
  driver_name?: string | null;
};

type VehicleRow = {
  assigned_driver?: string | null;
  vehicle_name?: string | null;
};

type TripRow = {
  driver_id?: string | null;
  status?: string | null;
  trip_code?: string | null;
};

type LocationRow = {
  driver_id?: string | null;
  updated_at?: string | null;
  created_at?: string | null;
};

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

  const typedDrivers = (drivers as DriverRow[] | null) ?? [];
  const typedVehicles = (vehicles as VehicleRow[] | null) ?? [];
  const typedTrips = (trips as TripRow[] | null) ?? [];
  const typedLocations = (locations as LocationRow[] | null) ?? [];

  const fleet: FleetStatusItem[] = typedDrivers.map((driver) => {
    const vehicle =
      typedVehicles.find((v) => v.assigned_driver === driver.id) ?? null;

    const trip =
      typedTrips.find(
        (t) =>
          t.driver_id === driver.id &&
          t.status !== "Completed" &&
          t.status !== "Cancelled"
      ) ?? null;

    const location =
      typedLocations.find((l) => l.driver_id === driver.id) ?? null;

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