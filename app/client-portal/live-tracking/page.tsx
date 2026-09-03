"use client";

import { useEffect, useState } from "react";
import AdminLayout from "../../../components/AdminLayout";
import { supabase } from "../../../lib/supabase";
import { getUserPlatform } from "../../../lib/getUserPlatform";

type DriverLocation = {
  id: string;
  driver_id: string;
  trip_id: string | null;
  latitude: number | null;
  longitude: number | null;
  updated_at: string | null;
  is_tracking: boolean;
  driver_name: string | null;
  vehicle_name: string | null;
  trip_code: string | null;
};

export default function ClientLiveTrackingPage() {
  const [drivers, setDrivers] = useState<DriverLocation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDrivers() {
      const userPlatform = await getUserPlatform();

      if (!userPlatform) return;

      const { data, error } = await supabase
        .from("driver_locations")
        .select(`
          id,
          driver_id,
          trip_id,
          latitude,
          longitude,
          updated_at,
          is_tracking,
          drivers!inner(
            platform_id,
            full_name
          ),
          trips(
            trip_code,
            vehicle_name
          )
        `)
        .eq("drivers.platform_id", userPlatform.platformId)
        .order("updated_at", { ascending: false });

      if (error) {
        console.error("Unable to load live tracking:", error);
        setDrivers([]);
        setLoading(false);
        return;
      }

      const mappedDrivers: DriverLocation[] = (data ?? []).map((location) => ({
        id: location.id,
        driver_id: location.driver_id,
        trip_id: location.trip_id,
        latitude: location.latitude,
        longitude: location.longitude,
        updated_at: location.updated_at,
        is_tracking: location.is_tracking,
        driver_name: location.drivers?.[0]?.full_name ?? null,
        vehicle_name: location.trips?.[0]?.vehicle_name ?? null,
        trip_code: location.trips?.[0]?.trip_code ?? null,
      }));

      setDrivers(mappedDrivers);
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
                      {driver.is_tracking ? "Tracking" : "Offline"}
                    </td>

                    <td className="p-4">
                      {driver.updated_at
                        ? new Date(driver.updated_at).toLocaleString()
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