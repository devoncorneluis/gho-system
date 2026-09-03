"use client";
import { useEffect, useState } from "react";
import AdminLayout from "../../components/AdminLayout";
import { supabase } from "../../lib/supabase";
import { getUserPlatform } from "../../lib/getUserPlatform";
import ReportsDashboard from "../../components/reports/ReportsDashboard";
import type {
  TripReportRow,
} from "../../components/reports/TripsReport";
import type {
  FleetReportRow,
} from "../../components/reports/FleetReport";
export default function ReportsCentrePage() {
  const [tripCount, setTripCount] = useState(0);
  const [vehicles, setVehicles] = useState<FleetReportRow[]>([]);
  const [driverCount, setDriverCount] = useState(0);
  const [vehicleCount, setVehicleCount] = useState(0);
  const [incidentCount, setIncidentCount] = useState(0);
  const [activityCount, setActivityCount] = useState(0);
  const [trips, setTrips] = useState<TripReportRow[]>([]);
  // const [vehicles, setVehicles] = useState<FleetReportRow[]>([]);
  const [activeTrips, setActiveTrips] = useState(0);
  useEffect(() => {
    async function loadSummary() {
      const userPlatform = await getUserPlatform();

      if (!userPlatform) return;

      const platformId = userPlatform.platformId;

      const [
        trips,
        drivers,
        vehicles,
        incidents,
        activities,
      ] = await Promise.all([
supabase
  .from("trips")
  .select(`
    id,
    trip_code,
    trip_date,
    shift,
    area,
    driver_name,
    vehicle_name,
    passenger_count,
    status
  `)
  .eq("platform_id", platformId),

        supabase
          .from("drivers")
          .select("*", { count: "exact", head: true })
          .eq("platform_id", platformId),

supabase
  .from("vehicles")
  .select(`
    id,
    vehicle_name,
    registration_number,
    availability_status,
    assigned_driver
  `)
  .eq("platform_id", platformId),

        supabase
          .from("incidents")
          .select("*", { count: "exact", head: true })
          .eq("platform_id", platformId),

        supabase
          .from("activity_logs")
          .select("*", { count: "exact", head: true })
          .eq("platform_id", platformId),
      ]);

const tripRows = trips.data ?? [];

setTripCount(tripRows.length);

const active = tripRows.filter(
  (trip) =>
    trip.status === "Assigned" ||
    trip.status === "In Progress"
).length;

setActiveTrips(active);
setTrips(trips.data ?? []);
setVehicles(vehicles.data ?? []);
      setDriverCount(drivers.count ?? 0);
      setVehicleCount(vehicles.count ?? 0);
      setIncidentCount(incidents.count ?? 0);
      setActivityCount(activities.count ?? 0);
    }

    loadSummary();
  }, []);
  return (
    <AdminLayout>
      <main className="min-h-screen bg-gray-100 p-6">

        {/* Header */}
        <div className="mb-8">
          <p className="text-sm font-bold uppercase text-orange-500">
            GHO Reports
          </p>

          <h1 className="text-4xl font-black text-[#061B33]">
            Reporting Centre
          </h1>

          <p className="mt-2 text-gray-600">
            Enterprise reporting, exports and operational analytics.
          </p>
        </div>

        {/* Summary Cards */}
        <div className="mb-8 grid gap-6 md:grid-cols-5">

          <div className="rounded-2xl bg-white p-6 shadow">
            <p className="text-sm text-gray-500">
              Trips
            </p>

            <p className="mt-3 text-4xl font-black text-[#061B33]">
              {tripCount}
            </p>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow">
            <p className="text-sm text-gray-500">
              Drivers
            </p>

            <p className="mt-3 text-4xl font-black text-[#061B33]">
              {driverCount}
            </p>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow">
            <p className="text-sm text-gray-500">
              Vehicles
            </p>

            <p className="mt-3 text-4xl font-black text-[#061B33]">
              {vehicleCount}
            </p>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow">
            <p className="text-sm text-gray-500">
              Incidents
            </p>

            <p className="mt-3 text-4xl font-black text-red-600">
              {incidentCount}
            </p>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow">
            <p className="text-sm text-gray-500">
              Activities
            </p>

            <p className="mt-3 text-4xl font-black text-green-600">
              {activityCount}
            </p>
          </div>

        </div>

<ReportsDashboard
  tripCount={tripCount}
  driverCount={driverCount}
  vehicleCount={vehicleCount}
  incidentCount={incidentCount}
  activityCount={activityCount}
  activeTrips={activeTrips}
  trips={trips}
  vehicles={vehicles}
/>

      </main>
    </AdminLayout>
  );
}
