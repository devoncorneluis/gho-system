import { buildClientMetrics } from "./clientAnalytics";
import { buildOperationsMetrics } from "./operationsAnalytics";
import { getUserPlatform } from "../getUserPlatform";
import { supabase } from "../supabase";
import { TRIP_STATUS } from "../tripStatus";

type TripRow = {
  id: string;
  status: string | null;
  driver_response?: string | null;
};

type DriverRow = {
  id: string;
  availability_status: string | null;
};

type VehicleRow = {
  id: string;
  status: string | null;
};

type EmergencyRow = {
  id: string;
  status: string | null;
};

interface ExecutiveMetrics {
  executiveAlerts: {
    id: string;
    title: string;
    severity: "high" | "medium" | "low";
  }[];
  revenue: number;
  previousMonthRevenue: number;
  totalTrips: number;
  activeTrips: number;
  completedTrips: number;
  fleetUtilisation: number;
  driverAcceptanceRate: number;
  slaCompliance: number;
  activeEmergencies: number;
}

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
    activeTrips: tripList.filter((trip: TripRow) => trip.status === TRIP_STATUS.IN_TRANSIT).length,
    assignedTrips: tripList.filter((trip: TripRow) => trip.status === TRIP_STATUS.ASSIGNED).length,
    completedTrips: tripList.filter((trip: TripRow) => trip.status === TRIP_STATUS.COMPLETED).length,
    pendingDriverResponses: tripList.filter((trip: TripRow) => !trip.driver_response || trip.driver_response === "pending").length,
    acceptedDriverResponses: tripList.filter((trip: TripRow) => trip.driver_response === "accepted").length,
    rejectedDriverResponses: tripList.filter((trip: TripRow) => trip.driver_response === "rejected").length,
    availableDrivers: driverList.filter((driver: DriverRow) => driver.availability_status === "Available").length,
    activeDrivers: driverList.filter((driver: DriverRow) => driver.availability_status === "On Trip").length,
    availableVehicles: vehicleList.filter((vehicle: VehicleRow) => vehicle.status === "Available").length,
    activeEmergencies: emergencyList.filter((emergency: EmergencyRow) => emergency.status === "Active").length,
  });
}

export async function getExecutiveMetrics(platformId: string): Promise<ExecutiveMetrics> {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const nextMonthStart = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  const [trips, vehicles, emergencyRecords] = await Promise.all([
    supabase.from("trips").select("id, status, driver_response").eq("platform_id", platformId),
    supabase.from("vehicles").select("id, status").eq("platform_id", platformId),
    supabase.from("emergency_alerts").select("id, status").eq("platform_id", platformId),
  ]);

  const { data: payments } = await supabase
    .from("payments")
    .select("amount, created_at")
    .eq("platform_id", platformId);

  const { data: overdueInvoices } = await supabase
    .from("invoices")
    .select("id")
    .eq("platform_id", platformId)
    .neq("status", "Paid");

  const { data: emergencies } = await supabase
    .from("emergency_alerts")
    .select("id")
    .eq("platform_id", platformId)
    .eq("status", "Active");

  const { data: pendingTrips } = await supabase
    .from("trips")
    .select("id")
    .eq("platform_id", platformId)
    .in("status", [TRIP_STATUS.PLANNED]);

  const tripList = trips.data || [];
  const vehicleList = vehicles.data || [];
  const emergencyList = emergencyRecords.data || [];

  const paymentList = payments ?? [];

  const revenue = paymentList.reduce((sum, payment) => {
    const createdAt = payment.created_at ? new Date(payment.created_at) : null;
    if (!createdAt) return sum;
    if (createdAt >= monthStart && createdAt < nextMonthStart) {
      return sum + Number(payment.amount ?? 0);
    }
    return sum;
  }, 0);

  const previousMonthRevenue = paymentList.reduce((sum, payment) => {
    const createdAt = payment.created_at ? new Date(payment.created_at) : null;
    if (!createdAt) return sum;
    if (createdAt >= previousMonthStart && createdAt < monthStart) {
      return sum + Number(payment.amount ?? 0);
    }
    return sum;
  }, 0);

  const totalTrips = tripList.length;
  const activeTrips = tripList.filter((trip: TripRow) => trip.status === TRIP_STATUS.IN_TRANSIT).length;
  const completedTrips = tripList.filter((trip: TripRow) => trip.status === TRIP_STATUS.COMPLETED).length;
  const fleetUtilisation = vehicleList.length > 0 ? Math.round((vehicleList.filter((vehicle: VehicleRow) => vehicle.status === "Available").length / vehicleList.length) * 100) : 0;
  const acceptedResponses = tripList.filter((trip: TripRow) => trip.driver_response === "accepted").length;
  const totalResponses = tripList.filter((trip: TripRow) => Boolean(trip.driver_response)).length;
  const driverAcceptanceRate = totalResponses > 0 ? Math.round((acceptedResponses / totalResponses) * 100) : 0;
  const slaCompliance = totalTrips > 0 ? Math.round((completedTrips / totalTrips) * 100) : 0;
  const activeEmergencies = emergencyList.filter((emergency: EmergencyRow) => emergency.status === "Active").length;
  const overdueInvoicesCount = overdueInvoices?.length ?? 0;
  const emergenciesCount = emergencies?.length ?? 0;
  const pendingTripsCount = pendingTrips?.length ?? 0;

  const executiveAlerts: ExecutiveMetrics["executiveAlerts"] = [];

  if (overdueInvoicesCount > 0) {
    executiveAlerts.push({
      id: "overdue-invoices",
      title: `${overdueInvoicesCount} overdue invoice(s)`,
      severity: "high",
    });
  }

  if (emergenciesCount > 0) {
    executiveAlerts.push({
      id: "active-emergencies",
      title: `${emergenciesCount} active emergency alert(s)`,
      severity: "high",
    });
  }

  if (pendingTripsCount > 0) {
    executiveAlerts.push({
      id: "pending-trips",
      title: `${pendingTripsCount} trip(s) awaiting dispatch`,
      severity: "medium",
    });
  }

  return {
    executiveAlerts,
    revenue,
    previousMonthRevenue,
    totalTrips,
    activeTrips,
    completedTrips,
    fleetUtilisation,
    driverAcceptanceRate,
    slaCompliance,
    activeEmergencies,
  };
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
    activeTrips: tripList.filter((trip: TripRow) => trip.status === TRIP_STATUS.IN_TRANSIT).length,
    completedTrips: tripList.filter((trip: TripRow) => trip.status === TRIP_STATUS.COMPLETED).length,
    liveVehicles: vehicleList.filter((vehicle: VehicleRow) => vehicle.status === "Available").length,
    activeDrivers: driverList.filter((driver: DriverRow) => driver.availability_status === "On Trip").length,
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
