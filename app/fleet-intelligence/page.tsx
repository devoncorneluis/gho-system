"use client";
import FleetActivityTimeline from "../../components/fleet/FleetActivityTimeline";
import { useEffect, useState } from "react";
import AdminLayout from "../../components/AdminLayout";
import { supabase } from "../../lib/supabase";
import FleetLiveMap from "../../components/fleet/FleetLiveMap";
type AttentionTrip = {
  id: string;
  trip_code: string | null;
  driver_name: string | null;
  vehicle_name: string | null;
  status: string | null;
};

type ActiveEmergency = {
  id: string;
  trip_id: string | null;
  emergency_type: string | null;
  status: string | null;
  created_at: string | null;
};

export default function FleetIntelligencePage() {
  const [activeAlerts, setActiveAlerts] = useState(0);
  const [attentionTrips, setAttentionTrips] = useState(0);
  const [liveVehicles, setLiveVehicles] = useState(0);
  const [fleetHealth, setFleetHealth] = useState(100);

  const [availableDrivers, setAvailableDrivers] = useState(0);
  const [driversOnTrip, setDriversOnTrip] = useState(0);
  const [availableVehicles, setAvailableVehicles] = useState(0);
  const [vehiclesOnTrip, setVehiclesOnTrip] = useState(0);

  const [attentionList, setAttentionList] = useState<AttentionTrip[]>([]);
  const [emergencyList, setEmergencyList] = useState<ActiveEmergency[]>([]);

useEffect(() => {
  // eslint-disable-next-line react-hooks/immutability
  loadIntelligence();

  const channel = supabase
    .channel("fleet-intelligence")

    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "trips",
      },
      () => loadIntelligence()
    )

    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "emergency_alerts",
      },
      () => loadIntelligence()
    )

    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "vehicles",
      },
      () => loadIntelligence()
    )

    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}, []);
  async function loadIntelligence() {
    // Dashboard counts
    const { count: emergencyCount } = await supabase
      .from("emergency_alerts")
      .select("*", { count: "exact", head: true })
      .eq("status", "active");

    const { count: tripCount } = await supabase
      .from("trips")
      .select("*", { count: "exact", head: true })
      .or("driver_response.is.null,driver_name.is.null,vehicle_name.is.null");

    const { count: vehicleCount } = await supabase
      .from("vehicles")
      .select("*", { count: "exact", head: true })
      .in("availability_status", ["Assigned", "On Trip"]);

    // Trips requiring attention
    const { data: trips } = await supabase
      .from("trips")
      .select(`
        id,
        trip_code,
        driver_name,
        vehicle_name,
        status
      `)
      .or("driver_response.is.null,driver_name.is.null,vehicle_name.is.null")
      .limit(10);

    // Active emergencies
    const { data: emergencies } = await supabase
      .from("emergency_alerts")
      .select(`
        id,
        trip_id,
        emergency_type,
        status,
        created_at
      `)
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(10);

    // Fleet status
    const { count: availableDriverCount } = await supabase
      .from("drivers")
      .select("*", { count: "exact", head: true })
      .eq("status", "Available");

    const { count: onTripDriverCount } = await supabase
      .from("drivers")
      .select("*", { count: "exact", head: true })
      .eq("status", "On Trip");

    const { count: availableVehicleCount } = await supabase
      .from("vehicles")
      .select("*", { count: "exact", head: true })
      .eq("availability_status", "Available");

    const { count: onTripVehicleCount } = await supabase
      .from("vehicles")
      .select("*", { count: "exact", head: true })
      .eq("availability_status", "On Trip");

    setActiveAlerts(emergencyCount ?? 0);
    setAttentionTrips(tripCount ?? 0);
    setLiveVehicles(vehicleCount ?? 0);

    setAttentionList(trips ?? []);
    setEmergencyList(emergencies ?? []);

    setAvailableDrivers(availableDriverCount ?? 0);
    setDriversOnTrip(onTripDriverCount ?? 0);
    setAvailableVehicles(availableVehicleCount ?? 0);
    setVehiclesOnTrip(onTripVehicleCount ?? 0);

    const score =
      100 -
      ((emergencyCount ?? 0) * 10 +
        (tripCount ?? 0) * 2);

    setFleetHealth(Math.max(score, 0));
  }

  return (
    <AdminLayout>
      <main className="min-h-screen bg-gray-100 p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-[#0B3A82]">
            Fleet Intelligence Centre
          </h1>

          <p className="mt-2 text-gray-600">
            Live operational intelligence for dispatch and fleet management.
          </p>
        </div>

        {/* Dashboard Cards */}
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-xl bg-white p-6 shadow">
            <p className="text-sm font-semibold text-gray-500">
              Active Alerts
            </p>

            <h2 className="mt-4 text-5xl font-bold text-red-600">
              {activeAlerts}
            </h2>

            <p className="mt-3 text-sm text-gray-500">
              Emergencies and critical incidents.
            </p>
          </div>

          <div className="rounded-xl bg-white p-6 shadow">
            <p className="text-sm font-semibold text-gray-500">
              Trips Needing Attention
            </p>

            <h2 className="mt-4 text-5xl font-bold text-orange-500">
              {attentionTrips}
            </h2>

            <p className="mt-3 text-sm text-gray-500">
              Missing driver, vehicle or response.
            </p>
          </div>

          <div className="rounded-xl bg-white p-6 shadow">
            <p className="text-sm font-semibold text-gray-500">
              Fleet Health
            </p>

            <h2 className="mt-4 text-5xl font-bold text-green-600">
              {fleetHealth}%
            </h2>

            <p className="mt-3 text-sm text-gray-500">
              Overall operational score.
            </p>
          </div>

          <div className="rounded-xl bg-white p-6 shadow">
            <p className="text-sm font-semibold text-gray-500">
              Live Vehicles
            </p>

            <h2 className="mt-4 text-5xl font-bold text-[#0B3A82]">
              {liveVehicles}
            </h2>

            <p className="mt-3 text-sm text-gray-500">
              Currently assigned or on trip.
            </p>
          </div>
        </div>

        {/* Live Feeds */}
        <div className="mt-8 grid gap-6 xl:grid-cols-2">
          <div className="rounded-xl bg-white shadow">
            <div className="border-b p-6">
              <h2 className="text-2xl font-bold text-[#0B3A82]">
                Live Operations Feed
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Trips requiring dispatcher attention.
              </p>
            </div>

            <div className="divide-y">
              {attentionList.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  ✅ No operational issues detected.
                </div>
              ) : (
                attentionList.map((trip) => (
                  <div
                    key={trip.id}
                    className="flex items-center justify-between p-5"
                  >
                    <div>
                      <h3 className="font-semibold">
                        {trip.trip_code ?? "Unknown Trip"}
                      </h3>

                      <p className="text-sm text-gray-500">
                        Driver: {trip.driver_name ?? "Unassigned"}
                      </p>

                      <p className="text-sm text-gray-500">
                        Vehicle: {trip.vehicle_name ?? "Unassigned"}
                      </p>
                    </div>

                    <span className="rounded-full bg-orange-100 px-3 py-1 text-sm font-semibold text-orange-700">
                      Needs Attention
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="rounded-xl bg-white shadow">
            <div className="border-b p-6">
              <h2 className="text-2xl font-bold text-red-600">
                Active Emergency Feed
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Live emergency incidents requiring immediate action.
              </p>
            </div>

            <div className="divide-y">
              {emergencyList.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  ✅ No active emergencies.
                </div>
              ) : (
                emergencyList.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-5"
                  >
                    <div>
                      <h3 className="font-semibold text-red-600">
                        {item.emergency_type ?? "Emergency"}
                      </h3>

                      <p className="text-sm text-gray-500">
                        Trip ID: {item.trip_id ?? "Unknown"}
                      </p>

                      <p className="text-sm text-gray-500">
                        {item.created_at
                          ? new Date(item.created_at).toLocaleString()
                          : "-"}
                      </p>
                    </div>

                    <span className="rounded-full bg-red-100 px-3 py-1 text-sm font-semibold text-red-700">
                      ACTIVE
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

{/* Fleet Status */}
<div className="mt-8">
  <h2 className="mb-6 text-3xl font-bold text-[#0B3A82]">
    Live Fleet Status
  </h2>

  <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
    <div className="rounded-xl bg-white p-6 shadow">
      <p className="text-sm text-gray-500">
        Available Drivers
      </p>

      <h2 className="mt-3 text-5xl font-bold text-green-600">
        {availableDrivers}
      </h2>
    </div>

    <div className="rounded-xl bg-white p-6 shadow">
      <p className="text-sm text-gray-500">
        Drivers On Trip
      </p>

      <h2 className="mt-3 text-5xl font-bold text-blue-600">
        {driversOnTrip}
      </h2>
    </div>

    <div className="rounded-xl bg-white p-6 shadow">
      <p className="text-sm text-gray-500">
        Available Vehicles
      </p>

      <h2 className="mt-3 text-5xl font-bold text-green-600">
        {availableVehicles}
      </h2>
    </div>

    <div className="rounded-xl bg-white p-6 shadow">
      <p className="text-sm text-gray-500">
        Vehicles On Trip
      </p>

      <h2 className="mt-3 text-5xl font-bold text-blue-600">
        {vehiclesOnTrip}
      </h2>
    </div>
  </div>
</div>



        {/* Live Fleet Map */}
        <div className="mt-10">
          <h2 className="mb-6 text-3xl font-bold text-[#0B3A82]">
            Live Fleet Map
          </h2>
<div className="mt-10">
  <FleetActivityTimeline />
</div>
          <FleetLiveMap />
        </div>
      </main>
    </AdminLayout>
  );
}