"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import UserTopBar from "../../components/UserTopBar";

const PLATFORM_ID = "713c411b-847e-4379-8e38-c142e06ff5fd";
const DRIVER_NAME = "adam";

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
  const [trips, setTrips] = useState<Trip[]>([]);
  const [driver, setDriver] = useState<Driver | null>(null);
  const [passengers, setPassengers] = useState<TripPassenger[]>([]);
  const [tracking, setTracking] = useState(false);
  const [watchId, setWatchId] = useState<number | null>(null);
  const [locationMessage, setLocationMessage] = useState("");

  async function loadDriver() {
    const { data } = await supabase
      .from("drivers")
      .select("*")
      .eq("platform_id", PLATFORM_ID)
      .eq("full_name", DRIVER_NAME)
      .single();

    setDriver(data);
  }

  async function loadTrips() {
    const { data, error } = await supabase
      .from("trips")
      .select("*")
      .eq("platform_id", PLATFORM_ID)
      .eq("driver_name", DRIVER_NAME)
      .order("trip_date", { ascending: true });

    if (error) {
      alert(error.message);
      return;
    }

    setTrips(data || []);
  }

  async function saveDriverLocation(latitude: number, longitude: number) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user?.email || !driver?.full_name) {
      alert("Driver profile not loaded yet.");
      return;
    }

    const { data: existing } = await supabase
      .from("driver_locations")
      .select("id")
      .eq("platform_id", PLATFORM_ID)
      .eq("driver_email", user.email)
      .limit(1)
      .single();

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
        platform_id: PLATFORM_ID,
        driver_name: driver.full_name,
        driver_email: user.email,
        latitude,
        longitude,
        status: "Online",
        last_updated: new Date().toISOString(),
      });
    }

    await supabase.from("driver_location_history").insert({
      platform_id: PLATFORM_ID,
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
        setLocationMessage("GPS tracking active. Location updated.");
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

    loadTrips();
    loadDriver();
  }

  async function loadPassengers() {
    const { data, error } = await supabase
      .from("trip_passengers")
      .select("*")
      .eq("platform_id", PLATFORM_ID);

    if (error) {
      alert(error.message);
      return;
    }

    setPassengers(data || []);
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

    loadPassengers();
  }

  useEffect(() => {
    loadDriver();
    loadTrips();
    loadPassengers();
  }, []);

  const upcomingTrips = trips.filter(
    (trip) => trip.status !== "Completed" && trip.status !== "Cancelled"
  );

  const completedTrips = trips.filter((trip) => trip.status === "Completed");

  return (
    <main className="min-h-screen bg-gray-100">
      <UserTopBar />

      <div className="p-6">
        <h1 className="text-4xl font-bold text-[#061B33]">
          Driver Dashboard
        </h1>

        {driver && (
          <div className="bg-white rounded-xl shadow p-6 mt-6">
            <div className="flex flex-wrap gap-3 mb-5">
              <button
                onClick={startGpsTracking}
                disabled={tracking}
                className="bg-green-600 text-white px-5 py-3 rounded-lg font-bold disabled:bg-gray-400"
              >
                📍 Start GPS Tracking
              </button>

              <button
                onClick={stopGpsTracking}
                disabled={!tracking}
                className="bg-red-600 text-white px-5 py-3 rounded-lg font-bold disabled:bg-gray-400"
              >
                Stop GPS Tracking
              </button>
            </div>

            {locationMessage && (
              <p className="text-green-700 font-bold mb-4">{locationMessage}</p>
            )}
            <div className="flex gap-5 items-center">
              {driver.photo_url ? (
                <img
                  src={driver.photo_url || ""}
                  alt={driver.full_name}
                  className="w-24 h-24 rounded-full object-cover border-4 border-orange-500"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center text-4xl">
                  📷
                </div>
              )}

              <div>
                <h2 className="text-2xl font-bold text-[#061B33]">
                  {driver.full_name}
                </h2>
                <p className="text-gray-600">{driver.driver_code}</p>
                <p><strong>Phone:</strong> {driver.phone}</p>
                <p><strong>Vehicle:</strong> {driver.assigned_vehicle}</p>
                <p><strong>Availability:</strong> {driver.availability_status}</p>
                <p><strong>Status:</strong> {driver.status}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="bg-orange-50 rounded-xl p-4">
                <p className="font-bold">Total Trips</p>
                <p className="text-3xl font-bold text-orange-500">{trips.length}</p>
              </div>

              <div className="bg-green-50 rounded-xl p-4">
                <p className="font-bold">Completed</p>
                <p className="text-3xl font-bold text-green-600">{completedTrips.length}</p>
              </div>

              <div className="bg-blue-50 rounded-xl p-4">
                <p className="font-bold">Upcoming</p>
                <p className="text-3xl font-bold text-[#061B33]">{upcomingTrips.length}</p>
              </div>
            </div>
          </div>
        )}

        <section className="mt-6">
          <h2 className="text-2xl font-bold text-[#061B33]">
            Upcoming Trips
          </h2>

          {upcomingTrips.length === 0 && (
            <p className="text-gray-500 mt-4">No upcoming trips.</p>
          )}

          {upcomingTrips.map((trip) => (
            <div key={trip.id} className="bg-white rounded-xl shadow p-5 mt-4">
              <p><strong>Trip:</strong> {trip.trip_code}</p>
              <p><strong>Date:</strong> {trip.trip_date}</p>
              <p><strong>Area:</strong> {trip.area}</p>
              <p><strong>Pickup:</strong> {trip.pickup_time}</p>
              <p><strong>Drop-off:</strong> {trip.dropoff_time}</p>
              <p><strong>Vehicle:</strong> {trip.vehicle_name}</p>
              <p><strong>Plate:</strong> {trip.vehicle_registration}</p>
              <p><strong>Passengers:</strong> {trip.passenger_count}</p>
              <p><strong>Status:</strong> {trip.status}</p>

              <div className="bg-gray-50 rounded-xl p-4 mt-5">
                <h3 className="font-bold text-lg mb-3">
                  Trip Progress
                </h3>

                <div className="mb-5">
                  {(() => {
                    const tripPassengers = passengers.filter((p) => p.trip_id === trip.id);
                    const pickedUp = tripPassengers.filter((p) => p.pickup_status === "Picked Up").length;
                    const total = tripPassengers.length;
                    const percentage = total > 0 ? Math.round((pickedUp / total) * 100) : 0;

                    return (
                      <div>
                        <p className="font-bold mb-2">
                          {pickedUp} / {total} Picked Up ({percentage}%)
                        </p>

                        <div className="w-full bg-gray-200 rounded-full h-4">
                          <div
                            className="bg-green-600 h-4 rounded-full"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })()}
                </div>

                <h3 className="font-bold text-lg mb-3">
                  Passenger Manifest
                </h3>

                {passengers.filter((p) => p.trip_id === trip.id).length === 0 && (
                  <p className="text-gray-500">No passengers linked to this trip.</p>
                )}

                {passengers
                  .filter((p) => p.trip_id === trip.id)
                  .map((passenger, index) => (
                    <div key={passenger.id} className="border-b py-3">
                      <p className="font-bold">
                        {index + 1}. {passenger.full_name}
                      </p>
                      <p><strong>Phone:</strong> {passenger.phone}</p>
                      <p><strong>Pickup Area:</strong> {passenger.pickup_area}</p>
                      <p><strong>Pickup Address:</strong> {passenger.pickup_address}</p>
                      <p><strong>Pickup Time:</strong> {passenger.pickup_time}</p>
                      <p><strong>Drop-off Time:</strong> {passenger.dropoff_time}</p>
                      <p><strong>Status:</strong> {passenger.pickup_status}</p>

                      <div className="flex flex-wrap gap-2 mt-3">
                        <button
                          onClick={() => updatePassengerStatus(passenger.id, "Picked Up")}
                          className="bg-green-600 text-white px-3 py-2 rounded-lg font-bold"
                        >
                          ✓ Picked Up
                        </button>

                        <button
                          onClick={() => updatePassengerStatus(passenger.id, "Running Late")}
                          className="bg-orange-500 text-white px-3 py-2 rounded-lg font-bold"
                        >
                          ⏰ Running Late
                        </button>

                        <button
                          onClick={() => updatePassengerStatus(passenger.id, "No Show")}
                          className="bg-red-600 text-white px-3 py-2 rounded-lg font-bold"
                        >
                          ✗ No Show
                        </button>
                      </div>
                    </div>
                  ))}
              </div>

              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => updateTripStatus(trip.id, "In Progress")}
                  className="bg-green-600 text-white px-5 py-3 rounded-lg font-bold"
                >
                  Start Trip
                </button>

                <button
                  onClick={() => updateTripStatus(trip.id, "Completed")}
                  className="bg-orange-500 text-white px-5 py-3 rounded-lg font-bold"
                >
                  Complete Trip
                </button>

                <button className="bg-red-600 text-white px-5 py-3 rounded-lg font-bold">
                  Emergency
                </button>
              </div>
            </div>
          ))}
        </section>

        <section className="mt-10">
          <h2 className="text-2xl font-bold text-[#061B33]">
            Completed Trips
          </h2>

          {completedTrips.length === 0 && (
            <p className="text-gray-500 mt-4">No completed trips yet.</p>
          )}

          {completedTrips.map((trip) => (
            <div key={trip.id} className="bg-white rounded-xl shadow p-5 mt-4 opacity-80">
              <p><strong>Trip:</strong> {trip.trip_code}</p>
              <p><strong>Date:</strong> {trip.trip_date}</p>
              <p><strong>Area:</strong> {trip.area}</p>
              <p><strong>Pickup:</strong> {trip.pickup_time}</p>
              <p><strong>Drop-off:</strong> {trip.dropoff_time}</p>
              <p><strong>Status:</strong> Completed</p>
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}
