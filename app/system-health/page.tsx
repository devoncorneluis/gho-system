"use client";

import AdminLayout from "../../components/AdminLayout";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

export default function SystemHealthPage() {
const [databaseHealthy, setDatabaseHealthy] = useState(false);
const [driverCount, setDriverCount] = useState(0);
const [vehicleCount, setVehicleCount] = useState(0);
const [tripCount, setTripCount] = useState(0);
const [agentCount, setAgentCount] = useState(0);

const [routeGroupCount, setRouteGroupCount] = useState(0);
const [notificationCount, setNotificationCount] = useState(0);
const [emergencyCount, setEmergencyCount] = useState(0);
const [healthScore, setHealthScore] = useState(100);

async function runDiagnostics() {
  try {
const [
  { count: drivers },
  { count: vehicles },
  { count: trips },
  { count: agents },
  { count: routeGroups },
  { count: notifications },
  { count: emergencies },
] = await Promise.all([
  supabase.from("drivers").select("*", { count: "exact", head: true }),
  supabase.from("vehicles").select("*", { count: "exact", head: true }),
  supabase.from("trips").select("*", { count: "exact", head: true }),
  supabase.from("agents").select("*", { count: "exact", head: true }),
  supabase.from("route_groups").select("*", { count: "exact", head: true }),
  supabase.from("notification_logs").select("*", { count: "exact", head: true }),
  supabase.from("emergency_alerts").select("*", { count: "exact", head: true }),
]);

    setDriverCount(drivers ?? 0);
    setVehicleCount(vehicles ?? 0);
    setTripCount(trips ?? 0);
    setAgentCount(agents ?? 0);
setRouteGroupCount(routeGroups ?? 0);
setNotificationCount(notifications ?? 0);
setEmergencyCount(emergencies ?? 0);
    setDatabaseHealthy(true);
  } catch (err) {
    console.error(err);
    setDatabaseHealthy(false);
  }
}

useEffect(() => {
  runDiagnostics();
}, []);




return (
  <AdminLayout>

<div className="bg-green-600 text-white rounded-xl shadow p-6">
  <h2 className="text-2xl font-bold">Overall Health</h2>

  <p className="text-6xl font-black mt-4">
    {healthScore}%
  </p>

  <p className="mt-3">
    {healthScore >= 90
      ? "🟢 Excellent"
      : healthScore >= 70
      ? "🟡 Good"
      : "🔴 Needs Attention"}
  </p>
</div>

      <main className="min-h-screen bg-gray-100 p-6">
        <h1 className="text-4xl font-black text-[#061B33]">
          🛠 GHO System Health
        </h1>

        <p className="mt-2 text-gray-600">
          Enterprise diagnostics for the GHO Platform.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mt-8">

<div className="bg-white rounded-xl shadow p-6">
  <h2 className="text-xl font-bold">🗄 Database</h2>

  <p className="mt-4">
    Status: {databaseHealthy ? "🟢 Healthy" : "🔴 Error"}
  </p>

  <div className="mt-4 space-y-2 text-sm">
    <p>Drivers: {driverCount}</p>
    <p>Vehicles: {vehicleCount}</p>
    <p>Trips: {tripCount}</p>
    <p>Agents: {agentCount}</p>
  </div>
</div>

          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-xl font-bold">🔐 Authentication</h2>
            <p className="mt-3 text-gray-600">
              Waiting for diagnostics...
            </p>
          </div>

          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-xl font-bold">🚐 Fleet</h2>
            <p className="mt-3 text-gray-600">
              Waiting for diagnostics...
            </p>
          </div>

          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-xl font-bold">📍 Live Tracking</h2>
            <p className="mt-3 text-gray-600">
              Waiting for diagnostics...
            </p>
          </div>

          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-xl font-bold">🤖 AI Intelligence</h2>
            <p className="mt-3 text-gray-600">
              Waiting for diagnostics...
            </p>
          </div>

          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-xl font-bold">⚡ Performance</h2>
            <p className="mt-3 text-gray-600">
              Waiting for diagnostics...
            </p>
          </div>

        </div>
      </main>
    </AdminLayout>
  );
}
