"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
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

async function dispatchTrip(tripId: string) {
  const { error } = await supabase
    .from("trips")
.update({
status: "Dispatched",
  dispatched_at: new Date().toISOString(),
})
    .eq("id", tripId);

  if (error) {
    alert(error.message);
    return;
  }

  await loadTrips();
}
async function cancelTrip(id: string) {
  const confirmed = window.confirm(
    "Cancel this trip?"
  );

  if (!confirmed) return;

  const { error } = await supabase
    .from("trips")
    .update({
      status: "Cancelled",
    })
    .eq("id", id);

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

const alerts = useMemo(() => {
  const list: string[] = [];

  trips.forEach((trip) => {
    const tripLabel = trip.trip_code ?? "Uncoded Trip";

    if (trip.driver_response === "rejected") {
      list.push(`${tripLabel}: Driver rejected dispatch`);
    }

    if (!trip.driver_response) {
      list.push(`${tripLabel}: Awaiting driver response`);
    }

    if (!trip.driver_name) {
      list.push(`${tripLabel}: No driver assigned`);
    }

    if (!trip.vehicle_name) {
      list.push(`${tripLabel}: No vehicle assigned`);
    }

    if ((trip.passenger_count ?? 0) === 0) {
      list.push(`${tripLabel}: No passengers assigned`);
    }
  });

  return list;
}, [trips]);
// Auto refresh every 10 seconds
useEffect(() => {
  const interval = setInterval(() => {
    loadTrips();
  }, 10000);

  return () => clearInterval(interval);
}, []);

// Dashboard summary cards
const activeTrips = trips.filter(
  (t) =>
    t.status === "Dispatched" ||
    t.status === "Accepted" ||
    t.status === "In Progress"
).length;

const awaitingDrivers = trips.filter(
  (t) => !t.driver_response
).length;

const rejectedTrips = trips.filter(
  (t) => t.driver_response === "rejected"
).length;

const completedTrips = trips.filter(
  (t) => t.status === "Completed"
).length;
const filteredTrips = trips.filter((trip) => {
  const matchesSearch =
    search === "" ||
    trip.trip_code?.toLowerCase().includes(search.toLowerCase()) ||
    trip.driver_name?.toLowerCase().includes(search.toLowerCase()) ||
    trip.vehicle_name?.toLowerCase().includes(search.toLowerCase());

  const matchesStatus =
    statusFilter === "all" ||
    trip.status === statusFilter;

  return matchesSearch && matchesStatus;
});
  return (
    <AdminLayout>
      <main className="min-h-screen bg-gray-100 p-6">
        <h1 className="text-4xl font-black text-[#061B33]">
          🚦 Dispatch Command Centre
        </h1>

        <p className="mt-2 text-gray-600">
          Monitor and control all live transport operations.
        </p>

        {alerts.length > 0 && (
          <div className="mt-5 rounded-xl border border-orange-200 bg-orange-50 p-4">
            <h2 className="text-sm font-bold uppercase tracking-wide text-orange-700">
              Dispatch Alerts
            </h2>
            <div className="mt-2 space-y-1 text-sm text-orange-900">
              {alerts.slice(0, 8).map((alertText, index) => (
                <p key={`${alertText}-${index}`}>• {alertText}</p>
              ))}
            </div>
          </div>
        )}

        <div className="mt-6 grid gap-4 md:grid-cols-4">
          <div className="rounded-xl bg-white p-5 shadow">
            <p className="text-sm text-gray-500">🚐 Active Trips</p>
            <p className="text-3xl font-black">{activeTrips}</p>
          </div>

          <div className="rounded-xl bg-white p-5 shadow">
            <p className="text-sm text-gray-500">⏳ Awaiting Driver</p>
            <p className="text-3xl font-black text-orange-600">
              {awaitingDrivers}
            </p>
          </div>

          <div className="rounded-xl bg-white p-5 shadow">
            <p className="text-sm text-gray-500">❌ Rejected</p>
            <p className="text-3xl font-black text-red-600">
              {rejectedTrips}
            </p>
          </div>

          <div className="rounded-xl bg-white p-5 shadow">
            <p className="text-sm text-gray-500">✅ Completed</p>
            <p className="text-3xl font-black text-green-600">
              {completedTrips}
            </p>
          </div>
        </div>
<div className="mt-6 rounded-xl bg-white shadow">
  <div className="border-b p-5">
    <h2 className="text-2xl font-bold text-[#061B33]">
      🚦 Live Dispatch Queue
    </h2>
  </div>

  <div className="overflow-x-auto">
    <table className="min-w-full">
      <thead className="bg-gray-100">
        <tr>
          <th className="p-3 text-left">Trip</th>
          <th className="p-3 text-left">Driver</th>
          <th className="p-3 text-left">Vehicle</th>
          <th className="p-3 text-left">Passengers</th>
          <th className="p-3 text-left">Status</th>
          <th className="p-3 text-left">Driver Response</th>
          <th className="p-3 text-center">Action</th>
        </tr>
      </thead>

      <tbody>
        {filteredTrips.map((trip) => (
          <tr
            key={trip.id}
            className="border-t hover:bg-gray-50"
          >
            <td className="p-3 font-semibold">
              {trip.trip_code ?? "-"}
            </td>

            <td className="p-3">
              {trip.driver_name ?? (
                <span className="text-red-500">
                  Not Assigned
                </span>
              )}
            </td>

            <td className="p-3">
              {trip.vehicle_name ?? (
                <span className="text-red-500">
                  Not Assigned
                </span>
              )}
            </td>

            <td className="p-3">
              {trip.passenger_count ?? 0}
            </td>

<td className="p-3">
  <span
    className={`rounded-full px-3 py-1 text-sm font-semibold text-white
      ${
        trip.status === "Assigned"
          ? "bg-gray-500"
          : trip.status === "Dispatched"
          ? "bg-orange-500"
          : trip.status === "Accepted"
          ? "bg-blue-600"
          : trip.status === "In Progress"
          ? "bg-indigo-600"
          : trip.status === "Completed"
          ? "bg-green-600"
          : "bg-red-500"
      }`}
  >
    {trip.status ?? "Unknown"}
  </span>
</td>

            <td className="p-3">
              {trip.driver_response ?? "Awaiting"}
            </td>

            <td className="p-3 text-center">
<td className="p-3">
  <div className="flex flex-wrap justify-center gap-2">
    <button
      onClick={() => dispatchTrip(trip.id)}
      disabled={
        trip.status === "Dispatched" ||
        trip.status === "In Progress" ||
        trip.status === "Completed"
      }
      className="rounded-lg bg-orange-500 px-3 py-2 text-sm font-semibold text-white hover:bg-orange-600 disabled:bg-gray-300"
    >
      Dispatch
    </button>

<Link
  href={`/trips/${trip.id}`}
  className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700"
>
  View
</Link>

<Link
  href={`/trips/${trip.id}`}
  className="rounded-lg bg-green-600 px-3 py-2 text-sm font-semibold text-white hover:bg-green-700"
>
  Manifest
</Link>

<button
  onClick={() => cancelTrip(trip.id)}
  disabled={
    trip.status === "Completed" ||
    trip.status === "Cancelled"
  }
  className="rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:bg-gray-300"
>
  Cancel
</button>
  </div>
</td>
            </td>
          </tr>
        ))}

        {filteredTrips.length === 0 && (
          <tr>
            <td
              colSpan={7}
              className="p-8 text-center text-gray-500"
            >
              No trips found.
            </td>
          </tr>
        )}
      </tbody>
    </table>
  </div>
</div>
<div className="mt-6 rounded-xl bg-white p-6 shadow">
  <div className="flex flex-col gap-4 md:flex-row">
    <input
      type="text"
      placeholder="🔍 Search Trip, Driver or Vehicle..."
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      className="flex-1 rounded-lg border p-3"
    />

    <select
      value={statusFilter}
      onChange={(e) => setStatusFilter(e.target.value)}
      className="rounded-lg border p-3"
    >
      <option value="all">All Trips</option>
      <option value="Assigned">Assigned</option>
      <option value="Dispatched">Dispatched</option>
      <option value="Accepted">Accepted</option>
      <option value="In Progress">In Progress</option>
      <option value="Completed">Completed</option>
    </select>
  </div>
</div>
      </main>
    </AdminLayout>
  );
}