"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";


const PLATFORM_ID = "5ab161d1-690f-4d2f-977c-f4e6ee23be06";

type Trip = {
  id: string;
  trip_code: string;
  trip_date: string | null;
  shift: string | null;
  area: string | null;
  pickup_time: string | null;
  dropoff_time: string | null;
  vehicle_type: string | null;
  driver_name: string | null;
  status: string | null;
};
export default function AgentPage() {
  const [trips, setTrips] = useState<Trip[]>([]);

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

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadTrips();
  }, []);

  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-4xl font-bold text-[#061B33]">
        Agent Dashboard
      </h1>
      <div className="mt-6 flex gap-3">
  <button
    className="bg-[#061B33] text-white px-5 py-3 rounded-xl font-bold"
  >
    Import CSV
  </button>

  <button
    className="bg-orange-500 text-white px-5 py-3 rounded-xl font-bold"
  >
    Export CSV
  </button>
</div>

      <p className="text-gray-600 mt-2">
        View transport pickup, driver, vehicle, and trip status.
      </p>

      <div className="bg-white rounded-xl shadow p-6 mt-6">
        <h2 className="text-xl font-bold">My Transport</h2>

        {trips.length === 0 && (
          <p className="text-gray-500 mt-4">
            No transport trips available yet.
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
            <p><strong>Driver:</strong> {trip.driver_name}</p>
            <p><strong>Vehicle:</strong> {trip.vehicle_type}</p>
            <p><strong>Status:</strong> {trip.status}</p>

            <div className="flex gap-3 mt-4">
              <button className="bg-orange-500 text-white px-5 py-3 rounded-lg font-bold">
                Track Driver
              </button>

              <button className="bg-red-600 text-white px-5 py-3 rounded-lg font-bold">
                Emergency
              </button>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
