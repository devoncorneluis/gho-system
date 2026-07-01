"use client";
import { useEffect, useState } from "react";
import AdminLayout from "../../components/AdminLayout";
import { supabase } from "../../lib/supabase";

type Activity = {  id: string;  title: string;  created_at: string;};
type FleetDriver = {  driver_id: string;  driver_name: string;  trip_code: string | null;  vehicle_name: string | null;  speed: number | null;  is_tracking: boolean;  updated_at: string;};

export default function LiveDispatchPage() {
  const [driversOnline, setDriversOnline] = useState(0);
  const [activeTrips, setActiveTrips] = useState(0);
  const [emergencies, setEmergencies] = useState(0);
  const [availableVehicles, setAvailableVehicles] = useState(0);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [fleet, setFleet] = useState<FleetDriver[]>([]);

  async function loadDashboard() {
    const { count: online } = await supabase
      .from("driver_locations")
      .select("*", { count: "exact", head: true })
      .eq("is_tracking", true);

    const { count: trips } = await supabase
      .from("trips")
      .select("*", { count: "exact", head: true })
      .eq("status", "In Progress");

    const { count: emergency } = await supabase
      .from("emergency_alerts")
      .select("*", { count: "exact", head: true })
      .eq("status", "Active");

    const { count: vehicles } = await supabase
      .from("vehicles")
      .select("*", { count: "exact", head: true })
      .eq("availability_status", "Available");

    setDriversOnline(online ?? 0);
    setActiveTrips(trips ?? 0);
    setEmergencies(emergency ?? 0);
    setAvailableVehicles(vehicles ?? 0);
  }

  async function loadActivities() {  const { data, error } = await supabase    .from("notification_logs")    .select("id, title, created_at")    .order("created_at", { ascending: false })    .limit(10);  if (error) {    console.error(error.message);    return;  }  setActivities(data || []);}

  async function loadFleet() {  const { data, error } = await supabase    .from("driver_locations")    .select(`      driver_id,      speed,      updated_at,      is_tracking,      drivers(full_name),      trips(trip_code),      vehicles(vehicle_name)    `);  if (error) {    console.error(error.message);    return;  }  setFleet(    (data || []).map((item: any) => ({      driver_id: item.driver_id,      driver_name: item.drivers?.full_name ?? "Unknown",      trip_code: item.trips?.trip_code ?? "-",      vehicle_name: item.vehicles?.vehicle_name ?? "-",      speed: item.speed,      is_tracking: item.is_tracking,      updated_at: item.updated_at,    }))  );}

  useEffect(() => {
    loadDashboard();
    loadActivities();
    loadFleet();
    const interval = setInterval(() => {
      loadDashboard();
      loadActivities();
      loadFleet();
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <AdminLayout>
      <main className="min-h-screen bg-gray-100 p-6">
        <h1 className="text-4xl font-bold text-[#061B33]">🗺️ Live Dispatch Map</h1>
        <p className="mt-2 text-gray-600">
          Monitor all active drivers in real time.
        </p>

        <div className="mt-6 rounded-2xl bg-white p-6 shadow">
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 rounded-xl border bg-gray-50 p-6">
              <div className="flex h-[600px] items-center justify-center rounded-lg border-2 border-dashed border-gray-300">
                <div className="text-center">
                  <p className="text-5xl">🗺️</p>
                  <h2 className="mt-4 text-2xl font-bold text-[#061B33]">
                    Live Fleet Map
                  </h2>
                  <p className="mt-2 text-gray-500">
                    Google Maps will appear here.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-xl bg-white p-5 shadow">
                <h3 className="font-bold text-[#061B33]">🚐 Fleet Status</h3>
                <div className="mt-4 space-y-2 text-sm">
                  <p>🟢 Drivers Online: {driversOnline}</p>
                  <p>🟡 Idle Drivers: 0</p>
                  <p>🔴 Offline Drivers: 0</p>
                </div>
              </div>

              <div className="rounded-xl bg-white p-5 shadow">
                <h3 className="font-bold text-[#061B33]">📍 Active Trips</h3>
                <p className="mt-4 text-4xl font-black text-[#061B33]">
                  {activeTrips}
                </p>
              </div>

              <div className="rounded-xl bg-white p-5 shadow">
                <h3 className="font-bold text-[#061B33]">🚨 Emergencies</h3>
                <p className="mt-4 text-4xl font-black text-red-600">
                  {emergencies}
                </p>
              </div>

              <div className="rounded-xl bg-white p-5 shadow">
                <h3 className="font-bold text-[#061B33]">🚗 Available Vehicles</h3>
                <p className="mt-4 text-4xl font-black text-green-600">
                  {availableVehicles}
                </p>
              </div>

              <div className="rounded-xl bg-white p-5 shadow">
                <h3 className="mb-4 font-bold text-[#061B33]">📰 Operations Feed</h3>
                {activities.length === 0 ? (
                  <p className="text-gray-500">No recent activity.</p>
                ) : (
                  <div className="space-y-3">
                    {activities.map((activity) => (
                      <div key={activity.id} className="border-b pb-2 last:border-b-0">
                        <p className="font-medium">{activity.title}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(activity.created_at).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="rounded-xl bg-white p-5 shadow">
                <h3 className="mb-4 text-xl font-bold text-[#061B33]">🚐 Live Fleet</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="py-2 text-left">Driver</th>
                        <th className="text-left">Trip</th>
                        <th className="text-left">Vehicle</th>
                        <th className="text-left">Speed</th>
                        <th className="text-left">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {fleet.map((driver, index) => (
                        <tr key={index} className="border-b">
                          <td className="py-2">
                        <button
                          onClick={() =>
                            (window.location.href = `/live-dispatch/${driver.driver_id}`)
                          }
                          className="font-bold text-blue-600 hover:underline"
                        >
                          {driver.driver_name}
                        </button>
                      </td>
                          <td>{driver.trip_code}</td>
                          <td>{driver.vehicle_name}</td>
                          <td>{Math.round(driver.speed ?? 0)} km/h</td>
                          <td>
                            {driver.is_tracking ? "🟢 Online" : "🔴 Offline"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </AdminLayout>
  );
}
