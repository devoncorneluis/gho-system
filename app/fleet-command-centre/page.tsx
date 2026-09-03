"use client";
import FleetOperationsTimeline from "../../components/fleet/FleetOperationsTimeline";
import FleetActivityFeed from "../../components/fleet/FleetActivityFeed";
import FleetReassignModal from "../../components/fleet/FleetReassignModal";
import FleetSearchBar from "../../components/fleet/FleetSearchBar";
import { handleFleetEvent } from "../../lib/incidents/incidentBridge";
import AdminLayout from "../../components/AdminLayout";
import FleetDriverDetail from "../../components/fleet/FleetDriverDetail";
import { useEffect, useState } from "react";
import FleetDriverRow from "../../components/fleet/FleetDriverRow";
import { supabase } from "../../lib/supabase";
import FleetSummaryCards from "../../components/fleet/FleetSummaryCards";
import FleetStatusFilters from "../../components/fleet/FleetStatusFilters";
import { getUserPlatform } from "../../lib/getUserPlatform";
import { TRIP_STATUS } from "../../lib/tripStatus";
import { getFleetPriority } from "../../lib/fleet/fleetPriority";
import { getRouteRisk } from "../../lib/fleet/routeRisk";
import { getRouteDeviation } from "../../lib/fleet/routeDeviation";
import { getEtaPrediction } from "../../lib/fleet/etaPrediction";
import OperationsAlertBar from "../../components/fleet/OperationsAlertBar";
import OperationsToast from "../../components/fleet/OperationsToast";
import { getFleetEvent } from "../../lib/fleet/fleetEventEngine";
import {
  subscribeToFleetEvents,
} from "../../lib/fleet/fleetEventBus";
type FleetDriver = {
  id: string;
  full_name: string | null;
  phone: string | null;
  status: string | null;
assigned_driver: {
  id: string;
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

  return now - lastUpdate < 5 * 60 * 1000;
}

function getDriverHealth(
  driver: FleetDriver,
  activeEmergencies: string[]
): "Healthy" | "Warning" | "Critical" {
  if (activeEmergencies.includes(driver.id)) {
    return "Critical";
  }

  const online = isDriverOnline(
    driver.driver_locations?.[0]?.updated_at
  );

  if (!online) {
    return "Warning";
  }

  return "Healthy";
}

export default function FleetCommandCentrePage() {
const [search, setSearch] = useState("");
const [selectedDriver, setSelectedDriver] = useState<FleetDriver | null>(null);
const [selectedTrip, setSelectedTrip] = useState<{
  id: string;
} | null>(null);
const [fleetActivities, setFleetActivities] = useState<
  {
    id: string;
    title: string;
    time: string;
    colour: "green" | "blue" | "yellow" | "red";
  }[]
>([]);
  const [showReassignModal, setShowReassignModal] = useState(false);
const [platformId, setPlatformId] = useState<string | null>(null);
    const [lastRefresh, setLastRefresh] = useState(new Date());
    const [timelineEvents, setTimelineEvents] = useState<
  {
    id: string;
    title: string;
    time: string;
    colour: "green" | "blue" | "yellow" | "red";
  }[]
>([]);
const [onlineVehicles, setOnlineVehicles] = useState(0);
const [driversOnDuty, setDriversOnDuty] = useState(0);
const [activeTrips, setActiveTrips] = useState(0);
// const [activeEmergencies, setActiveEmergencies] = useState(0);
const [drivers, setDrivers] = useState<FleetDriver[]>([]);

const [passengers, setPassengers] = useState<Passenger[]>([]);
const [activeEmergencies, setActiveEmergencies] = useState<string[]>([]);
const [statusFilter, setStatusFilter] = useState<
  "all" | "online" | "offline" | "emergency" | "active"
>("all");
const [priorityFilter, setPriorityFilter] = useState<
  "all" | "Immediate" | "Attention" | "Normal"
>("all");
const [toast, setToast] = useState<{
  title: string;
  message: string;
  type: "success" | "warning" | "danger" | "info";
} | null>(null);
const [lastEmergencyCount, setLastEmergencyCount] = useState(0);
async function loadEmergencies(platformId: string): Promise<number> {
  const { data, error } = await supabase
    .from("emergency_alerts")
    .select("id")
    .eq("platform_id", platformId)
    .eq("status", "Active");

  if (error) {
    return 0;
  }

  const emergencyIds = (data ?? []).map((emergency) => emergency.id);
  setActiveEmergencies(emergencyIds);
  const currentCount = emergencyIds.length;

  if (currentCount > lastEmergencyCount) {
    const event = getFleetEvent("emergency");

    setToast({
      title: event.title,
      message: event.message,
      type: event.severity,
    });
  }

  setLastEmergencyCount(currentCount);

  return currentCount;
}

async function loadDrivers(platformId: string): Promise<FleetDriver[]> {
  const { data, error } = await supabase
    .from("drivers")
    .select(`
      id,
      full_name,
      phone,
      status,
      assigned_driver:vehicles (
        id,
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
    .eq("platform_id", platformId)
    .order("full_name");

  if (error) {
    console.error(error);
    return [];
  }

  const loadedDrivers = (data ?? []) as FleetDriver[];

  setDrivers(loadedDrivers);

  return loadedDrivers;
}

async function refreshFleetData() {
  if (!platformId) {
    return;
  }

  const [loadedDrivers] = await Promise.all([
    loadDrivers(platformId),
    loadEmergencies(platformId),
  ]);

  setFleetActivities(
    buildFleetActivities(loadedDrivers)
  );

  setLastRefresh(new Date());
setToast({
  title: "Fleet Updated",
  message: "Fleet Command Centre has refreshed.",
  type: "info",
});
  if (selectedDriver) {
    const refreshedDriver = loadedDrivers.find(
      (driver) => driver.id === selectedDriver.id
    );

    if (refreshedDriver) {
      setSelectedDriver(refreshedDriver);

      const activeTrip = refreshedDriver.trips?.find(
        (trip) =>
          trip.trip_status !== "completed" &&
          trip.trip_status !== "cancelled"
      );

      if (activeTrip) {
        await loadPassengers(activeTrip.id);
      } else {
        setPassengers([]);
      }

      setTimelineEvents(
        buildTimelineEvents(refreshedDriver)
      );
    }
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

  if (driver.driver_locations?.[0]?.updated_at) {
    events.push({
      id: "gps-update",
      title: "GPS Position Updated",
      time: new Date(
        driver.driver_locations[0].updated_at
      ).toLocaleTimeString(),
      colour: "blue",
    });
  }

  if (activeEmergencies.includes(driver.id)) {
    events.push({
      id: "emergency",
      title: "Emergency Alert Active",
      time: new Date().toLocaleTimeString(),
      colour: "red",
    });
  }

  const completedTrip = driver.trips?.find(
    (trip) => trip.completed_at
  );

  if (completedTrip?.completed_at) {
    events.push({
      id: "trip-completed",
      title: "Trip Completed",
      time: new Date(
        completedTrip.completed_at
      ).toLocaleTimeString(),
      colour: "green",
    });
  }

  return events;
}

function buildFleetActivities(drivers: FleetDriver[]) {
  const activities: {
    id: string;
    title: string;
    time: string;
    colour: "green" | "blue" | "yellow" | "red";
  }[] = [];

  drivers.forEach((driver) => {
    const activeTrip = driver.trips?.find(
      (trip) =>
        trip.trip_status !== "completed" &&
        trip.trip_status !== "cancelled"
    );

    if (activeTrip) {
      activities.push({
        id: `${driver.id}-trip`,
        title: `${driver.full_name} is operating ${activeTrip.trip_code}`,
        time: activeTrip.started_at
          ? new Date(activeTrip.started_at).toLocaleTimeString()
          : "Now",
        colour: "green",
      });
    }

    if (driver.driver_locations?.[0]?.updated_at) {
      activities.push({
        id: `${driver.id}-gps`,
        title: `${driver.full_name} GPS updated`,
        time: new Date(
          driver.driver_locations[0].updated_at
        ).toLocaleTimeString(),
        colour: "blue",
      });
    }

    if (activeEmergencies.includes(driver.id)) {
      activities.push({
        id: `${driver.id}-emergency`,
        title: `${driver.full_name} emergency active`,
        time: new Date().toLocaleTimeString(),
        colour: "red",
      });
    }
  });

  return activities.sort(
    (a, b) =>
      new Date(`1970/01/01 ${b.time}`).getTime() -
      new Date(`1970/01/01 ${a.time}`).getTime()
  );

  // return events; // This line is unnecessary and should be removed
}
async function handleDriverSelect(driver: FleetDriver) {
  setSelectedDriver(driver);

  const events = buildTimelineEvents(driver);
  setTimelineEvents(events);

  const activeTrip = driver.trips?.find(
    (trip) =>
      trip.trip_status !== "completed" &&
      trip.trip_status !== "cancelled"
  );

  if (activeTrip) {
    await loadPassengers(activeTrip.id);
  } else {
    setPassengers([]);
  }
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
if (priorityFilter !== "all") {
  const health = getDriverHealth(driver, activeEmergencies);

  const routeStatus = getRouteDeviation(
    driver.driver_locations?.[0]?.latitude,
    driver.driver_locations?.[0]?.longitude
  );

  const risk = getRouteRisk(routeStatus);

  const eta = getEtaPrediction(
    driver.driver_locations?.[0]?.updated_at
  );

  const priority = getFleetPriority(
    health,
    risk,
    eta
  );

  if (priority !== priorityFilter) {
    return false;
  }
}
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
const onlineDrivers = filteredDrivers.filter((driver) =>
  isDriverOnline(driver.driver_locations?.[0]?.updated_at)
).length;
const sortedDrivers = [...filteredDrivers].sort((a, b) => {
  const healthA = getDriverHealth(a, activeEmergencies);
  const healthB = getDriverHealth(b, activeEmergencies);

  const routeStatusA = getRouteDeviation(
    a.driver_locations?.[0]?.latitude,
    a.driver_locations?.[0]?.longitude
  );

  const routeStatusB = getRouteDeviation(
    b.driver_locations?.[0]?.latitude,
    b.driver_locations?.[0]?.longitude
  );

  const riskA = getRouteRisk(routeStatusA);
  const riskB = getRouteRisk(routeStatusB);

  const etaA = getEtaPrediction(
    a.driver_locations?.[0]?.updated_at
  );

  const etaB = getEtaPrediction(
    b.driver_locations?.[0]?.updated_at
  );

  const priorityA = getFleetPriority(
    healthA,
    riskA,
    etaA
  );

  const priorityB = getFleetPriority(
    healthB,
    riskB,
    etaB
  );

  const score: Record<"Immediate" | "Attention" | "Normal", number> = {
    Immediate: 3,
    Attention: 2,
    Normal: 1,
  };

  return score[priorityB] - score[priorityA];
});
const offlineDrivers = filteredDrivers.length - onlineDrivers;

const activeTripCount = filteredDrivers.filter((driver) =>
  driver.trips?.some(
    (trip) =>
      trip.trip_status !== "completed" &&
      trip.trip_status !== "cancelled"
  )
).length;
const fleetUtilization =
  filteredDrivers.length === 0
    ? 0
    : Math.round(
        (activeTripCount / filteredDrivers.length) * 100
      );
const availableDrivers = filteredDrivers.filter(
  (driver) => driver.status === "Available"
).length;

const gpsReporting = filteredDrivers.filter(
  (driver) => (driver.driver_locations?.length ?? 0) > 0
).length;

// const fleetUtilization = // This line is redundant and should be removed
function getPriorityCount(
  priority: "Immediate" | "Attention" | "Normal"
) {
  return sortedDrivers.filter((driver) => {
    const health = getDriverHealth(driver, activeEmergencies);

    const routeStatus = getRouteDeviation(
      driver.driver_locations?.[0]?.latitude,
      driver.driver_locations?.[0]?.longitude
    );

    const risk = getRouteRisk(routeStatus);

    const eta = getEtaPrediction(
      driver.driver_locations?.[0]?.updated_at
    );

    return getFleetPriority(health, risk, eta) === priority;
  }).length;
}

const immediateDrivers = getPriorityCount("Immediate");
const attentionDrivers = getPriorityCount("Attention");

const deviatedDrivers = sortedDrivers.filter(
  (driver) =>
    getRouteDeviation(
      driver.driver_locations?.[0]?.latitude,
      driver.driver_locations?.[0]?.longitude
    ) !== "On Route"
).length;

const gpsOfflineDrivers = sortedDrivers.filter(
  (driver) =>
    getEtaPrediction(
      driver.driver_locations?.[0]?.updated_at
    ) === "No GPS"
).length;

useEffect(() => {
  const unsubscribe = subscribeToFleetEvents(async (event) => {
    if (platformId) {
      await handleFleetEvent(event, platformId);
    }

    setToast({
      title: event.title,
      message: event.message,
      type: event.severity,
    });
  });

  return unsubscribe;
}, [platformId]);

useEffect(() => {
  async function refreshDashboard() {
    const userPlatform = await getUserPlatform();

    if (!userPlatform) {
      return;
    }

    const currentPlatformId = userPlatform.platformId;

const [
  vehiclesResult,
  driversResult,
  tripsResult,
  loadedDrivers,
] = await Promise.all([
  supabase
    .from("vehicles")
    .select("id", { count: "exact", head: true })
    .eq("platform_id", currentPlatformId)
    .eq("availability_status", "Available"),

  supabase
    .from("drivers")
    .select("id", { count: "exact", head: true })
    .eq("platform_id", currentPlatformId)
    .eq("status", "On Duty"),

  supabase
    .from("trips")
    .select("id", { count: "exact", head: true })
    .eq("platform_id", currentPlatformId)
    .in("trip_status", [
      TRIP_STATUS.ASSIGNED,
      TRIP_STATUS.EN_ROUTE,
      TRIP_STATUS.PICKING_UP,
      TRIP_STATUS.IN_TRANSIT,
    ]),

  loadDrivers(currentPlatformId),
  loadEmergencies(currentPlatformId),
]);


setOnlineVehicles(vehiclesResult.count ?? 0);
setDriversOnDuty(driversResult.count ?? 0);
setActiveTrips(tripsResult.count ?? 0);
setPlatformId(currentPlatformId);

setFleetActivities(
  buildFleetActivities(loadedDrivers)
);
    setLastRefresh(new Date());
  }

  refreshDashboard();

const interval = setInterval(refreshDashboard, 30000);
  // const interval = setInterval(refreshDashboard, 30000);

return () => clearInterval(interval);
// eslint-disable-next-line react-hooks/exhaustive-deps
}, []);

return (
  <AdminLayout>
    <main className="min-h-screen bg-gray-100 p-6">
      {toast && (
  <OperationsToast
    title={toast.title}
    message={toast.message}
    type={toast.type}
    onClose={() => setToast(null)}
  />
)}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[#0B3A82]">
          Fleet Command Centre
        </h1>

        <p className="mt-1 text-gray-600">
          Live monitoring of drivers, vehicles and active trips.
        </p>
      </div>
<OperationsAlertBar
  immediate={immediateDrivers}
  attention={attentionDrivers}
  emergencies={activeEmergencies.length}
  deviations={deviatedDrivers}
  gpsOffline={gpsOfflineDrivers}
  available={availableDrivers}
onSelect={(filter) => {
  if (filter === "Immediate" || filter === "Attention") {
    setPriorityFilter(filter);
    return;
  }

  if (filter === "Emergency") {
    setStatusFilter("emergency");
    return;
  }

  if (filter === "Available") {
    setStatusFilter("all");
    return;
  }

  console.log("Selected filter:", filter);
}}

/>
<FleetSummaryCards
  drivers={drivers}
  activeEmergencies={activeEmergencies}
  isDriverOnline={isDriverOnline}
  onlineDrivers={onlineDrivers}
  offlineDrivers={offlineDrivers}
  activeTrips={activeTrips}
  availableDrivers={availableDrivers}
  gpsReporting={gpsReporting}
  fleetUtilization={fleetUtilization}
/>
<FleetReassignModal
  open={showReassignModal}
  trip={selectedTrip}
  onClose={() => setShowReassignModal(false)}
  onSuccess={refreshFleetData}
/>

<div className="grid grid-cols-1 gap-4 md:grid-cols-4 mb-6">

  <div className="rounded-xl bg-white p-5 shadow">
    <p className="text-sm text-gray-500">Vehicles Online</p>
    <p className="mt-2 text-4xl font-bold text-blue-700">
      {onlineVehicles}
    </p>
  </div>

  <div className="rounded-xl bg-white p-5 shadow">
    <p className="text-sm text-gray-500">Drivers on Duty</p>
    <p className="mt-2 text-4xl font-bold text-green-600">
      {driversOnDuty}
    </p>
  </div>

  <div className="rounded-xl bg-white p-5 shadow">
    <p className="text-sm text-gray-500">Trips in Progress</p>
    <p className="mt-2 text-4xl font-bold text-orange-600">
      {activeTrips}
    </p>
  </div>

  <div className="rounded-xl bg-white p-5 shadow">
    <p className="text-sm text-gray-500">Active Emergencies</p>
    <p className="mt-2 text-4xl font-bold text-red-600">
      {activeEmergencies.length}
    </p>
  </div>

</div>
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
  <th className="px-4 py-3 text-left">Route Status</th>
  <th className="px-4 py-3 text-left">GPS Status</th>
  <th className="px-4 py-3 text-left">Route Risk</th>
  <th className="px-4 py-3 text-left">Emergency</th>
  <th className="px-4 py-3 text-left">Trip Status</th>
  <th className="px-4 py-3 text-left">Online</th>
  <th className="px-4 py-3 text-left">Health</th>
  <th className="px-4 py-3 text-left">Priority</th>
  <th className="px-4 py-3 text-left">Last GPS Update</th>
  <th className="px-4 py-3 text-left">Latitude</th>
  <th className="px-4 py-3 text-left">Longitude</th>
  <th className="px-4 py-3 text-left">Quick Actions</th>
   </tr>
</thead>


<tbody>
  {filteredDrivers.length === 0 ? (
    <tr>
      <td
        colSpan={15}
        className="px-4 py-12 text-center text-gray-500"
      >
        No drivers found.
      </td>
    </tr>
  ) : (
    sortedDrivers.map((driver) => (
      <FleetDriverRow
        key={driver.id}
        driver={driver}
        activeEmergencies={activeEmergencies}
        isDriverOnline={isDriverOnline}
        health={getDriverHealth(driver, activeEmergencies)}
        onSelect={() => handleDriverSelect(driver)}
      />
    ))
  )}
</tbody>
        </table>
      </div>

      {selectedDriver && (
        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
<FleetDriverDetail
  selectedDriver={selectedDriver}
  platformId={platformId}
  activeEmergencies={activeEmergencies}
  passengers={passengers}
  onClose={() => setSelectedDriver(null)}
  onRefresh={refreshFleetData}
onOpenReassign={() => {
  const activeTrip = selectedDriver?.trips?.find(
    (trip) =>
      trip.trip_status !== "completed" &&
      trip.trip_status !== "cancelled"
  );

  if (!activeTrip) {
    alert("No active trip found.");
    return;
  }

  setSelectedTrip({
    id: activeTrip.id,
  });

  setShowReassignModal(true);
}}
/>
          </div>

          <div className="space-y-6">
            <FleetOperationsTimeline
              events={timelineEvents}
            />

            <FleetActivityFeed
              activities={fleetActivities}
            />
          </div>
        </div>
      )}
    </main>
  </AdminLayout>
);
}