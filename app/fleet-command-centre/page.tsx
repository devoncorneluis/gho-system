"use client";
import FleetSearchBar from "../../components/fleet/FleetSearchBar";
import Link from "next/link";
import AdminLayout from "../../components/AdminLayout";
import FleetDriverDetail from "../../components/fleet/FleetDriverDetail";
import { useEffect, useState } from "react";
import FleetDriverRow from "../../components/fleet/FleetDriverRow";
import { supabase } from "../../lib/supabase";
import FleetSummaryCards from "../../components/fleet/FleetSummaryCards";
import FleetStatusFilters from "../../components/fleet/FleetStatusFilters";
type FleetDriver = {
  id: string;
  full_name: string | null;
  status: string | null;
  assigned_driver: {
    vehicle_name: string | null;
  }[] | null;
trips: {
  id: string;
  trip_code: string | null;
  trip_status: string | null;
  started_at: string | null;
  completed_at: string | null;
}[] | null;
driver_locations: {
  latitude: number | null;
  longitude: number | null;
  updated_at: string | null;
}[] | null;
};
type Passenger = {
  id: string;
  trip_id: string;
  full_name: string | null;
  phone: string | null;
  pickup_address: string | null;
  pickup_area: string | null;
  pickup_time: string | null;
  pickup_status: string | null;
  pickup_order: number | null;
};
function isDriverOnline(updatedAt: string | null | undefined) {
  if (!updatedAt) return false;

  const lastUpdate = new Date(updatedAt).getTime();
  const now = Date.now();

  // Consider the driver online if a GPS update was received
  // within the last 5 minutes.
  return now - lastUpdate < 5 * 60 * 1000;
}
export default function FleetCommandCentrePage() {
const [search, setSearch] = useState("");
const [selectedDriver, setSelectedDriver] =
  useState<FleetDriver | null>(null);

    const [lastRefresh, setLastRefresh] = useState(new Date());
    const [timelineEvents, setTimelineEvents] = useState<
  {
    id: string;
    title: string;
    time: string;
    colour: "green" | "blue" | "yellow" | "red";
  }[]
>([]);
  const [fleetDrivers, setFleetDrivers] = useState<FleetDriver[]>([]);
const [drivers, setDrivers] = useState<FleetDriver[]>([]);

const [passengers, setPassengers] = useState<Passenger[]>([]);
const [activeEmergencies, setActiveEmergencies] = useState<string[]>([]);
const [statusFilter, setStatusFilter] = useState<
  "all" | "online" | "offline" | "emergency" | "active"
>("all");
  useEffect(() => {
    async function loadFleetDrivers() {
      const { data, error } = await supabase.from("fleet_drivers").select("*");
      if (error) {
        alert(error.message);
        return;
      }
      setFleetDrivers(data ?? []);
    }
    loadFleetDrivers();
  }, []);


async function loadEmergencies() {
  const { data, error } = await supabase
    .from("emergencies")
    .select("id");

  if (!error && data) {
    setActiveEmergencies(data.map((emergency) => emergency.id));
  }
}

async function loadDrivers() {
  const { data, error } = await supabase
    .from("drivers")
    .select(`
      id,
      full_name,
      status,
      assigned_driver:vehicles (
        vehicle_name
      ),
trips (
  id,
  trip_code,
  trip_status,
  started_at,
  completed_at
),
driver_locations (
  latitude,
  longitude,
  updated_at
)
    `)
    .order("full_name");

  if (!error && data) {
    setDrivers(data ?? []);
  }
}




async function loadPassengers(tripId: string) {
  const { data, error } = await supabase
    .from("trip_passengers")
    .select(`
      id,
      trip_id,
      full_name,
      phone,
      pickup_address,
      pickup_area,
      pickup_time,
      pickup_status,
      pickup_order
    `)
    .eq("trip_id", tripId)
    .order("pickup_order");

if (!error) {
  setPassengers(data ?? []);
}
}
function buildTimelineEvents(driver: FleetDriver) {
  const events: {
    id: string;
    title: string;
    time: string;
    colour: "green" | "blue" | "yellow" | "red";
  }[] = [];

  const activeTrip = driver.trips?.find(
    (trip) =>
      trip.trip_status !== "completed" &&
      trip.trip_status !== "cancelled"
  );

  if (activeTrip) {
    events.push({
      id: "trip-active",
      title: "Active Trip",
time: activeTrip.started_at
  ? new Date(activeTrip.started_at).toLocaleTimeString()
  : "Not started",
      colour: "green",
    });
  }

  return events;
}
  async function handleDriverSelect(driver: FleetDriver) {
  setSelectedDriver(driver);

const events = buildTimelineEvents(driver);

const activeTrip = driver.trips?.find(
  (trip) =>
    trip.trip_status !== "completed" &&
    trip.trip_status !== "cancelled"
);
  setTimelineEvents(events);
}
const filteredDrivers = drivers.filter((driver) => {
  const text = search.trim().toLowerCase();

  const matchesSearch =
    driver.full_name?.toLowerCase().includes(text) ||
    driver.assigned_driver?.[0]?.vehicle_name
      ?.toLowerCase()
      .includes(text) ||
    driver.trips?.[0]?.trip_code
      ?.toLowerCase()
      .includes(text);

  if (!matchesSearch) return false;

  switch (statusFilter) {
    case "online":
      return isDriverOnline(driver.driver_locations?.[0]?.updated_at);

    case "offline":
      return !isDriverOnline(driver.driver_locations?.[0]?.updated_at);

    case "emergency":
      return activeEmergencies.includes(driver.id);

    case "active":
      return driver.trips?.some(
        (trip) =>
          trip.trip_status !== "completed" &&
          trip.trip_status !== "cancelled"
      );

    default:
      return true;
  }
});

useEffect(() => {
  async function refreshDashboard() {
    await Promise.all([
      loadDrivers(),
      loadEmergencies(),
    ]);

    setLastRefresh(new Date());
  }

  refreshDashboard();

  const interval = setInterval(refreshDashboard, 30000);

  return () => clearInterval(interval);
}, []);

return (
  <AdminLayout>
    <main className="min-h-screen bg-gray-100 p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[#0B3A82]">
          Fleet Command Centre
        </h1>

        <p className="mt-1 text-gray-600">
          Live monitoring of drivers, vehicles and active trips.
        </p>
      </div>

<FleetSummaryCards
  drivers={drivers}
  activeEmergencies={activeEmergencies}
  isDriverOnline={isDriverOnline}
/>



      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-gray-500">
          Last updated: {lastRefresh.toLocaleTimeString()}
        </p>
      </div>
<FleetStatusFilters
  statusFilter={statusFilter}
  setStatusFilter={setStatusFilter}
/>
<FleetSearchBar
  search={search}
  setSearch={setSearch}
/>

      <div className="overflow-x-auto rounded-lg border bg-white shadow">
        <table className="min-w-full text-sm">
          <thead className="bg-[#0B3A82] text-white">
            <tr>
              <th className="px-4 py-3 text-left">Driver</th>
              <th className="px-4 py-3 text-left">Vehicle</th>
              <th className="px-4 py-3 text-left">Current Trip</th>
              <th className="px-4 py-3 text-left">GPS Status</th>
              <th className="px-4 py-3 text-left">Last GPS Update</th>
              <th className="px-4 py-3 text-left">
  Latitude
</th>

<th className="px-4 py-3 text-left">
  Longitude
</th>
              <th className="px-4 py-3 text-left">Latitude</th>
<th className="px-4 py-3 text-left">Longitude</th>
              <th className="px-4 py-3 text-left">Emergency</th>
              <th className="px-4 py-3 text-left">Trip Status</th>
              <th className="px-4 py-3 text-left">Online</th>
              <th className="px-4 py-3 text-left">Quick Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredDrivers.length === 0 ? (
              <tr>
                <td
                  colSpan={9}
                  className="px-4 py-12 text-center text-gray-500"
                >
                  No drivers found.
                </td>
              </tr>
            ) : (
filteredDrivers.map((driver) => (
  <FleetDriverRow
    key={driver.id}
    driver={driver}
    activeEmergencies={activeEmergencies}
    isDriverOnline={isDriverOnline}
onSelect={() => handleDriverSelect(driver)}
  />
))
            )}
          </tbody>
        </table>
      </div>
<FleetDriverDetail
  selectedDriver={selectedDriver}
  activeEmergencies={activeEmergencies}
  passengers={passengers}
  onClose={() => setSelectedDriver(null)}
/>
    </main>
  </AdminLayout>
);
}
