"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { getUserPlatform } from "../../lib/getUserPlatform";

type Trip = {
  id: string;
  trip_code: string;
  trip_date: string | null;
  area: string | null;
  pickup_time: string | null;
  dropoff_time: string | null;
  vehicle_name: string | null;
  vehicle_registration: string | null;
  passenger_count: number | null;
  driver_name: string | null;
  status: string | null;
};

type Driver = {
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

export default function DriverPage() {
  const [platformId, setPlatformId] = useState("");
  const [driver, setDriver] = useState<Driver | null>(null);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [passengers, setPassengers] = useState<TripPassenger[]>([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [tracking, setTracking] = useState(false);
  const [watchId, setWatchId] = useState<number | null>(null);
  const [locationMessage, setLocationMessage] = useState("");

  async function setupDriver() {
    const userPlatform = await getUserPlatform();

    if (!userPlatform) {
      window.location.href = "/login";
      return;
    }

    setPlatformId(userPlatform.platformId);

    const { data: driverData } = await supabase
      .from("drivers")
      .select("*")
      .eq("platform_id", userPlatform.platformId)
      .eq("email", userPlatform.email)
      .maybeSingle();

    setDriver(driverData || null);

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

  async function saveDriverLocation(latitude: number, longitude: number) {
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
      .eq("platform_id", platformId)
      .eq("driver_email", user.email)
      .limit(1)
      .maybeSingle();

    if (existing?.id) {
      await supabase
        .from("driver_locations")
        .update({
          driver_name: driver.full_name,
          latitude,
          longitude,
          status: "Online",
          last_updated: new Date().toISOString(),
        })
        .eq("id", existing.id);
    } else {
      await supabase.from("driver_locations").insert({
        platform_id: platformId,
        driver_name: driver.full_name,
        driver_email: user.email,
        latitude,
        longitude,
        status: "Online",
        last_updated: new Date().toISOString(),
      });
    }

    await supabase.from("driver_location_history").insert({
      platform_id: platformId,
      driver_name: driver.full_name,
      latitude,
      longitude,
      speed: null,
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
          position.coords.longitude
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

  function stopGpsTracking() {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
    }

    setWatchId(null);
    setTracking(false);
    setLocationMessage("GPS tracking stopped.");
  }

  async function updateTripStatus(tripId: string, status: string) {
    const { error } = await supabase
      .from("trips")
      .update({ status })
      .eq("id", tripId);

    if (error) {
      alert(error.message);
      return;
    }

    setupDriver();
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

  useEffect(() => {
    setupDriver();
  }, []);

  const driverName = driver?.full_name || "Driver";

  const activeTrips = trips.filter(
    (trip) => trip.status !== "Completed" && trip.status !== "Cancelled"
  );

  const firstTrip = activeTrips[0];
  const assignedVehicle =
    firstTrip?.vehicle_name || driver?.assigned_vehicle || "No vehicle assigned";

  return (
    <main className="min-h-screen bg-[#F6F7FB] text-gray-700">
      {menuOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div className="w-4/5 max-w-sm bg-white h-full p-8 shadow-2xl">
            <div className="flex items-center justify-between mb-10">
              <div>
                <h1 className="text-3xl font-black text-[#061B33]">
                  GHO Driver
                </h1>
                <p className="text-orange-500 font-bold">
                  Driving Excellence
                </p>
              </div>

              <button
                onClick={() => setMenuOpen(false)}
                className="text-3xl text-gray-400"
              >
                ×
              </button>
            </div>

            <nav className="space-y-8 text-xl font-semibold text-gray-500">
              <p>📊 Dashboard</p>
              <p>📅 Bookings</p>
              <p>🧾 Trip History</p>
              <p>👤 Profile</p>
            </nav>

            <button
              onClick={logout}
              className="absolute bottom-8 left-8 right-8 bg-black text-white rounded-2xl py-4 font-bold"
            >
              Sign Out
            </button>
          </div>

          <button
            onClick={() => setMenuOpen(false)}
            className="flex-1 bg-black/40"
          />
        </div>
      )}

      <header className="bg-white border-b p-5 sticky top-0 z-40">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setMenuOpen(true)}
            className="text-3xl text-gray-500"
          >
            ☰
          </button>

          <div className="text-right">
            <h1 className="text-xl font-black text-[#061B33]">
              Driver Dashboard
            </h1>
            <p className="text-sm">
              Logged in as <strong>{driverName}</strong>
            </p>
          </div>
        </div>
      </header>

      <section className="p-4 space-y-5">
        <div className="bg-white rounded-3xl shadow p-6 overflow-hidden">
          <h2 className="text-3xl font-black text-gray-700">
            Hi {driverName.split(" ")[0]}, welcome back.
          </h2>
          <p className="text-xl text-gray-500 mt-2">
            Here are your trips for today.
          </p>

          <div className="bg-gray-100 rounded-xl p-5 mt-6">
            <p className="text-gray-500">Assigned vehicle:</p>
            <p className="text-xl font-bold mt-1">
              {assignedVehicle}
              {firstTrip?.vehicle_registration
                ? `, ${firstTrip.vehicle_registration}`
                : ""}
            </p>
          </div>

          <div className="mt-6 bg-gray-50 rounded-2xl p-6 text-center">
            <div className="text-7xl">🚘</div>
            <p className="text-gray-500 mt-3">
              Safe transport, live tracking, and trip updates.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-6">
            <button
              onClick={startGpsTracking}
              disabled={tracking}
              className="bg-green-600 text-white p-4 rounded-2xl font-bold disabled:bg-gray-300"
            >
              Start GPS
            </button>

            <button
              onClick={stopGpsTracking}
              disabled={!tracking}
              className="bg-red-600 text-white p-4 rounded-2xl font-bold disabled:bg-gray-300"
            >
              Stop GPS
            </button>
          </div>

          {locationMessage && (
            <p className="bg-green-50 text-green-700 border border-green-200 rounded-2xl p-4 mt-5 font-bold">
              ✅ {locationMessage}
            </p>
          )}
        </div>

        <div className="bg-white rounded-3xl shadow p-6">
          <h2 className="text-2xl font-black mb-4">Today&apos;s Trips</h2>

          {activeTrips.length === 0 && (
            <p className="text-gray-500">No trips assigned yet.</p>
          )}

          <div className="space-y-5">
            {activeTrips.map((trip) => {
              const tripPassengers = passengers.filter(
                (passenger) => passenger.trip_id === trip.id
              );

              const firstPassenger = tripPassengers[0];

              return (
                <div key={trip.id} className="border rounded-3xl p-5 bg-gray-50">
                  <p className="text-lg font-black text-[#061B33]">
                    {trip.trip_code}
                  </p>

                  <div className="grid grid-cols-2 gap-4 mt-4 text-gray-600">
                    <div>
                      <p className="font-bold">{trip.trip_date || "No date"}</p>
                      <p className="text-sm">Date</p>
                    </div>

                    <div>
                      <p className="font-bold">
                        {trip.pickup_time || "No time"}
                      </p>
                      <p className="text-sm">Pickup Time</p>
                    </div>

                    <div>
                      <p className="font-bold">{trip.area || "No area"}</p>
                      <p className="text-sm">Area</p>
                    </div>

                    <div>
                      <p className="font-bold">
                        {trip.status || "Assigned"}
                      </p>
                      <p className="text-sm">Status</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mt-5">
                    <button
                      onClick={() => updateTripStatus(trip.id, "In Progress")}
                      className="border border-green-500 text-green-600 px-4 py-2 rounded-lg font-bold"
                    >
                      Open Trip
                    </button>

                    <button
                      onClick={() => openGoogleMaps(firstPassenger?.pickup_address || trip.area)}
                      className="border px-4 py-2 rounded-lg font-bold"
                    >
                      Google Maps
                    </button>

                    <button
                      onClick={() => updateTripStatus(trip.id, "Completed")}
                      className="bg-[#061B33] text-white px-4 py-2 rounded-lg font-bold"
                    >
                      Complete
                    </button>
                  </div>

                  <div className="bg-white rounded-2xl shadow-sm p-4 mt-5">
                    <h3 className="text-xl font-black text-gray-600">
                      Passenger Details
                    </h3>

                    {tripPassengers.length === 0 ? (
                      <p className="text-gray-500 mt-3">
                        No passengers linked to this trip yet.
                      </p>
                    ) : (
                      <div className="space-y-4 mt-4">
                        {tripPassengers.map((passenger) => (
                          <div
                            key={passenger.id}
                            className="border-b pb-4 last:border-b-0"
                          >
                            <p>
                              👤 <strong>Passenger:</strong>{" "}
                              {passenger.full_name || "Unknown"}{" "}
                              {passenger.phone ? `- ${passenger.phone}` : ""}
                            </p>

                            <p>
                              🕒 <strong>Pickup time:</strong>{" "}
                              {passenger.pickup_time || trip.pickup_time || "Not set"}
                            </p>

                            <p>
                              📍{" "}
                              {passenger.pickup_address ||
                                passenger.pickup_area ||
                                "No pickup address"}
                            </p>

                            <div className="flex flex-wrap gap-2 mt-3">
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
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </main>
  );
}
