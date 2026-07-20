"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AdminLayout from "../../components/AdminLayout";
import { supabase } from "../../lib/supabase";
import { getUserPlatform } from "../../lib/getUserPlatform";


type Trip = {
  id: string;
  trip_code: string | null;
  trip_date: string |null;
  shift: string | null;
  status: string | null;
  driver_name: string | null;
  vehicle_name: string | null;
  passenger_count: number | null;
  passengers?: string[];
  started_at: string | null;
completed_at: string | null;
};

export default function DispatchBoardPage() {
  const [platformId, setPlatformId] = useState<string | null>(null);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
const [search, setSearch] = useState("");
const [statusFilter, setStatusFilter] = useState("All");
const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
const [showDrawer, setShowDrawer] = useState(false);
const [passengerPreview, setPassengerPreview] = useState<string[]>([]);
  useEffect(() => {
    async function loadPlatform() {
      const userPlatform = await getUserPlatform();

      if (!userPlatform) {
        window.location.href = "/login";
        return;
      }

      setPlatformId(userPlatform.platformId);
    }

    loadPlatform();
  }, []);

  useEffect(() => {
    if (!platformId) return;

    loadTrips();
  }, [platformId]);

  async function loadTrips() {
    setLoading(true);

    const { data, error } = await supabase
      .from("trips")
.select(`
  id,
  trip_code,
  trip_date,
  shift,
  status,
  driver_name,
  vehicle_name,
  passenger_count,
  started_at,
  completed_at
`)
      .eq("platform_id", platformId)
      .order("trip_date", { ascending: false });

    if (error) {
      alert(error.message);
    } else {
      setTrips(data || []);
    }

    setLoading(false);
  }
  async function loadPassengerPreview(tripId: string) {
  const { data } = await supabase
    .from("trip_passengers")
    .select("full_name")
    .eq("trip_id", tripId)
    .order("pickup_order", { ascending: true })
    .limit(5);

  setPassengerPreview(
    (data || []).map((row) => row.full_name)
  );
}
useEffect(() => {
  if (!platformId) return;

  const channel = supabase
    .channel("dispatch-board-trips")
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "trips",
        filter: `platform_id=eq.${platformId}`,
      },
      () => {
        loadTrips();
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}, [platformId]);



const filteredTrips = trips.filter((trip) => {
  const matchesSearch =
    !search ||
    trip.trip_code?.toLowerCase().includes(search.toLowerCase()) ||
    trip.driver_name?.toLowerCase().includes(search.toLowerCase()) ||
    trip.vehicle_name?.toLowerCase().includes(search.toLowerCase());

  const matchesStatus =
    statusFilter === "All" || trip.status === statusFilter;

  return matchesSearch && matchesStatus;
});

const activeTrips = filteredTrips.filter(
  (trip) => trip.status === "Started" || trip.status === "In Progress"
).length;

// const filteredTrips = trips.filter((trip) => {
//   const matchesSearch =
//     !search ||
//     trip.trip_code?.toLowerCase().includes(search.toLowerCase()) ||
//     trip.driver_name?.toLowerCase().includes(search.toLowerCase()) ||
//     trip.vehicle_name?.toLowerCase().includes(search.toLowerCase());

//   const matchesStatus =
//     statusFilter === "All" || trip.status === statusFilter;

//   return matchesSearch && matchesStatus;
// });
  const scheduledTrips = filteredTrips.filter(
    (trip) => trip.status === "Scheduled"
  ).length;
const totalPassengers = filteredTrips.reduce(
  (sum, trip) => sum + (trip.passenger_count ?? 0),
  0
);

const assignedDrivers = filteredTrips.filter(
  (trip) => trip.driver_name
).length;

const assignedVehicles = filteredTrips.filter(
  (trip) => trip.vehicle_name
).length;
  const completedTrips = filteredTrips.filter(

    (trip) => trip.status === "Completed"
  ).length;
function getStatusBadge(status: string | null) {
  switch (status) {
    case "Scheduled":
      return "bg-blue-100 text-blue-700";

    case "Confirmed":
      return "bg-cyan-100 text-cyan-700";

    case "Started":
      return "bg-orange-100 text-orange-700";

    case "In Progress":
      return "bg-amber-100 text-amber-700";

    case "Completed":
      return "bg-green-100 text-green-700";

    case "Cancelled":
      return "bg-red-100 text-red-700";

    default:
      return "bg-gray-100 text-gray-700";
  }
}
  return (

    <AdminLayout>
      <main className="min-h-screen bg-[#F3F6FA] p-6">

        <section className="rounded-3xl bg-[#061B33] text-white p-8 shadow-xl">
          <p className="uppercase tracking-widest text-orange-400 font-bold">
            Corneluis Group Pty Ltd
          </p>

          <h1 className="text-5xl font-black mt-2">
            Dispatch Board
          </h1>

          <p className="text-gray-300 mt-3">
            Live transport operations across your platform.
          </p>
        </section>

        <section className="grid md:grid-cols-3 gap-6 mt-6">

          <div className="bg-white rounded-3xl shadow p-6">
            <p className="text-gray-500">Active Trips</p>
            <h2 className="text-4xl font-black text-orange-500">
              {activeTrips}
            </h2>
          </div>

          <div className="bg-white rounded-3xl shadow p-6">
            <p className="text-gray-500">Scheduled Trips</p>
            <h2 className="text-4xl font-black text-blue-700">
              {scheduledTrips}
            </h2>
          </div>

          <div className="bg-white rounded-3xl shadow p-6">
            <p className="text-gray-500">Completed Trips</p>
            <h2 className="text-4xl font-black text-green-600">
              {completedTrips}
            </h2>
          </div>

        </section>

        <section className="bg-white rounded-3xl shadow mt-8 overflow-hidden">
<section className="bg-white rounded-3xl shadow p-6 mt-8">
  <div className="grid md:grid-cols-3 gap-4">

    <input
      type="text"
      placeholder="Search trip, driver or vehicle..."
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      className="border rounded-xl p-3"
    />

    <select
      value={statusFilter}
      onChange={(e) => setStatusFilter(e.target.value)}
      className="border rounded-xl p-3"
    >
      <option>All</option>
      <option>Scheduled</option>
      <option>Confirmed</option>
      <option>Started</option>
      <option>In Progress</option>
      <option>Completed</option>
      <option>Cancelled</option>
    </select>

    <button
      onClick={loadTrips}
      className="bg-[#061B33] text-white rounded-xl p-3 hover:bg-[#0A2B4A]"
    >
      Refresh
    </button>

  </div>
</section>
<section className="grid md:grid-cols-3 gap-6 mt-6">

  <div className="bg-white rounded-3xl shadow p-6">
    <p className="text-gray-500">Drivers Assigned</p>
    <h2 className="text-4xl font-black text-[#061B33]">
      {assignedDrivers}
    </h2>
  </div>

  <div className="bg-white rounded-3xl shadow p-6">
    <p className="text-gray-500">Vehicles Assigned</p>
    <h2 className="text-4xl font-black text-[#061B33]">
      {assignedVehicles}
    </h2>
  </div>

  <div className="bg-white rounded-3xl shadow p-6">
    <p className="text-gray-500">Passengers Today</p>
    <h2 className="text-4xl font-black text-orange-500">
      {totalPassengers}
    </h2>
  </div>

</section>
          <div className="border-b px-6 py-4">
            <h2 className="text-2xl font-black text-[#061B33]">
              Today's Trips
            </h2>
          </div>

          {loading ? (
            <div className="p-8 text-center">
              Loading trips...
            </div>
          ) : (
            <table className="w-full">

              <thead className="bg-gray-100">
                <tr>
                  <th className="text-left p-4">Trip</th>
                  <th className="text-left p-4">Driver</th>
                  <th className="text-left p-4">Vehicle</th>
                  <th className="text-left p-4">Shift</th>
                  <th className="text-left p-4">Passengers</th>
                  <th className="text-left p-4">Status</th>
<th className="text-left p-4">Operations</th>
                </tr>
              </thead>

              <tbody>

{filteredTrips.map((trip) => (
                  <tr
                    key={trip.id}
                    className="border-t hover:bg-gray-50"
                  >
                    <td className="p-4 font-semibold">
                      {trip.trip_code}
                    </td>

                    <td className="p-4">
                      {trip.driver_name || "-"}
                    </td>

                    <td className="p-4">
                      {trip.vehicle_name || "-"}
                    </td>

                    <td className="p-4">
                      {trip.shift}
                    </td>

                    <td className="p-4">
                      {trip.passenger_count}
                    </td>

<td className="p-4">
  <span
    className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusBadge(
      trip.status
    )}`}
  >
    {trip.status || "Unknown"}
  </span>
</td>

<td className="p-4">
  <div className="flex flex-wrap gap-2">

<button
onClick={async () => {
  setSelectedTrip(trip);
  setShowDrawer(true);

  await loadPassengerPreview(trip.id);
}}
  className="bg-orange-500 text-white px-3 py-2 rounded-lg text-sm hover:bg-orange-600"
>
  Quick View
</button>

    <Link
      href="/live-map"
      className="bg-blue-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-blue-700"
    >
      Live Map
    </Link>

    <Link
      href="/route-playback"
      className="bg-green-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-green-700"
    >
      Playback
    </Link>

    <Link
      href="/driver"
      className="bg-purple-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-purple-700"
    >
      Driver
    </Link>

    <Link
      href="/emergency-dashboard"
      className="bg-red-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-red-700"
    >
      Emergency
    </Link>

  </div>
</td>
                  </tr>
                ))}

              </tbody>

            </table>
          )}

        </section>
{showDrawer && selectedTrip && (
  <>
    {/* Background Overlay */}
    <div
      className="fixed inset-0 bg-black/40 z-40"
      onClick={() => setShowDrawer(false)}
    />

    {/* Drawer */}
    <aside className="fixed top-0 right-0 h-full w-full md:w-[420px] bg-white shadow-2xl z-50 overflow-y-auto">

      <div className="flex justify-between items-center p-6 border-b">
        <h2 className="text-2xl font-black text-[#061B33]">
          Quick View
        </h2>

        <button
          onClick={() => setShowDrawer(false)}
          className="text-2xl"
        >
          ✕
        </button>
      </div>

      <div className="p-6 space-y-6">

        <div>
          <p className="text-gray-500 text-sm">Trip Code</p>
          <p className="font-bold text-lg">
            {selectedTrip.trip_code}
          </p>
        </div>

        <div>
          <p className="text-gray-500 text-sm">Driver</p>
          <p className="font-bold">
            {selectedTrip.driver_name || "-"}
          </p>
        </div>

        <div>
          <p className="text-gray-500 text-sm">Vehicle</p>
          <p className="font-bold">
            {selectedTrip.vehicle_name || "-"}
          </p>
        </div>

        <div>
          <p className="text-gray-500 text-sm">Shift</p>
          <p className="font-bold">
            {selectedTrip.shift}
          </p>
        </div>

        <div>
          <p className="text-gray-500 text-sm">Passengers</p>
          <p className="font-bold">
            {selectedTrip.passenger_count ?? 0}
          </p>
        </div>
<div className="border-t pt-5">
  <h3 className="text-lg font-bold text-[#061B33] mb-3">
    Passenger Preview
  </h3>

  {passengerPreview.length === 0 ? (
    <p className="text-gray-500">
      No passengers assigned.
    </p>
  ) : (
    <ul className="space-y-2">
      {passengerPreview.map((name, index) => (
        <li
          key={index}
          className="bg-gray-50 rounded-lg px-3 py-2"
        >
          {name}
        </li>
      ))}
    </ul>
  )}

  {selectedTrip?.passenger_count &&
    selectedTrip.passenger_count > passengerPreview.length && (
      <p className="text-sm text-orange-600 mt-3">
        + {selectedTrip.passenger_count - passengerPreview.length} more passengers
      </p>
  )}
</div>
<div className="border-t pt-5">
  <h3 className="text-lg font-bold text-[#061B33] mb-4">
    Trip Timeline
  </h3>

  <div className="space-y-3 text-sm">

    <div className="flex items-center gap-3">
      <div className="w-3 h-3 rounded-full bg-green-500"></div>
      <span>Scheduled</span>
    </div>

    <div className="flex items-center gap-3">
      <div className="w-3 h-3 rounded-full bg-green-500"></div>
      <span>Driver Assigned</span>
    </div>

    <div className="flex items-center gap-3">
      <div
        className={`w-3 h-3 rounded-full ${
          selectedTrip.started_at
            ? "bg-orange-500"
            : "bg-gray-300"
        }`}
      ></div>

      <span>
        Started{" "}
        {selectedTrip.started_at &&
          `(${new Date(selectedTrip.started_at).toLocaleTimeString()})`}
      </span>
    </div>

    <div className="flex items-center gap-3">
      <div
        className={`w-3 h-3 rounded-full ${
          selectedTrip.completed_at
            ? "bg-green-600"
            : "bg-gray-300"
        }`}
      ></div>

      <span>
        Completed{" "}
        {selectedTrip.completed_at &&
          `(${new Date(selectedTrip.completed_at).toLocaleTimeString()})`}
      </span>
    </div>

  </div>
</div>
        <div>
          <p className="text-gray-500 text-sm">Status</p>

          <span
            className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusBadge(
              selectedTrip.status
            )}`}
          >
            {selectedTrip.status}
          </span>
        </div>
        <div className="border-t pt-6">

  <h3 className="text-lg font-bold text-[#061B33] mb-4">
    Dispatch Controls
  </h3>

  <div className="grid grid-cols-1 gap-3">

    <button
      className="bg-blue-600 text-white rounded-xl p-3 hover:bg-blue-700"
    >
      Dispatch Trip
    </button>

    <button
      className="bg-orange-500 text-white rounded-xl p-3 hover:bg-orange-600"
    >
      Start Trip
    </button>

    <button
      className="bg-green-600 text-white rounded-xl p-3 hover:bg-green-700"
    >
      Complete Trip
    </button>

    <button
      className="bg-red-600 text-white rounded-xl p-3 hover:bg-red-700"
    >
      Cancel Trip
    </button>

  </div>

</div>
<div className="border-t pt-6">

  <h3 className="text-lg font-bold text-[#061B33] mb-4">
    Operations
  </h3>

  <div className="grid grid-cols-2 gap-3">

    <Link
      href={`/trips/${selectedTrip.id}`}
      className="bg-orange-500 text-white rounded-xl p-3 text-center hover:bg-orange-600"
    >
      View Trip
    </Link>

    <Link
      href="/live-map"
      className="bg-blue-600 text-white rounded-xl p-3 text-center hover:bg-blue-700"
    >
      Live Map
    </Link>

    <Link
      href="/route-playback"
      className="bg-green-600 text-white rounded-xl p-3 text-center hover:bg-green-700"
    >
      Playback
    </Link>

    <Link
      href="/driver"
      className="bg-purple-600 text-white rounded-xl p-3 text-center hover:bg-purple-700"
    >
      Driver
    </Link>

    <Link
      href="/emergency-dashboard"
      className="bg-red-600 text-white rounded-xl p-3 text-center hover:bg-red-700"
    >
      Emergency
    </Link>

    <button
onClick={() => {
  setShowDrawer(false);
  setPassengerPreview([]);
}}
      className="border rounded-xl p-3 hover:bg-gray-100"
    >
      Close
    </button>

  </div>

</div>
      </div>

    </aside>
  </>
)}
      </main>
    </AdminLayout>
  );
}