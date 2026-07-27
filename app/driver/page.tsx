"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { getUserPlatform } from "../../lib/getUserPlatform";
import {
  updateTripStatus as dispatchUpdateTripStatus,
  acceptDriverDispatch,
  rejectDriverDispatch,
  arriveAtPickup,
} from "../../lib/dispatchService";
import { TRIP_STATUS } from "../../lib/tripStatus";
import { error } from "console";

type Trip = {
  id: string;
  trip_code: string;
  trip_date: string | null;
  shift?: string | null;
  area: string | null;
  pickup_time: string | null;
  dropoff_time: string | null;
  vehicle_name: string | null;
  vehicle_registration: string | null;
  passenger_count: number | null;
  driver_name: string | null;
  driver_response?: string | null;
  status: string | null;
  estimated_km?: number | null;
};

type Driver = {
  id: string;
  full_name: string;
  driver_code: string | null;
  phone: string | null;
  email: string | null;
  assigned_vehicle: string | null;
  availability_status: string | null;
  status: string | null;
  photo_url: string | null;
};

type TripPassenger = {
  id: string;
  trip_id: string;
  full_name: string | null;
  phone: string | null;
  pickup_area: string | null;
  pickup_address: string | null;
  pickup_time: string | null;
  dropoff_time: string | null;
  pickup_status: string | null;
};
type LiveDriver = {
  driver_id: string;
  trip_id: string | null;
  latitude: number;
  longitude: number;
  speed: number | null;
  heading: number | null;
  accuracy: number | null;
  is_tracking: boolean;
  updated_at: string;
};

export default function DriverPage() {
  const [platformId, setPlatformId] = useState("");
  const [userId, setUserId] = useState("");
  const [driver, setDriver] = useState<Driver | null>(null);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [processing, setProcessing] = useState<string[]>([]);
  const [passengers, setPassengers] = useState<TripPassenger[]>([]);
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null);
  const [tracking, setTracking] = useState(false);
  const [watchId, setWatchId] = useState<number | null>(null);
  const [locationMessage, setLocationMessage] = useState("");
  const [currentLatitude, setCurrentLatitude] = useState<number | null>(null);
const [currentLongitude, setCurrentLongitude] = useState<number | null>(null);
const [liveDrivers, setLiveDrivers] = useState<LiveDriver[]>([]);
const [showIncidentMenu, setShowIncidentMenu] = useState(false);
const incidentTypes = [
    "🚧 Road Closed",
    "🚦 Heavy Traffic",
    "🚓 Accident",
    "🚑 Medical Emergency",
    "🚐 Vehicle Breakdown",
    "👤 Passenger No Show",
    "⛽ Fuel Stop",
    "🛠 Other Issue",
  ];
  async function setupDriver() {

    const userPlatform = await getUserPlatform();

    if (!userPlatform) {
      window.location.href = "/login";
      return;
    }



    const { data: driverData } = await supabase
      .from("drivers")
      .select("*")
      .eq("platform_id", userPlatform.platformId)
      .eq("email", userPlatform.email)
      .maybeSingle();

    setDriver(driverData || null);
    setPlatformId(userPlatform.platformId);
    setUserId(userPlatform.userId);

    if (driverData?.full_name) {
      await loadTrips(userPlatform.platformId, driverData.full_name);
    }

    await loadPassengers(userPlatform.platformId);
  }

  async function loadTrips(activePlatformId: string, driverName: string) {
    const { data, error } = await supabase
      .from("trips")
      .select("*")
      .eq("platform_id", activePlatformId)
      .eq("driver_name", driverName)
      .in("status", ["dispatched", "started"])
      .order("trip_date", { ascending: true });

    if (error) {
      alert(error.message);
      return;
    }

    setTrips(data || []);
  }
  async function respondToDispatch(
  tripId: string,
  response: "accepted" | "rejected"
) {
  const { error } = await supabase
    .from("trips")
    .update({
      driver_response: response,
    })
    .eq("id", tripId);

  if (error) {
    alert(error.message);
    return;
  }

  await loadTrips(platformId, driver?.full_name || "");
}
  async function loadLiveDrivers() {
  const { data, error } = await supabase
    .from("driver_locations")
    .select(
      "driver_id, trip_id, latitude, longitude, speed, heading, accuracy, is_tracking, updated_at"
    )
    .eq("is_tracking", true);

  if (error) {
    console.error(error);
    return;
  }

  setLiveDrivers(data || []);
}

  async function loadPassengers(activePlatformId: string) {
    const { data, error } = await supabase
      .from("trip_passengers")
      .select("*")
      .eq("platform_id", activePlatformId);

    if (error) {
      alert(error.message);
      return;
    }

    setPassengers(data || []);
  }

async function saveDriverLocation(
  latitude: number,
  longitude: number,
  speed: number | null,
  heading: number | null,
  accuracy: number | null,
  tripId: string | null
) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!platformId || !user?.email || !driver?.full_name) {
      alert("Driver profile not loaded yet.");
      return;
    }

const { data: existing } = await supabase
  .from("driver_locations")
  .select("id")
  .eq("driver_id", driver.id)
  .limit(1)
  .maybeSingle();

    if (existing?.id) {
await supabase
  .from("driver_locations")
  .update({
    trip_id: tripId,
    latitude,
    longitude,
    speed,
    heading,
    accuracy,
    is_tracking: true,
    updated_at: new Date().toISOString(),
  })
  .eq("id", existing.id);
    } else {
await supabase.from("driver_locations").insert({
  driver_id: driver.id,
  trip_id: tripId,
  latitude,
  longitude,
  speed,
  heading,
  accuracy,
  is_tracking: true,
  updated_at: new Date().toISOString(),
});
    }

await supabase.from("driver_location_history").insert({
  driver_id: driver.id,
  trip_id: tripId,
  latitude,
  longitude,
  speed,
  heading,
  recorded_at: new Date().toISOString(),
});
  }

  function startGpsTracking() {
    if (!navigator.geolocation) {
      alert("Location is not supported on this device.");
      return;
    }

    const id = navigator.geolocation.watchPosition(

async (position) => {
  setCurrentLatitude(position.coords.latitude);
  setCurrentLongitude(position.coords.longitude);

  await saveDriverLocation(
    position.coords.latitude,
    position.coords.longitude,
    position.coords.speed,
    position.coords.heading,
    position.coords.accuracy,
    selectedTripId
  );

  setTracking(true);
  setLocationMessage("Signed in successfully. GPS tracking active.");
},
      () => {
        alert("Location permission denied.");
      },
      {
        enableHighAccuracy: true,
        maximumAge: 5000,
        timeout: 10000,
      }
    );

    setWatchId(id);
    setTracking(true);
  }

async function stopGpsTracking() {
  if (watchId !== null) {
    navigator.geolocation.clearWatch(watchId);
  }

  if (driver?.id) {
    const { error } = await supabase
      .from("driver_locations")
      .update({
        is_tracking: false,
        updated_at: new Date().toISOString(),
      })
      .eq("driver_id", driver.id);

    if (error) {
      console.error(error);
    }
  }

  setWatchId(null);
  setTracking(false);
  setLocationMessage("GPS tracking stopped.");
}


async function updateTripStatus(
  trip: Trip,
  nextStatus: string
) {
  if (!platformId) {
    alert("Platform not loaded.");
    return;
  }

  if (!trip.status) {
    alert("Trip status missing.");
    return;
  }

  try {
await dispatchUpdateTripStatus(
  trip.id,
  trip.status,
  nextStatus,
  {
    platformId,
  }
);

if (nextStatus === TRIP_STATUS.COMPLETED && driver) {
  try {
    const { logAudit } = await import("../../lib/auditLog");
    const { recordCompletedTrip } = await import("../../lib/billing");
    const { recordDriverTrip } = await import("../../lib/payroll");

    await logAudit(
      "Trip Completed",
      trip.id,
      driver.full_name
    );

    await recordCompletedTrip(trip.id);

    await recordDriverTrip(
      driver.id,
      trip.id,
      trip.estimated_km ?? 0
    );
  } catch (err) {
    console.error("Post-trip processing failed:", err);
  }
}

setupDriver();
  } catch (err: any) {
    alert(err.message);
  }
}

async function handleArriveAtPickup(trip: Trip) {
  if (!driver) return;

  try {
    await arriveAtPickup(
      supabase,
      trip.id,
      platformId,
      driver.id
    );

    await setupDriver();
  } catch (err: any) {
    alert(err.message);
  }
}

  async function acceptTrip(trip: Trip) {
    if (!trip.status) {
      alert("This trip has no current status.");
      return;
    }

    const prev = trips.find((t) => t.id === trip.id) || null;
    setTrips((prevList) => prevList.map((t) => (t.id === trip.id ? { ...t, driver_name: t.driver_name, status: t.status, } : t)));
    // optimistic set driver_response
    setTrips((prevList) => prevList.map((t) => (t.id === trip.id ? { ...t, driver_response: "accepted" } : t)));
    setProcessing((s) => (s.includes(trip.id) ? s : [...s, trip.id]));

    try {
      await acceptDriverDispatch(trip.id, platformId, userId);
    } catch (error: any) {
      console.error(error);
      // revert
      if (prev) {
        setTrips((prevList) => prevList.map((t) => (t.id === trip.id ? prev : t)));
      }
      alert("Unable to accept trip.");
    } finally {
      setProcessing((s) => s.filter((x) => x !== trip.id));
    }
  }

  async function rejectTrip(trip: Trip) {
    if (!trip.status) {
      alert("This trip has no current status.");
      return;
    }

    const prev = trips.find((t) => t.id === trip.id) || null;
    setTrips((prevList) => prevList.map((t) => (t.id === trip.id ? { ...t, driver_response: "rejected" } : t)));
    setProcessing((s) => (s.includes(trip.id) ? s : [...s, trip.id]));

    try {
      await rejectDriverDispatch(trip.id, platformId, userId);
    } catch (error: any) {
      console.error(error);
      if (prev) {
        setTrips((prevList) => prevList.map((t) => (t.id === trip.id ? prev : t)));
      }
      alert("Unable to reject trip.");
    } finally {
      setProcessing((s) => s.filter((x) => x !== trip.id));
    }
  }

  async function updatePassengerStatus(passengerId: string, status: string) {
    const { error } = await supabase
      .from("trip_passengers")
      .update({ pickup_status: status })
      .eq("id", passengerId);

    if (error) {
      alert(error.message);
      return;
    }

    if (platformId) {
      loadPassengers(platformId);
      const tripPassengers = passengers.filter(
  (p) => p.trip_id === selectedTripId
);

const pickedUp =
  tripPassengers.filter(
    (p) =>
      p.id === passengerId
        ? status === "Picked Up"
        : p.pickup_status === "Picked Up"
  ).length;

if (
  tripPassengers.length > 0 &&
  pickedUp === tripPassengers.length
) {
if (
  tripPassengers.length > 0 &&
  pickedUp === tripPassengers.length &&
  selectedTrip
) {
  await updateTripStatus(
    selectedTrip,
    TRIP_STATUS.IN_TRANSIT
  );

  alert(
    "✅ All passengers collected.\n\nTrip is now In Transit."
  );
}
}
    }
  }

  async function logout() {
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  function openGoogleMaps(address: string | null) {
    if (!address) {
      alert("No pickup address available.");
      return;
    }

    window.open(
      `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`,
      "_blank"
    );
  }

  function statusBadge(status: string | null) {
    const value = status || "assigned";
    return value.toLowerCase();
  }
function DriverProgressTimeline({ status }: { status: string | null }) {
  const steps = [
    { label: "Dispatch Received", status: "dispatched" },
    { label: "Trip Accepted", status: "accepted" },
    { label: "En Route", status: "en_route" },
    { label: "Arrived at Pickup", status: "picking_up" },
    { label: "In Transit", status: "in_transit" },
    { label: "Completed", status: "completed" },
  ];

  const currentIndex = steps.findIndex(
    (step) => step.status === (status || "")
  );

  return (
    <div className="rounded-2xl border bg-gray-50 p-4 mt-6">
      <h3 className="font-bold text-[#061B33] mb-3">
        Trip Progress
      </h3>

      <div className="space-y-2">
        {steps.map((step, index) => (
          <div
            key={step.status}
            className="flex items-center gap-3"
          >
            <span className="text-lg">
              {index <= currentIndex ? "✅" : "⬜"}
            </span>

            <span
              className={
                index <= currentIndex
                  ? "font-semibold text-green-700"
                  : "text-gray-500"
              }
            >
              {step.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
  function createSupportTicket() {
    alert("Support ticket feature coming soon.");
  }
async function reportIncident(incident: string) {
  if (!selectedTrip || !driver || !platformId) {
    alert("No active trip selected.");
    return;
  }

const { error } = await supabase
  .from("emergency_alerts")
.insert({
  platform_id: platformId,
  trip_id: selectedTrip.id,
  driver_id: driver.id,

driver_name: driver.full_name,
  vehicle_name: selectedTrip.vehicle_name,
  vehicle_registration: selectedTrip.vehicle_registration,

  alert_type: incident,
  description: incident,
  notes: "",
latitude: currentLatitude,
longitude: currentLongitude,
  status: "Open",
  created_at: new Date().toISOString(),
});

  if (error) {
    alert(error.message);
    return;
  }

  alert("✅ Incident reported successfully.");

  setShowIncidentMenu(false);
}
  useEffect(() => {

    setupDriver();

  }, []);

  const driverName = driver?.full_name || "Driver";

  const activeTrips = trips.filter(
    (trip) => trip.status !== "Completed" && trip.status !== "Cancelled"
  );

  const selectedTrip = activeTrips.find((trip) => trip.id === selectedTripId);
  const selectedPassengers = selectedTrip

    ? passengers.filter((passenger) => passenger.trip_id === selectedTrip.id)
    : [];

  return (

    <main className="min-h-screen bg-[#F6F7FB] text-gray-700">
      <header className="bg-white border-b sticky top-0 z-40 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black text-[#061B33]">GHO Driver</h1>
            <p className="text-sm text-gray-500">{driverName}</p>
          </div>

          <button
            onClick={logout}
            className="border rounded-xl px-4 py-2 font-bold text-gray-600"
          >
            Logout
          </button>
        </div>
      </header>

      <section className="p-4 space-y-5 max-w-2xl mx-auto">
        <div className="bg-white rounded-3xl shadow p-5">
          <p className="text-sm text-gray-400 font-bold">Driver Status</p>
          <h2 className="text-2xl font-black text-[#061B33]">
            {driver?.availability_status || "Available"}
          </h2>

          <div className="grid grid-cols-2 gap-3 mt-4">
            <button
              onClick={startGpsTracking}
              disabled={tracking}
              className="bg-green-600 text-white p-3 rounded-2xl font-bold disabled:bg-gray-300"
            >
              Start GPS
            </button>

            <button
              onClick={stopGpsTracking}
              disabled={!tracking}
              className="bg-red-600 text-white p-3 rounded-2xl font-bold disabled:bg-gray-300"
            >
              Stop GPS
            </button>
          </div>

          {locationMessage && (
            <p className="bg-green-50 text-green-700 border border-green-200 rounded-2xl p-3 mt-4 font-bold">
              ✅ {locationMessage}
            </p>
          )}
        </div>

        {!selectedTrip && (
          <div className="bg-white rounded-3xl shadow p-5">
            <h2 className="text-2xl font-black mb-4">Assigned Trips</h2>

            {activeTrips.length === 0 && (
              <p className="text-gray-500">No assigned trips yet.</p>
            )}

            <div className="space-y-4">
              {activeTrips.map((trip) => {
                const tripPassengers = passengers.filter(
                  (passenger) => passenger.trip_id === trip.id
                );

                const firstPassenger = tripPassengers[0];

                return (
                  <div key={trip.id} className="bg-white border rounded-3xl p-5 shadow-sm">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xl font-black text-[#061B33]">
                          {trip.trip_code}
                        </p>
                        <p className="text-gray-500 mt-1">
                          {trip.area || "Route not set"}
                        </p>
                      </div>

                      <span className="bg-gray-100 rounded-full px-3 py-1 text-sm font-bold text-gray-500">
                        {statusBadge(trip.status)}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mt-5 text-sm text-gray-700">
                      <p>📅 {trip.trip_date || "No date"}</p>
                      <p>👥 {trip.passenger_count || tripPassengers.length} Passengers Assigned</p>
                      <p>📏 {trip.estimated_km ? `${trip.estimated_km} km` : "KM not set"}</p>
                      <p>🚐 Vehicle: {trip.vehicle_name || "Vehicle not assigned"}</p>
                      <p className="col-span-2">🔢 Registration: {trip.vehicle_registration || "No registration"}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mt-5">
                      <div className="flex gap-2">
                        <button
onClick={async () => {
  setSelectedTripId(trip.id);
  await updateTripStatus(
    trip,
TRIP_STATUS.EN_ROUTE
  );
}}
                          className="border rounded-xl px-3 py-3 font-bold"
                        >
                          Start Trip
                        </button>

                        {(trip.driver_response === null || trip.driver_response === "" || trip.driver_response === "pending") && (
                          <>
                            <button
                              onClick={() => acceptTrip(trip)}
                              disabled={processing.includes(trip.id)}
                              className={`px-3 py-3 rounded-xl font-bold ${processing.includes(trip.id) ? "bg-gray-200 text-gray-400" : "bg-green-50 text-green-700"}`}
                            >
                              Accept
                            </button>
                            <button
                              onClick={() => rejectTrip(trip)}
                              disabled={processing.includes(trip.id)}
                              className={`px-3 py-3 rounded-xl font-bold ${processing.includes(trip.id) ? "bg-gray-200 text-gray-400" : "bg-red-50 text-red-700"}`}
                            >
                              Reject
                            </button>
                          </>
                        )}
                      </div>
{trip.status === TRIP_STATUS.EN_ROUTE && (
  <button
    onClick={() => handleArriveAtPickup(trip)}
    className="bg-orange-600 text-white rounded-xl px-3 py-3 font-bold"
  >
    Arrived at Pickup
  </button>
)}
                      <button
                        onClick={() =>
                          openGoogleMaps(firstPassenger?.pickup_address || trip.area)
                        }
                        className="bg-[#061B33] text-white rounded-xl px-3 py-3 font-bold"
                      >
                        Google Maps
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {selectedTrip && (
          <>
            <button
              onClick={() => setSelectedTripId(null)}
              className="border rounded-xl px-4 py-2 font-bold bg-white"
            >
              ← Back to trips
            </button>

            <div className="bg-white rounded-3xl shadow p-6">
              <h2 className="text-2xl font-black text-center text-gray-400">
                Trip Details
              </h2>

              <div className="border-t mt-6 pt-6">
                <p className="text-xl font-bold">{selectedTrip.trip_code}</p>
                <p className="text-gray-400">Trip ID</p>
              </div>

              <div className="grid grid-cols-2 gap-6 border-t mt-6 pt-6">
                <div>
                  <p className="text-xl font-bold">
                    {selectedTrip.trip_date || "No date"}
                  </p>
                  <p className="text-gray-400">Date</p>
                </div>

                <div>
                  <p className="text-xl font-bold">
                    {selectedTrip.shift || selectedTrip.pickup_time || "No time"}
                  </p>
                  <p className="text-gray-400">Timeslot</p>
                </div>
              </div>

              <div className="border-t mt-6 pt-6">
                <p className="text-xl font-bold">Corneluis Group Pty Ltd</p>
                <p className="text-gray-400">Company</p>
              </div>

              <div className="border-t mt-6 pt-6">
                <p className="text-xl font-bold">
                  {selectedTrip.vehicle_name ||
                    driver?.assigned_vehicle ||
                    "No vehicle assigned"}
                </p>
                <p className="text-gray-400">
                  {selectedTrip.vehicle_registration || "Fleet"}
                </p>
              </div>

              <div className="border-t mt-6 pt-6">
                <p className="text-xl font-bold">
                  {selectedTrip.area || "No route"}
                </p>
                <p className="text-gray-400">Route</p>
              </div>

              <div className="border-t mt-6 pt-6">
                <p className="text-xl font-bold">
                  {selectedTrip.estimated_km ? `${selectedTrip.estimated_km} km` : "KM not set"}
                </p>
                <p className="text-gray-400">Distance</p>
              </div>
<DriverProgressTimeline status={selectedTrip.status} />
<div className="mt-6">
  <button
    onClick={() => setShowIncidentMenu(!showIncidentMenu)}
    className="w-full rounded-xl bg-red-600 px-4 py-3 font-bold text-white hover:bg-red-700"
  >
    🚨 Report Incident
  </button>

  {showIncidentMenu && (
    <div className="mt-3 rounded-2xl border bg-white p-4 shadow">
      <p className="mb-3 font-bold text-[#061B33]">
        Select Incident
      </p>

      <div className="grid gap-2">
        {incidentTypes.map((incident) => (
          <button
            key={incident}
onClick={() => reportIncident(incident)}
            className="rounded-lg border p-3 text-left hover:bg-gray-100"
          >
            {incident}
          </button>
        ))}
      </div>
    </div>
  )}
</div>
              <button
                onClick={createSupportTicket}
                className="border border-green-500 text-green-600 rounded-lg px-4 py-2 font-bold mt-6"
              >
                Create Support Ticket
              </button>
            </div>

            <div className="bg-white rounded-3xl shadow p-6">
              <h2 className="text-2xl font-black text-gray-400 mb-6">
                Passenger Details
              </h2>

              {selectedPassengers.length === 0 && (
                <p className="text-gray-500">No passengers linked to this trip yet.</p>
              )}

              <div className="space-y-5">
                {selectedPassengers.map((passenger) => (
                  <div key={passenger.id} className="border-b pb-5 last:border-b-0">
                    <p>
                      👤 <strong>Passenger:</strong>{" "}
                      {passenger.full_name || "Unknown"}{" "}
                      {passenger.phone ? `- ${passenger.phone}` : ""}
                    </p>

                    <p className="mt-2">
                      🕒 <strong>Pick up time:</strong>{" "}
                      {passenger.pickup_time ||
                        selectedTrip.pickup_time ||
                        "Not set"}
                    </p>

                    <p className="mt-2 text-gray-600">
                      📍{" "}
                      {passenger.pickup_address ||
                        passenger.pickup_area ||
                        "No pickup address"}
                    </p>

                    <p className="mt-2 text-gray-600">
                      🟠 {selectedTrip.area || "Destination not set"}
                    </p>

                    <p className="mt-2 font-bold text-gray-700">
                      {passenger.pickup_status === "Picked Up" ? (
                        <span className="text-green-600 font-bold">🟢 Picked Up</span>
                      ) : passenger.pickup_status === "Running Late" ? (
                        <span className="text-orange-500 font-bold">🟠 Running Late</span>
                      ) : passenger.pickup_status === "No Show" ? (
                        <span className="text-red-600 font-bold">🔴 No Show</span>
                      ) : (
                        <span className="text-yellow-600 font-bold">🟡 Waiting</span>
                      )}
                    </p>

                    <div className="flex flex-wrap gap-2 mt-4">
                      <button
                        onClick={() =>
                          updatePassengerStatus(passenger.id, "Picked Up")
                        }
                        className="bg-green-600 text-white px-3 py-2 rounded-lg font-bold"
                      >
                        Picked Up
                      </button>

                      <button
                        onClick={() =>
                          updatePassengerStatus(passenger.id, "Running Late")
                        }
                        className="bg-orange-500 text-white px-3 py-2 rounded-lg font-bold"
                      >
                        Late
                      </button>

                      <button
                        onClick={() =>
                          updatePassengerStatus(passenger.id, "No Show")
                        }
                        className="bg-red-600 text-white px-3 py-2 rounded-lg font-bold"
                      >
                        No Show
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <button

onClick={() => {
  const waitingPassengers = selectedPassengers.filter(
    (p) => p.pickup_status !== "Picked Up"
  );

  if (waitingPassengers.length > 0) {
    alert(
      `There are still ${waitingPassengers.length} passenger(s) waiting to be collected.`
    );
    return;
  }

  updateTripStatus(
    selectedTrip,
    TRIP_STATUS.COMPLETED
  );
}}

                className="bg-[#061B33] text-white rounded-2xl p-4 font-bold w-full mt-6"
              >
                Complete Trip
              </button>
            </div>
          </>
        )}
      </section>
    </main>
  );
}
