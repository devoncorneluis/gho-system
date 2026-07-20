"use client";

import { useEffect, useState } from "react";
import AdminLayout from "../../components/AdminLayout";
import { supabase } from "../../lib/supabase";

type Trip = {
  id: string;
  trip_code: string | null;
  driver_name: string | null;
  vehicle_name: string | null;
  status: string | null;
  passenger_count: number | null;
  driver_response: string | null;
};

export default function DispatchCommandPage() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [search, setSearch] = useState("");
const [statusFilter, setStatusFilter] = useState("all");
const [alerts, setAlerts] = useState<string[]>([]);

async function dispatchTrip(tripId: string) {
  const { error } = await supabase
    .from("trips")
.update({
  status: "dispatched",
  dispatched_at: new Date().toISOString(),
})
    .eq("id", tripId);

  if (error) {
    alert(error.message);
    return;
  }

  await loadTrips();
}

async function loadTrips() {
  const { data, error } = await supabase
    .from("trips")
    .select(`
      id,
      trip_code,
      driver_name,
      vehicle_name,
      status,
      passenger_count,
      driver_response
    `)
    .order("trip_date", { ascending: true });

  if (error) {
    alert(error.message);
    return;
  }

  setTrips(data ?? []);
}

useEffect(() => {
  loadTrips();
}, []);

function buildAlerts() {
  const list: string[] = [];

  trips.forEach((trip) => {
    if (trip.driver_response === "rejected") {
      list.push(`${trip.trip_code}: Driver rejected dispatch`);
    }

    if (!trip.driver_response) {
      list.push(`${trip.trip_code}: Awaiting driver response`);
    }

    if (!trip.driver_name) {
      list.push(`${trip.trip_code}: No driver assigned`);
    }

    if (!trip.vehicle_name) {
      list.push(`${trip.trip_code}: No vehicle assigned`);
    }

    if ((trip.passenger_count ?? 0) === 0) {
      list.push(`${trip.trip_code}: No passengers assigned`);
    }
  });
  setAlerts(list);
}
useEffect(() => {
  loadTrips();

  const interval = setInterval(() => {
    loadTrips();
  }, 10000);

  return () => clearInterval(interval);
}, []);

useEffect(() => {
  buildAlerts();
}, [trips]);

  return (
    <AdminLayout>
      <main className="min-h-screen bg-gray-100 p-6">
        <h1 className="text-4xl font-black text-[#061B33]">
          🚦 Dispatch Command Centre
        </h1>

        <p className="mt-2 text-gray-600">
          Monitor and control all live transport operations.
        </p>
<p className="mt-2 text-sm text-green-600 font-semibold">
  🟢 Auto Refresh: Every 10 seconds
</p>
<div className="mt-6 mb-4">
  <input
    type="text"
    placeholder="🔍 Search Trip, Driver or Vehicle..."
    value={search}
    onChange={(e) => setSearch(e.target.value)}
    className="w-full rounded-lg border p-3"
  />
  <div className="mt-3 mb-6">
  <select
    value={statusFilter}
    onChange={(e) => setStatusFilter(e.target.value)}
    className="rounded-lg border p-3"
  >
    <option value="all">All Trips</option>
    <option value="assigned">Assigned</option>
    <option value="dispatched">Dispatched</option>
    <option value="accepted">Accepted</option>
    <option value="en_route">En Route</option>
    <option value="completed">Completed</option>
  </select>
</div>
</div>
{alerts.length > 0 && (
  <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-5">
    <h2 className="mb-3 text-xl font-bold text-red-700">
      🚨 Operations Alerts
    </h2>

    <ul className="space-y-2">
      {alerts.map((alert, index) => (
        <li key={index} className="text-red-700">
          • {alert}
        </li>
      ))}
    </ul>
  </div>
)}
        <div className="mt-8 rounded-xl bg-white p-6 shadow">
          <h2 className="mb-4 text-2xl font-bold">
            🚐 Live Dispatch Queue
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b">
                <tr>
                  <th className="py-3 text-left">Trip</th>
                  <th className="text-left">Driver</th>
                  <th className="text-left">Vehicle</th>
                  <th className="text-left">Passengers</th>
                  <th className="text-left">Status</th>
                  <th className="text-left">Response</th>
                  <th className="text-left">Actions</th>
                </tr>
              </thead>

              <tbody>
{trips
.filter((trip) => {
  const q = search.toLowerCase();

  const matchesSearch =
    (trip.trip_code ?? "").toLowerCase().includes(q) ||
    (trip.driver_name ?? "").toLowerCase().includes(q) ||
    (trip.vehicle_name ?? "").toLowerCase().includes(q);

  const matchesStatus =
    statusFilter === "all" || trip.status === statusFilter;

  return matchesSearch && matchesStatus;
})
.map((trip) => (
                  <tr key={trip.id} className="border-b">
                    <td className="py-3">{trip.trip_code}</td>
                    <td>{trip.driver_name ?? "-"}</td>
                    <td>{trip.vehicle_name ?? "-"}</td>
                    <td>{trip.passenger_count ?? 0}</td>

                    <td>
                      <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-bold">
                        {trip.status ?? "-"}
                      </span>
                    </td>

                    <td>
                      {trip.driver_response === "accepted" ? (
                        <span className="font-bold text-green-600">
                          ✅ Accepted
                        </span>
                      ) : trip.driver_response === "rejected" ? (
                        <span className="font-bold text-red-600">
                          ❌ Rejected
                        </span>
                      ) : (
                        <span className="font-bold text-orange-600">
                          ⏳ Awaiting
                        </span>
                      )}
                    </td>

                    <td className="space-x-2">
                      <button
                        onClick={() =>
                          (window.location.href = `/trips/${trip.id}`)
                        }
                        className="rounded-lg bg-[#061B33] px-3 py-2 text-sm font-bold text-white hover:bg-orange-500"
                      >
                        👥 Manifest
                      </button>
<button
  disabled={
    trip.status === "started" ||
    trip.status === "completed"
  }
  onClick={() => dispatchTrip(trip.id)}
  className={`rounded-lg px-3 py-2 text-sm font-bold text-white ${
    trip.status === "started" ||
    trip.status === "completed"
      ? "cursor-not-allowed bg-gray-400"
      : "bg-blue-600 hover:bg-blue-700"
  }`}
>
  {trip.status === "started"
    ? "🚐 Started"
    : trip.status === "completed"
    ? "✅ Completed"
    : "📤 Dispatch"}
</button>
                      <button
                        onClick={() =>
                          (window.location.href = `/live-dispatch/${trip.id}`)
                        }
                        className="rounded-lg bg-green-600 px-3 py-2 text-sm font-bold text-white hover:bg-green-700"
                      >
                        📍 Live Map
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </AdminLayout>
  );
}