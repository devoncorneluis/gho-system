import { buildClientMetrics } from "./clientAnalytics";
import { buildExecutiveMetrics } from "./executiveAnalytics";
import { buildOperationsMetrics } from "./operationsAnalytics";
import { getUserPlatform } from "../getUserPlatform";
import { supabase } from "../supabase";

export async function getOperationsMetrics(platformId: string) {
  const [trips, drivers, vehicles, emergencies] = await Promise.all([
    supabase.from("trips").select("id, status, driver_response").eq("platform_id", platformId),
    supabase.from("drivers").select("id, availability_status").eq("platform_id", platformId),
    supabase.from("vehicles").select("id, status").eq("platform_id", platformId),
    supabase.from("emergency_alerts").select("id, status").eq("platform_id", platformId),
  ]);

  const tripList = trips.data || [];
  const driverList = drivers.data || [];
  const vehicleList = vehicles.data || [];
  const emergencyList = emergencies.data || [];

  return buildOperationsMetrics({
    totalTrips: tripList.length,
    activeTrips: tripList.filter((trip: any) => trip.status === "In Progress").length,
    assignedTrips: tripList.filter((trip: any) => trip.status === "Assigned").length,
    completedTrips: tripList.filter((trip: any) => trip.status === "Completed").length,
    pendingDriverResponses: tripList.filter((trip: any) => !trip.driver_response || trip.driver_response === "pending").length,
    acceptedDriverResponses: tripList.filter((trip: any) => trip.driver_response === "accepted").length,
    rejectedDriverResponses: tripList.filter((trip: any) => trip.driver_response === "rejected").length,
    availableDrivers: driverList.filter((driver: any) => driver.availability_status === "Available").length,
    activeDrivers: driverList.filter((driver: any) => driver.availability_status === "On Trip").length,
    availableVehicles: vehicleList.filter((vehicle: any) => vehicle.status === "Available").length,
    activeEmergencies: emergencyList.filter((emergency: any) => emergency.status === "Active").length,
  });
}

export async function getExecutiveMetrics(platformId: string) {
  const [trips, drivers, vehicles, emergencies] = await Promise.all([
    supabase.from("trips").select("id, status, driver_response").eq("platform_id", platformId),
    supabase.from("drivers").select("id, availability_status").eq("platform_id", platformId),
    supabase.from("vehicles").select("id, status").eq("platform_id", platformId),
    supabase.from("emergency_alerts").select("id, status").eq("platform_id", platformId),
  ]);

  const tripList = trips.data || [];
  const driverList = drivers.data || [];
  const vehicleList = vehicles.data || [];
  const emergencyList = emergencies.data || [];

  const totalTrips = tripList.length;
  const completedTrips = tripList.filter((trip: any) => trip.status === "Completed").length;
  const acceptedResponses = tripList.filter((trip: any) => trip.driver_response === "accepted").length;
  const totalResponses = tripList.filter((trip: any) => trip.driver_response).length;

  return buildExecutiveMetrics({
    totalTrips,
    activeTrips: tripList.filter((trip: any) => trip.status === "In Progress").length,
    completedTrips,
    fleetUtilisation: vehicleList.length > 0 ? Math.round((vehicleList.filter((vehicle: any) => vehicle.status === "Available").length / vehicleList.length) * 100) : 0,
    driverAcceptanceRate: totalResponses > 0 ? Math.round((acceptedResponses / totalResponses) * 100) : 0,
    slaCompliance: totalTrips > 0 ? Math.round((completedTrips / totalTrips) * 100) : 0,
    activeEmergencies: emergencyList.filter((emergency: any) => emergency.status === "Active").length,
  });
}

export async function getClientMetrics(platformId: string) {
  const [trips, drivers, vehicles] = await Promise.all([
    supabase.from("trips").select("id, status").eq("platform_id", platformId),
    supabase.from("drivers").select("id, availability_status").eq("platform_id", platformId),
    supabase.from("vehicles").select("id, status").eq("platform_id", platformId),
  ]);

  const tripList = trips.data || [];
  const driverList = drivers.data || [];
  const vehicleList = vehicles.data || [];

  return buildClientMetrics({
    totalTrips: tripList.length,
    activeTrips: tripList.filter((trip: any) => trip.status === "In Progress").length,
    completedTrips: tripList.filter((trip: any) => trip.status === "Completed").length,
    liveVehicles: vehicleList.filter((vehicle: any) => vehicle.status === "Available").length,
    activeDrivers: driverList.filter((driver: any) => driver.availability_status === "On Trip").length,
    etaCoverage: tripList.length > 0 ? 100 : 0,
    notificationCount: tripList.length > 0 ? Math.min(10, tripList.length) : 0,
  });
}

export async function getAnalyticsForCurrentUser() {
  const userPlatform = await getUserPlatform();
  if (!userPlatform) return null;
  return {
    operations: await getOperationsMetrics(userPlatform.platformId),
    executive: await getExecutiveMetrics(userPlatform.platformId),
    client: await getClientMetrics(userPlatform.platformId),
  };
}
