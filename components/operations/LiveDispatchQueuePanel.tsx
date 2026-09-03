"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

type DispatchTrip = {
  id: string;
  trip_code: string | null;
  trip_date: string | null;
  pickup_time: string | null;
  area: string | null;
  driver_name: string | null;
  vehicle_name: string | null;
  passenger_count: number | null;
  status: string | null;
};

export default function LiveDispatchQueuePanel() {
const [trips, setTrips] = useState<DispatchTrip[]>([]);
const [loading, setLoading] = useState(true);
const [selectedFilter, setSelectedFilter] = useState("All");
const router = useRouter();
const loadTrips = useCallback(async () => {
  setLoading(true);

  const { data } = await supabase
    .from("trips")
    .select(`
      id,
      trip_code,
      trip_date,
      pickup_time,
      area,
      driver_name,
      vehicle_name,
      passenger_count,
      status
    `)
    .order("trip_date", { ascending: true })
    .order("pickup_time", { ascending: true });

  setTrips(data ?? []);
  setLoading(false);
}, []);

useEffect(() => {
  // eslint-disable-next-line react-hooks/set-state-in-effect
  loadTrips();

  const channel = supabase
    .channel("operations-live-dispatch")
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "trips",
      },
      () => {
        loadTrips();
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}, [loadTrips]);
const filteredTrips = useMemo(() => {
  switch (selectedFilter) {
    case "Assigned":
      return trips.filter((t) => t.status === "Assigned");

    case "In Progress":
      return trips.filter((t) => t.status === "In Progress");

    case "Completed":
      return trips.filter((t) => t.status === "Completed");

    case "Delayed":
      return trips.filter((t) => t.status === "Delayed");

    case "Cancelled":
      return trips.filter((t) => t.status === "Cancelled");

    case "Active":
      return trips.filter((t) =>
        ["Assigned", "In Progress", "Scheduled"].includes(t.status ?? "")
      );

    default:
      return trips;
  }
}, [trips, selectedFilter]);
function statusBadge(status: string | null) {
  switch (status) {
    case "In Progress":
      return "bg-green-100 text-green-700";

    case "Assigned":
      return "bg-blue-100 text-blue-700";

    case "Scheduled":
      return "bg-orange-100 text-orange-700";

    case "Completed":
      return "bg-emerald-100 text-emerald-700";

    case "Cancelled":
      return "bg-gray-200 text-gray-700";

    case "Delayed":
      return "bg-red-100 text-red-700";

    default:
      return "bg-gray-100 text-gray-600";
  }
}

function getDelay(pickupTime: string | null) {
  if (!pickupTime) return "-";

  const now = new Date();

  const [hour, minute] = pickupTime.split(":").map(Number);

  const pickup = new Date();

  pickup.setHours(hour);
  pickup.setMinutes(minute);
  pickup.setSeconds(0);

  const diff = Math.floor(
    (now.getTime() - pickup.getTime()) / 60000
  );

  if (diff <= 0) return "On Time";

  return `${diff} min`;
}

function riskLevel(trip: DispatchTrip) {
  if (!trip.driver_name) return "High";

  if (!trip.vehicle_name) return "Medium";

  if (trip.status === "Delayed") return "High";

  return "Low";
}
function getPrimaryAction(status: string | null) {
  switch (status) {
    case "Scheduled":
      return "Dispatch";

    case "Assigned":
      return "View Driver";

    case "In Progress":
      return "Live Map";

    case "Delayed":
      return "Escalate";

    case "Completed":
      return "Playback";

    default:
      return "Open";
  }
}
function handlePrimaryAction(trip: DispatchTrip) {
  switch (trip.status) {
    case "In Progress":
      router.push(`/live-map?trip=${trip.id}`);
      break;

    case "Completed":
      router.push(`/route-playback?trip=${trip.id}`);
      break;

    case "Assigned":
      router.push(`/driver-fleet?trip=${trip.id}`);
      break;

    case "Delayed":
      router.push(`/emergency-dashboard?trip=${trip.id}`);
      break;

    case "Scheduled":
      router.push(`/trips/${trip.id}`);
      break;

    default:
      router.push(`/trips/${trip.id}`);
      break;
  }
}
  return (
    <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#061B33]">
            Live Dispatch Queue
          </h2>
          <p className="text-sm text-gray-500">
            Current transport operations
          </p>
        </div>

        <button
          onClick={() => loadTrips()}
          className="rounded-lg bg-[#061B33] px-4 py-2 text-sm font-semibold text-white"
        >
          Refresh
        </button>
      </div>
<div className="mb-5 flex flex-wrap gap-2">
  {[
    "All",
    "Active",
    "Assigned",
    "In Progress",
    "Completed",
    "Delayed",
    "Cancelled",
  ].map((filter) => (
    <button
      key={filter}
      onClick={() => setSelectedFilter(filter)}
      className={`rounded-lg px-4 py-2 text-sm font-semibold ${
        selectedFilter === filter
          ? "bg-[#061B33] text-white"
          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
      }`}
    >
      {filter}
    </button>
  ))}
</div>
      {loading ? (
        <p className="py-8 text-center text-gray-500">
          Loading trips...
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="border-b bg-gray-50">
<tr>
  <th className="px-3 py-3 text-left">Trip</th>
  <th className="px-3 py-3 text-left">Driver</th>
  <th className="px-3 py-3 text-left">Vehicle</th>
  <th className="px-3 py-3 text-left">Area</th>
  <th className="px-3 py-3 text-left">Passengers</th>
  <th className="px-3 py-3 text-left">Pickup</th>
  <th className="px-3 py-3 text-left">Status</th>
  <th className="px-3 py-3 text-left">Delay</th>
  <th className="px-3 py-3 text-left">Risk</th>
<th className="px-3 py-3 text-left">
  Actions
</th>
</tr>
            </thead>

            <tbody>
{filteredTrips.map((trip) => (
                <tr
                  key={trip.id}
                  className="border-b hover:bg-gray-50"
                >
                  <td className="px-3 py-3 font-semibold">
                    {trip.trip_code}
                  </td>

                  <td className="px-3 py-3">
                    {trip.driver_name ?? "-"}
                  </td>

                  <td className="px-3 py-3">
                    {trip.vehicle_name ?? "-"}
                  </td>

                  <td className="px-3 py-3">
                    {trip.area ?? "-"}
                  </td>

                  <td className="px-3 py-3">
                    {trip.passenger_count ?? 0}
                  </td>

                  <td className="px-3 py-3">
                    {trip.pickup_time ?? "-"}
                  </td>

<td className="px-3 py-3">
  <span
    className={`rounded-full px-3 py-1 text-xs font-bold ${statusBadge(
      trip.status
    )}`}
  >
    {trip.status ?? "-"}
  </span>
</td>
<td className="px-3 py-3">
  {getDelay(trip.pickup_time)}
</td>

<td className="px-3 py-3">
  {riskLevel(trip)}
</td>





                  <td className="px-3 py-3">
                    <div className="flex gap-2">
                      <Link
                        href={`/trips/${trip.id}`}
                        className="rounded bg-blue-600 px-3 py-2 text-white text-sm"
                      >
                        Open
                      </Link>

<button
  onClick={() => handlePrimaryAction(trip)}
  className="rounded bg-gray-100 px-3 py-2 text-sm font-semibold text-[#061B33] hover:bg-gray-200"
>
  {getPrimaryAction(trip.status)}
</button>
                    </div>
                  </td>
</tr>
))}
</tbody>
</table>

{filteredTrips.length === 0 && (
  <div className="py-10 text-center text-gray-500">
    No trips available.
  </div>
)}

</div>
)}
    </div>
  );
}