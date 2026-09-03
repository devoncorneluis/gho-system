"use client";

import { useEffect, useState } from "react";
import AdminLayout from "../../../components/AdminLayout";
import { supabase } from "../../../lib/supabase";
import { getUserPlatform } from "../../../lib/getUserPlatform";

type DriverLocation = {
  id: string;
  driver_name: string | null;
  vehicle_name: string | null;
  trip_code: string | null;
  latitude: number | null;
  longitude: number | null;
  last_update: string | null;
  status: string | null;
};

export default function ClientLiveTrackingPage() {
  const [drivers, setDrivers] = useState<DriverLocation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDrivers() {
      const userPlatform = await getUserPlatform();

      if (!userPlatform) return;

      const { data } = await supabase
        .from("driver_locations")
        .select(`
          id,
          driver_name,
          vehicle_name,
          trip_code,
          latitude,
          longitude,
          last_update,
          status
        `)
        .eq("platform_id", userPlatform.platformId)
        .order("last_update", { ascending: false });

      setDrivers(data ?? []);
      setLoading(false);
    }

    loadDrivers();

    const interval = setInterval(loadDrivers, 10000);

    return () => clearInterval(interval);
  }, []);

  return (
    <AdminLayout>
      <main className="min-h-screen bg-gray-100 p-6">

        <div className="rounded-3xl bg-white p-8 shadow">
          <p className="text-sm font-bold uppercase text-orange-500">
            Client Portal
          </p>

          <h1 className="mt-3 text-4xl font-black text-[#061B33]">
            Live Tracking
          </h1>

          <p className="mt-2 text-gray-600">
            Monitor active drivers and vehicles in real time.
          </p>
        </div>

        <div className="mt-8 rounded-2xl bg-white shadow overflow-hidden">

          {loading ? (
            <div className="p-8 text-center">
              Loading live tracking...
            </div>
          ) : (
            <table className="w-full">

              <thead className="bg-gray-100">

                <tr>
                  <th className="p-4 text-left">Driver</th>
                  <th className="p-4 text-left">Vehicle</th>
                  <th className="p-4 text-left">Trip</th>
                  <th className="p-4 text-left">Latitude</th>
                  <th className="p-4 text-left">Longitude</th>
                  <th className="p-4 text-left">Status</th>
                  <th className="p-4 text-left">Last Update</th>
                </tr>

              </thead>

              <tbody>

                {drivers.map((driver) => (

                  <tr
                    key={driver.id}
                    className="border-t"
                  >

                    <td className="p-4">
                      {driver.driver_name ?? "-"}
                    </td>

                    <td className="p-4">
                      {driver.vehicle_name ?? "-"}
                    </td>

                    <td className="p-4">
                      {driver.trip_code ?? "-"}
                    </td>

                    <td className="p-4">
                      {driver.latitude ?? "-"}
                    </td>

                    <td className="p-4">
                      {driver.longitude ?? "-"}
                    </td>

                    <td className="p-4">
                      {driver.status ?? "-"}
                    </td>

                    <td className="p-4">
                      {driver.last_update
                        ? new Date(driver.last_update).toLocaleString()
                        : "-"}
                    </td>

                  </tr>

                ))}

              </tbody>

            </table>
          )}

        </div>

      </main>
    </AdminLayout>
  );
}