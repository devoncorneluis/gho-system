"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

const PLATFORM_ID = "713c411b-847e-4379-8e38-c142e06ff5fd";
const DRIVER_NAME = "Devon Marshall Corneluis";

type Trip = {
  id: string;
  trip_code: string;
  trip_date: string | null;
  shift: string | null;
  area: string | null;
  pickup_time: string | null;
  dropoff_time: string | null;
  vehicle_type: string | null;
  passenger_count: number | null;
  driver_name: string | null;
  status: string | null;
};

export default function DriverPage() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [tracking, setTracking] = useState(false);
  const [locationMessage, setLocationMessage] = useState("");

  async function loadTrips() {
    const { data, error } = await supabase
      .from("trips")
      .select("*")
      .eq("platform_id", PLATFORM_ID)
      .order("created_at", { ascending: false });

    if (error) {
      alert(error.message);
      return;
    }

    setTrips(data || []);
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
  }

  async function saveLocation(latitude: number, longitude: number) {
    const { data: existing } = await supabase
      .from("driver_locations")
      .select("id")
      .eq("platform_id", PLATFORM_ID)
      .eq("driver_name", DRIVER_NAME)
      .limit(1)
      .single();

    if (existing?.id) {
      await supabase
        .from("driver_locations")
        .update({
          latitude,
          longitude,
          status: "Online",
          last_updated: new Date().toISOString(),
        })
        .eq("id", existing.id);
    } else {
      await supabase.from("driver_locations").insert({
        platform_id: PLATFORM_ID,
        driver_name: DRIVER_NAME,
        latitude,
        longitude,
        status: "Online",
        last_updated: new Date().toISOString(),
      });
    }
  }

  function startAutoTracking() {
    if (!navigator.geolocation) {
      alert("Location is not supported on this device.");
      return;
    }

    setTracking(true);
    setLocationMessage("Automatic GPS tracking started.");

    navigator.geolocation.watchPosition(
      async (position) => {
        await saveLocation(position.coords.latitude, position.coords.longitude);
        setLocationMessage("Location updated automatically.");
      },
      () => {
        alert("Location permission was denied.");
        setTracking(false);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 5000,
        timeout: 10000,
      }
    );
  }

  function sendEmergencyAlert() {
    if (!navigator.geolocation) {
      alert("Location is not supported on this device.");
      return;
    }

    const confirmAlert = confirm("Send emergency alert to admin?");

    if (!confirmAlert) return;

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { error } = await supabase.from("emergency_alerts").insert({
          platform_id: PLATFORM_ID,
          driver_name: DRIVER_NAME,
          alert_type: "Panic Alert",
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          status: "Open",
        });

        if (error) {
          alert(error.message);
          return;
        }

        alert("Emergency alert sent to admin.");
      },
      () => {
        alert("Location permission was denied.");
      }
    );
  }

  useEffect(() => {
    loadTrips();
  }, []);

  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-4xl font-bold text-[#061B33]">
        Driver Dashboard
      </h1>

      <p className="text-gray-600 mt-2">
        View assigned trips, update trip status, share GPS, and send emergency alerts.
      </p>

      <button
        onClick={startAutoTracking}
        disabled={tracking}
        className="mt-6 bg-[#061B33] text-white px-6 py-3 rounded-lg font-bold disabled:bg-gray-400"
      >
        {tracking ? "📍 GPS Tracking Active" : "📍 Start GPS Tracking"}
      </button>

      {locationMessage && (
        <p className="mt-3 text-green-700 font-bold">{locationMessage}</p>
      )}

      <div className="bg-white rounded-xl shadow p-6 mt-6">
        <h2 className="text-xl font-bold">Assigned Trips</h2>

        {trips.length === 0 && (
          <p className="text-gray-500 mt-4">
            No trips assigned yet.
          </p>
        )}

        {trips.map((trip) => (
          <div key={trip.id} className="border rounded-xl p-4 mt-4">
            <p><strong>Trip:</strong> {trip.trip_code}</p>
            <p><strong>Date:</strong> {trip.trip_date}</p>
            <p><strong>Shift:</strong> {trip.shift}</p>
            <p><strong>Area:</strong> {trip.area}</p>
            <p><strong>Pickup Time:</strong> {trip.pickup_time}</p>
            <p><strong>Drop-off Time:</strong> {trip.dropoff_time}</p>
            <p><strong>Vehicle:</strong> {trip.vehicle_type}</p>
            <p><strong>Passengers:</strong> {trip.passenger_count}</p>
            <p><strong>Status:</strong> {trip.status}</p>

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

              <button
                onClick={sendEmergencyAlert}
                className="bg-red-600 text-white px-5 py-3 rounded-lg font-bold"
              >
                🚨 Emergency
              </button>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
