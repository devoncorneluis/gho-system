"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { TRIP_STATUS } from "../../lib/tripStatus";
import AdminLayout from "../../components/AdminLayout";

const PLATFORM_ID = "713c411b-847e-4379-8e38-c142e06ff5fd";

type Trip = {
  id: string;
  status: string | null;
};

type Passenger = {
  id: string;
  pickup_status: string | null;
};

export default function ReportsPage() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [passengers, setPassengers] = useState<Passenger[]>([]);

  async function loadTrips() {
    const { data, error } = await supabase
      .from("trips")
      .select("id, status")
      .eq("platform_id", PLATFORM_ID);

    if (error) {
      alert(error.message);
      return;
    }

    setTrips(data || []);

    const { data: passengerData, error: passengerError } = await supabase
      .from("trip_passengers")
      .select("id, pickup_status")
      .eq("platform_id", PLATFORM_ID);

    if (passengerError) {
      alert(passengerError.message);
      return;
    }

    setPassengers(passengerData || []);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadTrips();
  }, []);

  const totalTrips = trips.length;
  const assignedTrips = trips.filter(
    (trip) => trip.status === TRIP_STATUS.ASSIGNED
  ).length;
  const completedTrips = trips.filter(
    (trip) => trip.status === TRIP_STATUS.COMPLETED
  ).length;
  const suggestedTrips = trips.filter((trip) => trip.status === "Suggested").length;

  const waitingPassengers = passengers.filter((p) => !p.pickup_status || p.pickup_status === "Waiting").length;
  const pickedUpPassengers = passengers.filter((p) => p.pickup_status === "Picked Up").length;
  const latePassengers = passengers.filter((p) => p.pickup_status === "Running Late").length;
  const noShowPassengers = passengers.filter((p) => p.pickup_status === "No Show").length;

  return (
    <AdminLayout>
      <main className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-4xl font-bold text-[#061B33]">Reports</h1>

      <p className="text-gray-600 mt-2">
        View transport performance and trip summaries.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
        <div className="bg-white rounded-xl shadow p-6">
          <p className="font-bold">Total Trips</p>
          <p className="text-4xl text-orange-500 font-bold">{totalTrips}</p>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <p className="font-bold">Assigned Trips</p>
          <p className="text-4xl text-orange-500 font-bold">{assignedTrips}</p>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <p className="font-bold">Completed Trips</p>
          <p className="text-4xl text-orange-500 font-bold">{completedTrips}</p>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <p className="font-bold">Suggested Trips</p>
          <p className="text-4xl text-orange-500 font-bold">{suggestedTrips}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
        <div className="bg-white rounded-xl shadow p-6">
          <p className="font-bold">🟡 Waiting</p>
          <p className="text-4xl text-yellow-600 font-bold">{waitingPassengers}</p>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <p className="font-bold">🟢 Picked Up</p>
          <p className="text-4xl text-green-600 font-bold">{pickedUpPassengers}</p>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <p className="font-bold">🟠 Running Late</p>
          <p className="text-4xl text-orange-500 font-bold">{latePassengers}</p>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <p className="font-bold">🔴 No Show</p>
          <p className="text-4xl text-red-600 font-bold">{noShowPassengers}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="font-bold text-xl">Daily Report</h2>
          <p className="text-gray-600 mt-2">Trips completed today.</p>
          <button className="mt-4 bg-orange-500 text-white px-4 py-2 rounded-lg font-bold">
            Export PDF
          </button>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="font-bold text-xl">Driver Report</h2>
          <p className="text-gray-600 mt-2">Driver trips and performance.</p>
          <button className="mt-4 bg-orange-500 text-white px-4 py-2 rounded-lg font-bold">
            Export Excel
          </button>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="font-bold text-xl">Vehicle Report</h2>
          <p className="text-gray-600 mt-2">Vehicle usage and availability.</p>
          <button className="mt-4 bg-orange-500 text-white px-4 py-2 rounded-lg font-bold">
            Export CSV
          </button>
        </div>
      </div>
      </main>
    </AdminLayout>
  );
}
