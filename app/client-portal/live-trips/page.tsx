"use client";

import { useEffect, useMemo, useState } from "react";
import AdminLayout from "../../../components/AdminLayout";
import { supabase } from "../../../lib/supabase";
import { getUserPlatform } from "../../../lib/getUserPlatform";

type Trip = {
  id: string;
  trip_code: string | null;
  trip_date: string | null;
  driver_name: string | null;
  vehicle_name: string | null;
  passenger_count: number | null;
  area: string | null;
  status: string | null;
};

export default function ClientLiveTripsPage() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  useEffect(() => {
    async function loadTrips() {
      const userPlatform = await getUserPlatform();

      if (!userPlatform) return;

      const { data } = await supabase
        .from("trips")
        .select(`
          id,
          trip_code,
          trip_date,
          driver_name,
          vehicle_name,
          passenger_count,
          area,
          status
        `)
        .eq("platform_id", userPlatform.platformId)
        .order("trip_date", { ascending: false });

      setTrips(data ?? []);
    }

    loadTrips();
  }, []);

  const filteredTrips = useMemo(() => {
    return trips.filter((trip) => {
      const matchesSearch =
        !search ||
        trip.trip_code?.toLowerCase().includes(search.toLowerCase()) ||
        trip.driver_name?.toLowerCase().includes(search.toLowerCase()) ||
        trip.vehicle_name?.toLowerCase().includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === "All" ||
        trip.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [trips, search, statusFilter]);

  return (
    <AdminLayout>
      <main className="min-h-screen bg-gray-100 p-6">

        <div className="rounded-3xl bg-white p-8 shadow">

          <p className="text-sm font-bold uppercase text-orange-500">
            Client Portal
          </p>

          <h1 className="mt-2 text-4xl font-black text-[#061B33]">
            Live Trips
          </h1>

          <p className="mt-2 text-gray-600">
            View your transport operations in real time.
          </p>

        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2">

          <input
            className="rounded-xl border p-3"
            placeholder="Search trip, driver or vehicle..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select
            className="rounded-xl border p-3"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option>All</option>
            <option>Scheduled</option>
            <option>Assigned</option>
            <option>In Progress</option>
            <option>Completed</option>
            <option>Cancelled</option>
          </select>

        </div>

        <div className="mt-8 overflow-hidden rounded-2xl bg-white shadow">

          <table className="w-full">

            <thead className="bg-gray-100">

              <tr>

                <th className="p-4 text-left">Trip</th>
                <th className="p-4 text-left">Date</th>
                <th className="p-4 text-left">Driver</th>
                <th className="p-4 text-left">Vehicle</th>
                <th className="p-4 text-left">Passengers</th>
                <th className="p-4 text-left">Area</th>
                <th className="p-4 text-left">Status</th>

              </tr>

            </thead>

            <tbody>

              {filteredTrips.map((trip) => (

                <tr
                  key={trip.id}
                  className="border-t"
                >

                  <td className="p-4 font-semibold">
                    {trip.trip_code}
                  </td>

                  <td className="p-4">
                    {trip.trip_date}
                  </td>

                  <td className="p-4">
                    {trip.driver_name ?? "-"}
                  </td>

                  <td className="p-4">
                    {trip.vehicle_name ?? "-"}
                  </td>

                  <td className="p-4">
                    {trip.passenger_count ?? 0}
                  </td>

                  <td className="p-4">
                    {trip.area ?? "-"}
                  </td>

                  <td className="p-4">

                    <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-700">
                      {trip.status}
                    </span>

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      </main>
    </AdminLayout>
  );
}