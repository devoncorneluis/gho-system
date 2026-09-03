"use client";
import PlannerStats from "../../components/planner/PlannerStats";
import { useEffect, useState } from "react";
import AdminLayout from "../../components/AdminLayout";
import { getUserPlatform } from "../../lib/getUserPlatform";
import { supabase } from "../../lib/supabase";
import { recordTripEvent } from "../../lib/tripEventService";
import { TRIP_STATUS } from "../../lib/tripStatus";


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
  group_name: string;
  areas: string[] | null;
};

type Driver = {
  id: string;
  full_name: string;
  availability_status: string | null;
  assigned_vehicle_id: string | null;
};

type Vehicle = {
  id: string;
  vehicle_name: string;
  vehicle_type: string | null;
  registration_number: string;
  passenger_limit: number;
  availability_status: string | null;
};

export default function DailyTransportPlannerPage() {
  const [platformId, setPlatformId] = useState<string | null>(null);
  const [agents, setAgents] = useState<Agent[]>([]);

const [selectedDrivers, setSelectedDrivers] = useState<Record<string, string>>({});
const [drivers, setDrivers] = useState<Driver[]>([]);
const [assignedDrivers, setAssignedDrivers] = useState<string[]>([]);
const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [, setEditingTrips] = useState<Record<string, boolean>>({});const [editedTripNames, setEditedTripNames] = useState<Record<string, string>>({});
  const [editedPickupTimes, setEditedPickupTimes] = useState<Record<string, string>>({});

const [estimatedKm, setEstimatedKm] = useState<Record<string, string>>({});
const [adminCapacity, setAdminCapacity] = useState<Record<string, string>>({});;
const [savingTrip, setSavingTrip] = useState(false);
  const [planDate, setPlanDate] = useState(new Date().toISOString().slice(0, 10));
  const [shift, setShift] = useState("06:00 Shift");

  

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
console.log("ACTIVE PLATFORM:", activePlatformId);
console.log("AGENTS ERROR:", error);
console.log("AGENTS DATA:", data);
    if (error) {
      alert(error.message);
      return;
    }

    setAgents(data || []);
  }

  async function loadDriversAndVehicles(activePlatformId: string) {
const { data: driverData, error: driverError } = await supabase
  .from("drivers")
.select("id, full_name, availability_status, assigned_vehicle_id")
  .eq("platform_id", activePlatformId)
  .eq("status", "Available")
  .eq("availability_status", "Available");
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
    availability_status
  `)
  .eq("platform_id", activePlatformId)
  .eq("status", "Available")
  .eq("availability_status", "Available")
  .order("vehicle_name");

if (vehicleError) {
  alert(vehicleError.message);
  return;
}

const { data: tripData } = await supabase
  .from("trips")
  .select("driver_id")
  .eq("platform_id", activePlatformId)
  .in("status", [
    TRIP_STATUS.DISPATCHED,
    TRIP_STATUS.ACCEPTED,
    TRIP_STATUS.IN_TRANSIT,
  ]);
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

    await loadDriversAndVehicles(userPlatform.platformId);
  }

  setupPage();
}, []);
const groupedAgents = agents.reduce<Record<string, Agent[]>>(
  (groups, agent) => {
    const area = agent.pickup_area || "Unknown Area";

    if (!groups[area]) {
      groups[area] = [];
    }

    groups[area].push(agent);

    return groups;
  },
  {}
);

const selectedPassengers = agents;





function getSuggestedDriverId() {
  const available = drivers.find(
    (driver) => !assignedDrivers.includes(driver.id)
  );

  return available?.id || "";
}




  function startEditTrip(tripKey: string) {
    setEditingTrips((current) => ({ ...current, [tripKey]: true }));
    setEditedTripNames((current) => ({ ...current, [tripKey]: current[tripKey] || tripKey }));
    setEditedPickupTimes((current) => ({
      ...current,
      [tripKey]: current[tripKey] || (shift.includes("06:00") ? "05:00" : "17:00"),
    }));
  }




async function saveConfirmedTrip(
  tripCode: string,
  area: string,
  areaAgents: Agent[]
) {
  if (savingTrip) return;

  setSavingTrip(true);

  try {
    const driverId =
      selectedDrivers[area] || getSuggestedDriverId();

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
      (v) => v.id === driver?.assigned_vehicle_id
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
      editedPickupTimes[area] ||
      (shift.includes("06:00") ? "05:00" : "17:00");

    const dropoffTime =
      shift.includes("06:00") ? "06:00" : "18:00";

    const kmValue =
      estimatedKm[area]
        ? Number(estimatedKm[area])
        : null;

    const { data: savedTrip, error: tripError } =
      await supabase
        .from("trips")
        .insert({
          platform_id: platformId,
          trip_code: tripCode,
          trip_date: planDate,
          shift,
          driver_id: driver.id,
          driver_name: driver.full_name,
          vehicle_id: vehicle.id,
          vehicle_name: vehicle.vehicle_name,
          passenger_count: areaAgents.length,
          distance_km: kmValue,
          status: TRIP_STATUS.DISPATCHED,
          approved: true,
          dispatched: true,
        })
        .select("id")
        .single();

    if (tripError || !savedTrip) {
      alert(
        tripError?.message ||
        "Trip could not be saved"
      );
      return;
    }

    await recordTripEvent({
      tripId: savedTrip.id,
      platformId,
      createdBy: driver.id,
      eventType: "trip_dispatched",
      eventData: {
        description: `${tripCode} dispatched.`,
        tripCode,
        driverName,
        vehicleName,
        route: routeName,
        passengers: areaAgents.length,
      },
    });

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
      const { error: passengerError } =
        await supabase
          .from("trip_passengers")
          .insert(passengersToSave);

      if (passengerError) {
        alert(passengerError.message);
        return;
      }
    }

    alert(
      `${tripCode} saved as Confirmed. Manage driver and vehicle from Trips page.`
    );
  } finally {
    setSavingTrip(false);
  }
}
  return (
    <AdminLayout>
      <main className="min-h-screen bg-gray-100 p-6">

        <h1 className="text-4xl font-black text-[#061B33]">
          🚐 Daily Transport Planner
        </h1>

        <p className="text-gray-600 mt-2">
          Plan staff transport, assign drivers, verify vehicles and capacity, then dispatch.
        </p>

        <div className="bg-white rounded-2xl shadow p-6 mt-6">
          <h2 className="text-xl font-bold mb-4">
            Planning Details
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

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

            <button
              type="button"
              onClick={() => {
                if (!platformId) return;

                loadAgents(platformId);
                loadDriversAndVehicles(platformId);
              }}
              className="bg-orange-500 text-white rounded-lg px-5 py-3 font-bold"
            >
              🔄 Refresh Plan
            </button>

          </div>
        </div>

        <PlannerStats
          activeAgents={agents.length}
          plannedTrips={Object.keys(groupedAgents).length}
          planDate={planDate}
        />

        <div className="mt-6 space-y-5">

          {Object.entries(groupedAgents).map(
            ([area, areaAgents], index) => {

              const tripCode =
                `GHO-${planDate.replaceAll("-", "")}-${String(index + 1).padStart(3, "0")}`;

const effectiveDriverId =
  selectedDrivers[area] || getSuggestedDriverId();

const selectedDriver = drivers.find(
  (driver) => driver.id === effectiveDriverId
);

              const assignedVehicle = vehicles.find(
                (vehicle) =>
                  vehicle.id === selectedDriver?.assigned_vehicle_id
              );

              const vehicleCapacity =
                assignedVehicle?.passenger_limit || 0;

              const passengerCount = areaAgents.length;

              const capacityOkay =
                vehicleCapacity >= passengerCount;

              const distanceOkay =
                Boolean(estimatedKm[area]);

              const driverOkay =
                Boolean(selectedDriver);

              const vehicleOkay =
                Boolean(assignedVehicle);

              const passengersOkay =
                passengerCount > 0;

              const ready =
                driverOkay &&
                vehicleOkay &&
                capacityOkay &&
                distanceOkay &&
                passengersOkay;

              return (
                <div
                  key={area}
                  className="bg-white rounded-3xl shadow p-6"
                >

                  <div className="flex flex-col gap-5">

                    <div>
                      <p className="text-sm text-gray-500 font-bold">
                        Trip {tripCode}
                      </p>

                      <h2 className="text-2xl font-black text-[#061B33] mt-1">
                        {area}
                      </h2>

                      <p className="text-sm text-gray-500 mt-1">
                        {passengerCount} passenger
                        {passengerCount === 1 ? "" : "s"}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                      <div className="border rounded-xl p-4">
                        <p className="font-bold text-sm text-gray-600 mb-2">
                          👨 Driver
                        </p>

                        <select
                          value={
                            selectedDrivers[area] ||
                            getSuggestedDriverId()
                          }
                          onChange={(e) =>
                            setSelectedDrivers((current) => ({
                              ...current,
                              [area]: e.target.value,
                            }))
                          }
                          className="border p-3 rounded-lg w-full"
                        >
                          <option value="">
                            Select Driver
                          </option>

                          {drivers.map((driver) => (
                            <option
                              key={driver.id}
                              value={driver.id}
                            >
                              {driver.full_name}
                              {assignedDrivers.includes(driver.id)
                                ? " ⚠ Already Assigned"
                                : " ✓ Available"}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="border rounded-xl p-4 bg-yellow-50">
                        <p className="font-bold text-sm text-gray-600">
                          🚐 Assigned Vehicle
                        </p>

                        {assignedVehicle ? (
                          <>
                            <p className="font-semibold mt-2">
                              {assignedVehicle.vehicle_name}
                            </p>

                            <p className="text-sm text-gray-500">
                              {assignedVehicle.registration_number}
                            </p>

                            <p className="text-sm text-gray-500">
                              Capacity: {vehicleCapacity}
                            </p>
                          </>
                        ) : (
                          <p className="text-gray-500 mt-2">
                            No vehicle assigned
                          </p>
                        )}
                      </div>

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
                      placeholder="Trip Distance (KM)"
                      className="border p-3 rounded-lg"
                    />

<div
  className={`rounded-xl border p-4 ${
    ready
      ? "border-green-200 bg-green-50"
      : "border-orange-200 bg-orange-50"
  }`}
>
  <p
    className={`font-bold ${
      ready ? "text-green-700" : "text-orange-700"
    }`}
  >
    {ready ? "✅ Ready to Create Trip" : "⚠️ Complete Requirements"}
  </p>

  <div className="mt-3 space-y-1 text-sm">
    <p>{driverOkay ? "✅ Driver selected" : "❌ Select a driver"}</p>
    <p>{vehicleOkay ? "✅ Vehicle assigned" : "❌ Vehicle required"}</p>
    <p>
      {capacityOkay
        ? `✅ Capacity OK — ${passengerCount} / ${vehicleCapacity}`
        : `❌ Over vehicle capacity`}
    </p>
    <p>{distanceOkay ? "✅ Distance entered" : "❌ Enter trip distance"}</p>
    <p>{passengersOkay ? "✅ Passengers loaded" : "❌ No passengers"}</p>
  </div>
</div>
                    <button
                      type="button"
disabled={!ready || savingTrip}
                      onClick={() =>
                        saveConfirmedTrip(
                          tripCode,
                          area,
                          areaAgents
                        )
                      }
                      className={`rounded-lg px-5 py-3 font-bold text-white ${
                        ready
                          ? "bg-[#061B33]"
                          : "bg-gray-400 cursor-not-allowed"
                      }`}
                    >
{savingTrip
  ? "⏳ Creating Trip..."
  : `✅ ${ready ? "Create Trip" : "Complete Requirements"}`}
</button>

                  </div>

                  <div className="mt-5 bg-gray-50 rounded-2xl p-4">

                    <p className="font-black text-[#061B33] mb-3">
                      👥 Passengers
                    </p>

                    <div className="space-y-2">

                      {areaAgents.map(
                        (agent, passengerIndex) => (
                          <div
                            key={agent.id}
                            className="bg-white rounded-xl p-4 border"
                          >

                            <p className="font-bold">
                              {passengerIndex + 1}. {agent.full_name}
                            </p>

                            <p className="text-sm text-gray-500 mt-1">
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

                            <button
                              type="button"
                              className="mt-3 bg-red-600 text-white px-3 py-1 rounded-lg text-sm font-bold"
                              onClick={() => {
                                if (
                                  confirm(
                                    `Remove ${agent.full_name} from this trip?`
                                  )
                                ) {
                                  setAgents((current) =>
                                    current.filter(
                                      (a) => a.id !== agent.id
                                    )
                                  );
                                }
                              }}
                            >
                              🗑️ Remove
                            </button>

                          </div>
                        )
                      )}

                    </div>
                  </div>

                </div>
              );
            }
          )}

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
