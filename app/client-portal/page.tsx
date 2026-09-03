"use client";

import AdminLayout from "../../components/AdminLayout";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { getUserPlatform } from "../../lib/getUserPlatform";
import { TRIP_STATUS } from "../../lib/tripStatus";

type ActivityLog = {
  id: string;
  title?: string | null;
  description?: string | null;
  created_at?: string | null;
};
export default function ClientPortalPage() {
    const [tripsToday, setTripsToday] = useState(0);
const [activeTrips, setActiveTrips] = useState(0);
const [activeDrivers, setActiveDrivers] = useState(0);
const [openIncidents, setOpenIncidents] = useState(0);
const [recentActivity, setRecentActivity] = useState<ActivityLog[]>([]);
useEffect(() => {
  async function loadDashboard() {
    const userPlatform = await getUserPlatform();

    if (!userPlatform) return;

    const platformId = userPlatform.platformId;

    const today = new Date().toISOString().split("T")[0];

    const [
      todayTrips,
      activeTripsResult,
      drivers,
      incidents,
      activity,
    ] = await Promise.all([
      supabase
        .from("trips")
        .select("*", { count: "exact", head: true })
        .eq("platform_id", platformId)
        .eq("trip_date", today),

      supabase
        .from("trips")
        .select("*", { count: "exact", head: true })
        .eq("platform_id", platformId)
        .eq("status", TRIP_STATUS.IN_TRANSIT),

      supabase
        .from("drivers")
        .select("*", { count: "exact", head: true })
        .eq("platform_id", platformId)
        .eq("availability_status", "Available"),

      supabase
        .from("incidents")
        .select("*", { count: "exact", head: true })
        .eq("platform_id", platformId)
        .neq("status", "Resolved"),

      supabase
        .from("activity_logs")
        .select("*")
        .eq("platform_id", platformId)
        .order("created_at", {
          ascending: false,
        })
        .limit(5),
    ]);

    setTripsToday(todayTrips.count ?? 0);
    setActiveTrips(activeTripsResult.count ?? 0);
    setActiveDrivers(drivers.count ?? 0);
    setOpenIncidents(incidents.count ?? 0);
    setRecentActivity(activity.data ?? []);
  }

  loadDashboard();
}, []);
  return (
    <AdminLayout>
      <main className="min-h-screen bg-gray-100 p-6">

        <div className="rounded-3xl bg-white p-8 shadow">
          <p className="text-sm font-bold uppercase text-orange-500">
            GHO Client Portal
          </p>

          <h1 className="mt-3 text-4xl font-black text-[#061B33]">
            Client Dashboard
          </h1>

          <p className="mt-2 text-gray-600">
            Live overview of your transport operations.
          </p>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-4">

<Card title="Trips Today" value={tripsToday} />
<Card title="Trips Active" value={activeTrips} />
<Card title="Drivers Active" value={activeDrivers} />
<Card title="Open Incidents" value={openIncidents} />

        </div>

        <div className="mt-8 rounded-2xl bg-white p-6 shadow">

          <h2 className="text-2xl font-black text-[#061B33]">
            Recent Activity
          </h2>

          <div className="mt-6 space-y-3">

            {recentActivity.length === 0 ? (
              <div className="text-gray-500">
                No recent activity.
              </div>
            ) : (
              recentActivity.map((item) => (
                <div
                  key={item.id}
                  className="rounded-lg border p-4"
                >
                  <p className="font-semibold">
                    {item.description}
                  </p>

                  <p className="text-sm text-gray-500">
                    {item.created_at ? new Date(item.created_at).toLocaleString() : "Unknown date"}
                  </p>
                </div>
              ))
            )}

          </div>

        </div>

      </main>
    </AdminLayout>
  );
}

function Card({
  title,
  value,
}: {
  title: string;
  value: string | number;
}) {
  return (
    <div className="rounded-2xl bg-white p-6 shadow">

      <p className="text-sm text-gray-500">
        {title}
      </p>

      <p className="mt-3 text-4xl font-black text-[#061B33]">
        {value}
      </p>

    </div>
  );
}
