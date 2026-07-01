"use client";
import PlannerStats from "../../components/planner/PlannerStats";
import { useEffect, useState } from "react";
import AdminLayout from "../../components/AdminLayout";
import { getUserPlatform } from "../../lib/getUserPlatform";
import { supabase } from "../../lib/supabase";

type Agent = {
  id: string;

  employee_number: string;
  full_name: string;

  email: string | null;
  phone: string | null;

  pickup_area: string | null;
  pickup_address: string | null;

  work_location: string | null;
  destination_address: string | null;

  shift: string | null;

  employee_status: string | null;
};

type RouteGroup = {
  id: string;
  route_name: string;
  areas: string[] | null;
  status: string | null;
};

type Driver = {
  id: string;
  full_name: string;
};

type Vehicle = {
  id: string;
  vehicle_name: string;
  vehicle_type: string | null;
  registration_number: string;
  passenger_limit: number;
  assigned_driver: string | null;
};

type DriverVehicleSelection = {
  driver_id: string;
  driver_name: string;
  vehicle_id: string;
  vehicle_name: string;
  vehicle_type: string | null;
  registration_number: string;
};

export default function DailyTransportPlannerPage() {
  const [platformId, setPlatformId] = useState<string | null>(null);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [routeGroups, setRouteGroups] = useState<RouteGroup[]>([]);
const [selectedDrivers, setSelectedDrivers] = useState<Record<string, string>>({});
const [drivers, setDrivers] = useState<Driver[]>([]);
const [assignedDrivers, setAssignedDrivers] = useState<string[]>([]);
const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [editingTrips, setEditingTrips] = useState<Record<string, boolean>>({});const [editedTripNames, setEditedTripNames] = useState<Record<string, string>>({});
  const [editedPickupTimes, setEditedPickupTimes] = useState<Record<string, string>>({});
  const [extraAgentNames, setExtraAgentNames] = useState<Record<string, string>>({});
const [estimatedKm, setEstimatedKm] = useState<Record<string, string>>({});
const [adminCapacity, setAdminCapacity] = useState<Record<string, string>>({});;
  const [planningMode, setPlanningMode] = useState("By Area");
  const [selectedRouteGroupId, setSelectedRouteGroupId] = useState("");
  const [planDate, setPlanDate] = useState(new Date().toISOString().slice(0, 10));
  const [shift, setShift] = useState("06:00 Shift");

  async function loadRouteGroups(activePlatformId: string) {
    const { data, error } = await supabase
      .from("route_groups")
      .select("id, route_name, areas, status")
      .eq("platform_id", activePlatformId)
      .eq("status", "Active")
      .order("route_name");

    if (error) {
      alert(error.message);
      return;
    }

    setRouteGroups(data || []);
  }

  async function loadAgents(activePlatformId: string) {
    const { data, error } = await supabase
      .from("agents")
.select(

  `
  id,
  employee_number,
  full_name,
  email,
  phone,
  pickup_area,
  pickup_address,
  work_location,
  destination_address,
  shift,
  employee_status
  `
)
.eq("platform_id", activePlatformId)
.eq("employee_status", "Active")
.order("pickup_area");
    if (error) {
      alert(error.message);
      return;
    }

    setAgents(data || []);
  }

  async function loadDriversAndVehicles(activePlatformId: string) {
    const { data: driverData, error: driverError } = await supabase
.from("drivers")
.select("id, full_name")
.eq("platform_id", activePlatformId)
.eq("status", "Available")

    if (driverError) {
      alert(driverError.message);
      return;
    }

    const { data: vehicleData, error: vehicleError } = await supabase
      .from("vehicles")
.select(`
  id,
  vehicle_name,
  vehicle_type,
  registration_number,
  passenger_limit,
  assigned_driver
`)
      .eq("platform_id", activePlatformId)
      .eq("status", "Available")
      .order("vehicle_name");

if (vehicleError) {
  alert(vehicleError.message);
  return;
}

const { data: tripData } = await supabase
  .from("trips")
  .select("driver_id")
  .in("status", ["Dispatched", "Accepted", "In Progress"]);

setAssignedDrivers(
  (tripData || [])
    .map((trip) => trip.driver_id)
    .filter(Boolean)
);

const loadedDrivers = driverData || [];
const loadedVehicles = vehicleData || [];

setDrivers(loadedDrivers);
setVehicles(loadedVehicles);


}
 
useEffect(() => {
  async function setupPage() {
    const userPlatform = await getUserPlatform();


    if (!userPlatform) {

      window.location.href = "/login";
      return;
    }

    setPlatformId(userPlatform.platformId);

    await loadAgents(userPlatform.platformId);
    await loadRouteGroups(userPlatform.platformId);
    await loadDriversAndVehicles(userPlatform.platformId);
  }

  setupPage();
}, []);
  const selectedRouteGroup = routeGroups.find(
    (route) => route.id === selectedRouteGroupId
  );

  const groupedAgents =
    planningMode === "By Route Group" && selectedRouteGroup
      ? {
          [selectedRouteGroup.route_name]: agents.filter((agent) =>
(selectedRouteGroup.areas || []).includes(agent.pickup_area || "")
          ),
        }
      : agents.reduce<Record<string, Agent[]>>((groups, agent) => {
const area = agent.pickup_area || "Unknown Area";
          if (!groups[area]) groups[area] = [];
          groups[area].push(agent);
          return groups;
        }, {});

function suggestedVehicle(count: number) {
  const available = vehicles
    .filter((v) => v.passenger_limit >= count)
    .sort((a, b) => a.passenger_limit - b.passenger_limit);

  if (available.length === 0) {
    return "No suitable vehicle";
  }

  return `${available[0].vehicle_name} (${available[0].passenger_limit})`;
}

function getSuggestedDriverId() {
  const available = drivers.find(
    (driver) => !assignedDrivers.includes(driver.id)
  );

  return available?.id || "";
}

function suggestedDriver(vehicleName: string) {
  const vehicle = vehicles.find((v) =>
    vehicleName.startsWith(v.vehicle_name)
  );

  if (!vehicle) {
    return null;
  }

  if (vehicle.assigned_driver) {
    const assigned = drivers.find(
      (d) => d.full_name === vehicle.assigned_driver
    );

    if (
      assigned &&
      !assignedDrivers.includes(assigned.id)
    ) {
      return assigned;
    }
  }

  return drivers.find(
    (d) => !assignedDrivers.includes(d.id)
  );
}
function splitIntoTrips(areaAgents: Agent[]) {
  const trips: Agent[][] = [];

  let remaining = [...areaAgents];

  while (remaining.length > 0) {
    let capacity = 15;

    if (remaining.length <= 4) {
      capacity = 4;
    } else if (remaining.length <= 6) {
      capacity = 6;
    }

    trips.push(remaining.slice(0, capacity));
    remaining = remaining.slice(capacity);
  }

  return trips;
}

  function startEditTrip(tripKey: string) {
    setEditingTrips((current) => ({ ...current, [tripKey]: true }));
    setEditedTripNames((current) => ({ ...current, [tripKey]: current[tripKey] || tripKey }));
    setEditedPickupTimes((current) => ({
      ...current,
      [tripKey]: current[tripKey] || (shift.includes("06:00") ? "05:00" : "17:00"),
    }));
  }

  function saveEditTrip(tripKey: string) {
    setEditingTrips((current) => ({ ...current, [tripKey]: false }));
    alert("Trip changes saved");
  }



  function addMissingAgent(tripKey: string) {
    const name = extraAgentNames[tripKey]?.trim();

    if (!name) {
      alert("Enter the missing agent name first");
      return;
    }

const newAgent: Agent = {
  id: `manual-${Date.now()}`,
  employee_number: "",
  full_name: name,

  email: null,
  phone: null,

  pickup_area: null,

  pickup_address: null,
  work_location: null,
  destination_address: null,

  shift: null,

  employee_status: "Active",
};
    setAgents((current) => [...current, newAgent]);

    setExtraAgentNames((current) => ({
      ...current,
      [tripKey]: "",
    }));

alert(`${name} added to ${tripKey}`);
}

async function saveConfirmedTrip(
  tripCode: string,
  area: string,
  areaAgents: Agent[]
) {
const driverId = selectedDrivers[area];

if (!driverId) {
  alert("Select Driver first");
  return;
}
if (assignedDrivers.includes(driverId)) {
  alert("Driver already assigned to another trip");
  return;
}
const driver = drivers.find((d) => d.id === driverId);

const vehicle = vehicles.find(
  (v) => v.assigned_driver === driverId
);

if (!driver) {
  alert("Driver not found");
  return;
}

if (!vehicle) {
  alert("No vehicle assigned to this driver");
  return;
}


const driverName = driver.full_name;
const vehicleName = vehicle.vehicle_name;
const vehicleRegistration = vehicle.registration_number;
const vehicleType = vehicle.vehicle_type;

const capacity = vehicle.passenger_limit;


const allowedCapacity =
  adminCapacity[area]
    ? Number(adminCapacity[area])
    : capacity;

if (areaAgents.length > allowedCapacity) {
  const proceed = confirm(
    `Passengers: ${areaAgents.length}
Allowed Capacity: ${allowedCapacity}

Dispatch anyway?`
  );

  if (!proceed) return;
}

if (!platformId) {
  alert("Platform not loaded");
  return;
}


    const routeName = editedTripNames[area] || area;
    const pickupTime =
      editedPickupTimes[area] || (shift.includes("06:00") ? "05:00" : "17:00");
    const dropoffTime = shift.includes("06:00") ? "06:00" : "18:00";
    const kmValue = estimatedKm[area] ? Number(estimatedKm[area]) : null;

const { data: savedTrip, error: tripError } = await supabase
  .from("trips")
  .insert({
  platform_id: platformId,

  trip_code: tripCode,
  trip_date: planDate,

  shift,

  area: routeName,

  driver_id: driver.id,
  driver_name: driver.full_name,

  vehicle_id: vehicle.id,
  vehicle_name: vehicle.vehicle_name,
  vehicle_registration: vehicle.registration_number,
  vehicle_type: vehicle.vehicle_type,

  pickup_time: pickupTime,
  dropoff_time: dropoffTime,

  passenger_count: areaAgents.length,
  estimated_km: kmValue,

  status: "Dispatched",
})
      .select("id")
      .single();

    if (tripError || !savedTrip) {
      alert(tripError?.message || "Trip could not be saved");
      return;
    }

const passengersToSave = areaAgents.map((agent) => ({
  platform_id: platformId,
  trip_id: savedTrip.id,

  full_name: agent.full_name,
  email: agent.email,
  phone: agent.phone,

pickup_area: agent.pickup_area || routeName,

pickup_address:
  agent.pickup_address ||
  agent.pickup_area ||
  "",

destination_address:
  agent.destination_address || "",

  pickup_time: pickupTime,
  dropoff_time: dropoffTime,
  pickup_status: "Waiting",
}));

    if (passengersToSave.length > 0) {
      const { error: passengerError } = await supabase
        .from("trip_passengers")
        .insert(passengersToSave);

      if (passengerError) {
        alert(passengerError.message);
        return;
      }
    }

    alert(`${tripCode} saved as Confirmed. Manage driver and vehicle from Trips page.`);
  }
function generateDriverManifest(
  tripCode: string,
  area: string,
  areaAgents: Agent[]
) {
  const driverId = selectedDrivers[area];

  const driver = drivers.find(
    (d) => d.id === driverId
  );

  const vehicle = vehicles.find(
    (v) => v.assigned_driver === driverId
  );

  const manifest = `
GHO DRIVER MANIFEST

Trip Code: ${tripCode}
Date: ${planDate}
Route: ${area}

Driver:
${driver?.full_name || "Not Assigned"}

Vehicle:
${vehicle?.vehicle_name || "Not Assigned"}
${vehicle?.registration_number || ""}

PASSENGERS
--------------------------------

${areaAgents
  .map(
    (agent, index) => `
${index + 1}. ${agent.full_name}

Pickup:
${agent.pickup_address || "No Address"}

Phone:
${agent.phone || "No Phone"}
`
  )
  .join("\n")}

--------------------------------
Generated by GHO
`;

  const blob = new Blob(
    [manifest],
    { type: "text/plain" }
  );

  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = `${tripCode}-driver-manifest.txt`;
  link.click();

  URL.revokeObjectURL(url);
}
  return (
    <AdminLayout>
      <main className="min-h-screen bg-gray-100 p-6">
        <h1 className="text-4xl font-black text-[#061B33]">
          🚐 Daily Transport Planner
        </h1>

        <p className="text-gray-600 mt-2">
          Plan today&apos;s staff transport, assign drivers, assign vehicles, and dispatch trips from one screen.
        </p>

        <div className="bg-white rounded-2xl shadow p-6 mt-6">

<h2 className="text-xl font-bold mb-4">
  Planning Details
</h2>

<div className="grid grid-cols-1 md:grid-cols-3 gap-4"></div>


            <input
              type="date"
              value={planDate}
              onChange={(e) => setPlanDate(e.target.value)}
              className="border p-3 rounded-lg"
            />

            <select
              value={shift}
              onChange={(e) => setShift(e.target.value)}
              className="border p-3 rounded-lg"
            >
              <option>06:00 Shift</option>
              <option>18:00 Shift</option>
            </select>

            <select
              value={planningMode}
              onChange={(e) => setPlanningMode(e.target.value)}
              className="border p-3 rounded-lg"
            >
              <option>By Area</option>
              <option>By Route Group</option>
            </select>

            {planningMode === "By Route Group" && (
              <select
                value={selectedRouteGroupId}
                onChange={(e) => setSelectedRouteGroupId(e.target.value)}
                className="border p-3 rounded-lg"
              >
                <option value="">Select Route Group</option>
                {routeGroups.map((route) => (
                  <option key={route.id} value={route.id}>
                    {route.route_name}
                  </option>
                ))}
              </select>
            )}



<button
  onClick={() => {
    if (!platformId) return;

    loadAgents(platformId);
    loadDriversAndVehicles(platformId);
  }}
  className="bg-orange-500 text-white rounded-lg px-5 py-3 font-bold"
>
  Refresh Plan

</button>
</div>

<PlannerStats
  activeAgents={agents.length}
  plannedTrips={Object.keys(groupedAgents).length}
  planDate={planDate}
/>


        <div className="mt-6 space-y-5">
          {Object.entries(groupedAgents).map(([area, areaAgents], index) => {
            const suggestedTrips = splitIntoTrips(areaAgents);
const tripCode =
  `GHO-${planDate.replaceAll("-", "")}-${String(index + 1).padStart(3, "0")}`;



            return (
              <div key={area} className="bg-white rounded-3xl shadow p-6">
                <div className="flex flex-col md:flex-row md:justify-between gap-4">
                  <div>
                    <p className="text-sm text-gray-500 font-bold">
                      Trip {tripCode}
                    </p>


                  </div>

<div className="grid grid-cols-1 gap-3 md:min-w-[420px]">

<p className="font-bold text-sm text-gray-600">
  👨 Suggested Driver
</p>

<select
value={selectedDrivers[area] || getSuggestedDriverId()}
    onChange={(e) =>
      setSelectedDrivers((current) => ({
        ...current,
        [area]: e.target.value,
      }))
    }
    className="border p-3 rounded-lg"
  >
    <option value="">Select Driver</option>

{drivers.map((driver) => (
  <option key={driver.id} value={driver.id}>
    {driver.full_name}
    {assignedDrivers.includes(driver.id)
      ? " ⚠ Already Assigned"
      : " ✓ Available"}
  </option>
))}
  </select>



<div className="border rounded-lg p-3 bg-yellow-50">
  <p className="font-bold text-sm text-gray-600">
    Assigned Vehicle
  </p>

  {(() => {
    const driverId = selectedDrivers[area];

    const vehicle = vehicles.find(
      (v) => v.assigned_driver === driverId
    );

    return vehicle ? (
      <div>
        <p className="font-semibold">
          {vehicle.vehicle_name}
        </p>
        <p className="text-gray-500">
          {vehicle.registration_number}
        </p>
      </div>
    ) : (
      <p className="text-gray-500">
        No vehicle assigned
      </p>
    );
  })()}
</div>

<div className="border rounded-lg p-3 bg-yellow-50">
  <p className="font-bold text-sm text-gray-600">
    Capacity Control
  </p>

<p className="text-sm text-gray-500">
  Passengers: {areaAgents.length}
</p>

<p className="text-sm text-gray-500">
  Capacity: {adminCapacity[area] || "Default"}
</p>

{(() => {
  const capacity = Number(adminCapacity[area] || 0);

  if (!capacity) return null;

  const difference = capacity - areaAgents.length;

  if (difference >= 0) {
    return (
      <p className="font-bold text-green-600">
        🟢 {difference} Seat{difference === 1 ? "" : "s"} Available
      </p>
    );
  }

  return (
    <p className="font-bold text-red-600">
      🔴 Over Capacity by {Math.abs(difference)}
    </p>
  );
})()}

<input
  type="number"
  min="1"
  value={adminCapacity[area] || ""}
  onChange={(e) =>
    setAdminCapacity((current) => ({
      ...current,
      [area]: e.target.value,
    }))
  }
  placeholder="Admin Capacity Override"
  className="border p-3 rounded-lg w-full mt-2"
/>


</div>

<input
  type="number"
  min="0"
  step="0.1"
                      value={estimatedKm[area] || ""}
                      onChange={(e) =>
                        setEstimatedKm((current) => ({
                          ...current,
                          [area]: e.target.value,
                        }))
                      }
                      placeholder="Estimated KM"
                      className="border p-3 rounded-lg"
                    />

                    <div className="flex gap-2">
                      <input
                        value={extraAgentNames[area] || ""}
                        onChange={(e) =>
                          setExtraAgentNames((current) => ({
                            ...current,
                            [area]: e.target.value,
                          }))
                        }
                        placeholder="Missing agent name"
                        className="border p-3 rounded-lg flex-1"
                      />

                      <button
                        onClick={() => addMissingAgent(area)}
                        className="bg-purple-600 text-white rounded-lg px-4 py-3 font-bold"
                      >
                        ➕ Add
                      </button>
                    </div>

                    <button
                      onClick={() => startEditTrip(area)}
                      className="bg-blue-600 text-white rounded-lg px-5 py-3 font-bold"
                    >
                      ✏️ Edit Trip
                    </button>
                    <div className="rounded-xl border border-green-200 bg-green-50 p-4">

  <p className="font-bold text-green-700">
    🚦 Dispatch Readiness
  </p>

  <div className="mt-3 space-y-1 text-sm">

    <p>
      {selectedDrivers[area]
        ? "✅ Driver Selected"
        : "❌ Driver Missing"}
    </p>

    <p>
      {vehicles.find(
        (v) => v.assigned_driver === selectedDrivers[area]
      )
        ? "✅ Vehicle Assigned"
        : "❌ Vehicle Missing"}
    </p>

    <p>
      {estimatedKm[area]
        ? "✅ Distance Entered"
        : "❌ Distance Missing"}
    </p>

    <p>
      {areaAgents.length > 0
        ? "✅ Passengers Loaded"
        : "❌ No Passengers"}
    </p>

  </div>

</div>
<button
  onClick={() =>
    saveConfirmedTrip(
      tripCode,
      area,
      areaAgents
    )
  }
  className="bg-[#061B33] text-white rounded-lg px-5 py-3 font-bold"
>
  🚀 Dispatch Trip
</button>



<button className="bg-orange-500 text-white rounded-lg px-5 py-3 font-bold">
  📄 Passenger Manifest PDF
</button>

<button
  onClick={() =>
    generateDriverManifest(
      tripCode,
      area,
      areaAgents
    )
  }
  className="bg-gray-700 text-white rounded-lg px-5 py-3 font-bold"
>
  📄 Driver Manifest PDF
</button>

</div>
</div>
<div className="mt-5 rounded-2xl bg-green-50 border border-green-200 p-4">
  <p className="font-black text-green-700">
    🚐 Suggested Trips
  </p>

  <div className="mt-3 space-y-2">
    {suggestedTrips.map((trip, tripIndex) => (
      <div
        key={tripIndex}
        className="rounded-xl bg-white p-3 border"
      >
        <p className="font-bold">
          Trip {tripIndex + 1}
        </p>

        <p>
          Vehicle:{" "}
          <strong>
            {suggestedVehicle(trip.length)}
          </strong>
        </p>

        <p>
          Passengers:{" "}
          <strong>{trip.length}</strong>
        </p>
      </div>
    ))}
  </div>
</div>
<div className="mt-5 bg-gray-50 rounded-2xl p-4">
  <p className="font-black text-[#061B33] mb-3">
    👥 Passengers
  </p>

  <div className="space-y-2">
    {areaAgents.map((agent, passengerIndex) => (
      <div
        key={agent.id}
        className="bg-white rounded-xl p-3 border"
      >
<p className="font-bold">
  {passengerIndex + 1}. {agent.full_name}
</p>

<p className="text-sm text-gray-500">
📍 {agent.pickup_address || "No pickup address"}
</p>

<p className="text-sm text-gray-500">
🏢 {agent.destination_address || "No destination address"}
</p>

<p className="text-sm text-gray-500">
  📞 {agent.phone || "No phone"}
</p>

        <p className="text-sm text-gray-500">
          ✉️ {agent.email || "No email"}
        </p>

        <div className="flex gap-2 mt-3">
          <button
            type="button"
            className="bg-blue-600 text-white px-3 py-1 rounded-lg text-sm font-bold"
            onClick={() =>
              alert(`Edit ${agent.full_name} (coming next)`)
            }
          >
            ✏️ Edit
          </button>

<button
  type="button"
  className="bg-red-600 text-white px-3 py-1 rounded-lg text-sm font-bold"
  onClick={() => {
    if (confirm(`Remove ${agent.full_name} from this trip?`)) {
      setAgents((current) =>
        current.filter((a) => a.id !== agent.id)
      );
    }
  }}
>
  🗑️ Remove
</button>

        </div>
      </div>
    ))}
</div>
</div>
</div>

            );
          })}

{agents.length === 0 && (

            <div className="bg-white rounded-3xl shadow p-8 text-center text-gray-500">
              No active agents found. Import or save agents first.
            </div>
          )}
        </div>
      </main>
    </AdminLayout>
  );
}
