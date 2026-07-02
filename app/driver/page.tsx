"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { getUserPlatform } from "../../lib/getUserPlatform";
import {
  updateTripStatus as dispatchUpdateTripStatus,
  acceptDriverDispatch,
  rejectDriverDispatch,
} from "../../lib/dispatchService";
import { TRIP_STATUS } from "../../lib/tripStatus";

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
const [liveDrivers, setLiveDrivers] = useState<LiveDriver[]>([]);
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
      .order("trip_date", { ascending: true });

    if (error) {
      alert(error.message);
      return;
    }

    setTrips(data || []);
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


  async function updateTripStatus(tripId: string, status: string) {
    if (!platformId) {
      alert("Driver platform context is not loaded.");
      return;
    }

    const { error } = await supabase
      .from("trips")
      .update({ status })
      .eq("id", tripId)
      .eq("platform_id", platformId);

    if (error) {
      alert(error.message);
      return;
    }

    setupDriver();
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

  function createSupportTicket() {
    alert("Support ticket feature coming soon.");
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
                          onClick={() => {
                            setSelectedTripId(trip.id);
                            updateTripStatus(trip.id, "In Progress");
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
                onClick={() => updateTripStatus(selectedTrip.id, "Completed")}
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
