"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import AdminLayout from "../../components/AdminLayout";
import { TRIP_STATUS } from "../../lib/tripStatus";

const PLATFORM_ID = "713c411b-847e-4379-8e38-c142e06ff5fd";

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

export default function TripHistoryPage() {
  const [trips, setTrips] = useState<Trip[]>([]);

  async function loadCompletedTrips() {
    const { data, error } = await supabase
      .from("trips")
      .select("*")
      .eq("platform_id", PLATFORM_ID)
      .eq("status", TRIP_STATUS.COMPLETED)
      .order("created_at", { ascending: false });

    if (error) {
      alert(error.message);
      return;
    }

    setTrips(data || []);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadCompletedTrips();
  }, []);

  return (
    <AdminLayout>
      <main className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-4xl font-bold text-[#061B33]">Trip History</h1>

      <p className="text-gray-600 mt-2">
        View completed transport trips.
      </p>

      <div className="bg-white rounded-xl shadow p-6 mt-6 overflow-x-auto">
        <div className="grid grid-cols-9 font-bold border-b pb-2 min-w-[1000px]">
          <p>Trip</p>
          <p>Date</p>
          <p>Shift</p>
          <p>Area</p>
          <p>Pickup</p>
          <p>Drop-off</p>
          <p>Vehicle</p>
          <p>Passengers</p>
          <p>Driver</p>
        </div>

        {trips.map((trip) => (
          <div key={trip.id} className="grid grid-cols-9 py-3 border-b min-w-[1000px]">
            <p>{trip.trip_code}</p>
            <p>{trip.trip_date}</p>
            <p>{trip.shift}</p>
            <p>{trip.area}</p>
            <p>{trip.pickup_time}</p>
            <p>{trip.dropoff_time}</p>
            <p>{trip.vehicle_type}</p>
            <p>{trip.passenger_count}</p>
            <p>{trip.driver_name}</p>
          </div>
        ))}

        {trips.length === 0 && (
          <p className="text-gray-500 mt-4">
            No completed trips yet.
          </p>
        )}
      </div>
      </main>
    </AdminLayout>
  );
}
