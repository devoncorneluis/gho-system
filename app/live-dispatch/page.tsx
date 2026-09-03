"use client";
import { useCallback, useEffect, useState } from "react";
import AdminLayout from "../../components/AdminLayout";
import FleetMap from "../../components/maps/FleetMap";
import { getUserPlatform } from "../../lib/getUserPlatform";
import { supabase } from "../../lib/supabase";
import { TRIP_STATUS } from "../../lib/tripStatus";

type Activity = {  id: string;  title: string;  created_at: string;};
type FleetDriver = {  driver_id: string;  driver_name: string;  trip_code: string | null;  vehicle_name: string | null;  speed: number | null;  is_tracking: boolean;  updated_at: string;  driver_response?: string | null;  driver_response_at?: string | null;  dispatched_at?: string | null;  dispatched_by?: string | null;};
type LiveDriver = {  driver_id: string;  driver_name?: string;  trip_id: string | null;  latitude: number;  longitude: number;  speed: number | null;  heading: number | null;  accuracy: number | null;  is_tracking: boolean;  updated_at: string;};
type DriverLocationWithRelations = {
  driver_id: string;
  trip_id?: string | null;
  latitude?: number;
  longitude?: number;
  speed: number | null;
  heading?: number | null;
  accuracy?: number | null;
  is_tracking: boolean;
  updated_at: string;
  drivers?: {
    full_name?: string | null;
  } | null;
  trips?: {
    trip_code?: string | null;
    driver_response?: string | null;
    driver_response_at?: string | null;
    dispatched_at?: string | null;
    dispatched_by?: string | null;
  } | null;
  vehicles?: {
    vehicle_name?: string | null;
  } | null;
};

export default function LiveDispatchPage() {
  const [platformId, setPlatformId] = useState<string | null>(null);
  const [driversOnline, setDriversOnline] = useState(0);
  const [activeTrips, setActiveTrips] = useState(0);
  const [emergencies, setEmergencies] = useState(0);
  const [availableVehicles, setAvailableVehicles] = useState(0);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [fleet, setFleet] = useState<FleetDriver[]>([]);
  const [liveDrivers, setLiveDrivers] = useState<LiveDriver[]>([]);
  const demoRoute = [
    { lat: -33.9249, lng: 18.4241 },
    { lat: -33.915, lng: 18.45 },
    { lat: -33.905, lng: 18.47 },
  ];
  const demoPickups = [
    {
      id: "1",
      full_name: "Devon",
      latitude: -33.923,
      longitude: 18.422,
      pickup_status: "Waiting",
    },
    {
      id: "2",
      full_name: "Sarah",
      latitude: -33.918,
      longitude: 18.438,
      pickup_status: "Picked Up",
    },
  ];

  const demoEmergencies = [
    {
      id: "1",
      latitude: -33.921,
      longitude: 18.431,
    },
  ];

  const loadDashboard = useCallback(async () => {
    if (!platformId) return;

const { data: onlineLocations } = await supabase
  .from("driver_locations")
  .select(`
    driver_id,
    drivers!inner(platform_id)
  `)
  .eq("drivers.platform_id", platformId)
  .eq("is_tracking", true);

const online = onlineLocations?.length ?? 0;

    const { count: trips } = await supabase
      .from("trips")
      .select("*", { count: "exact", head: true })
      .eq("platform_id", platformId)
      .eq("status", TRIP_STATUS.IN_TRANSIT);

    const { count: emergency } = await supabase
      .from("emergency_alerts")
      .select("*", { count: "exact", head: true })
      .eq("platform_id", platformId)
      .eq("status", "Active");

    const { count: vehicles } = await supabase
      .from("vehicles")
      .select("*", { count: "exact", head: true })
      .eq("platform_id", platformId)
      .eq("status", "Available");

    setDriversOnline(online ?? 0);
    setActiveTrips(trips ?? 0);
    setEmergencies(emergency ?? 0);
    setAvailableVehicles(vehicles ?? 0);
  }, [platformId]);

  const loadActivities = useCallback(async () => {
    if (!platformId) return;

    const { data, error } = await supabase
      .from("notification_logs")
      .select("id, title, created_at")
      .eq("platform_id", platformId)
      .order("created_at", { ascending: false })
      .limit(10);

    if (error) {
      console.error(error.message);
      return;
    }

    setActivities(data || []);
  }, [platformId]);

  const loadFleet = useCallback(async () => {
    if (!platformId) return;

    const { data, error } = await supabase
      .from("driver_locations")
      .select(`
        driver_id,
        speed,
        updated_at,
        is_tracking,
        drivers!inner(
          full_name,
          platform_id
        ),
        trips(
          trip_code,
          driver_response,
          driver_response_at,
          dispatched_at,
          dispatched_by
        ),
        vehicles(vehicle_name)
      `)
      .eq("drivers.platform_id", platformId);

    if (error) {
      console.error(error.message);
      return;
    }

    setFleet(
      ((data as DriverLocationWithRelations[] | null) || []).map(
        (item) => ({
          driver_id: item.driver_id,
          driver_name:
            item.drivers?.full_name ?? "Unknown",
          trip_code:
            item.trips?.trip_code ?? "-",
          vehicle_name:
            item.vehicles?.vehicle_name ?? "-",
          speed: item.speed,
          is_tracking: item.is_tracking,
          updated_at: item.updated_at,
          driver_response:
            item.trips?.driver_response ?? null,
          driver_response_at:
            item.trips?.driver_response_at ?? null,
          dispatched_at:
            item.trips?.dispatched_at ?? null,
          dispatched_by:
            item.trips?.dispatched_by ?? null,
        })
      )
    );
  }, [platformId]);

  const loadLiveDrivers = useCallback(async () => {
    if (!platformId) return;

    const { data, error } = await supabase
      .from("driver_locations")
      .select(`
        driver_id,
        trip_id,
        latitude,
        longitude,
        speed,
        heading,
        accuracy,
        is_tracking,
        updated_at,
        drivers!inner(
          full_name,
          platform_id
        )
      `)
      .eq("drivers.platform_id", platformId)
      .eq("is_tracking", true)
      .gte(
        "updated_at",
        new Date(Date.now() - 60_000).toISOString()
      );

    if (error) {
      console.error(error.message);
      return;
    }

    setLiveDrivers(
      ((data as DriverLocationWithRelations[] | null) || []).map(
        (item) => ({
          driver_id: item.driver_id,
          trip_id: item.trip_id ?? null,
          latitude: item.latitude ?? 0,
          longitude: item.longitude ?? 0,
          speed: item.speed,
          heading: item.heading ?? null,
          accuracy: item.accuracy ?? null,
          is_tracking: item.is_tracking,
          updated_at: item.updated_at,
          driver_name:
            item.drivers?.full_name ?? "Unknown Driver",
        })
      )
    );
  }, [platformId]);
  useEffect(() => {
    async function setupPage() {
      const userPlatform = await getUserPlatform();
      if (!userPlatform) {
        window.location.href = "/login";
        return;
      }
      setPlatformId(userPlatform.platformId);
    }

    setupPage();
  }, []);

  useEffect(() => {
    if (!platformId) return;

    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadDashboard();
    loadActivities();
    loadFleet();
    loadLiveDrivers();
    const interval = setInterval(() => {
      loadDashboard();
      loadActivities();
      loadFleet();
      loadLiveDrivers();
    }, 10000);
    return () => clearInterval(interval);
  }, [loadActivities, loadDashboard, loadFleet, loadLiveDrivers, platformId]);

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
              <div className="h-[650px]">
                <FleetMap
                  drivers={liveDrivers}
                  pickups={demoPickups}
                  route={demoRoute}
                  emergencies={demoEmergencies}
                />
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
