"use client";

import { useEffect, useState } from "react";
import AdminLayout from "../../components/AdminLayout";
import { supabase } from "../../lib/supabase";
import { getUserPlatform } from "../../lib/getUserPlatform";
import {
  calculateFleetUtilisation,
  calculateSafetyScore,
  calculateOperationalHealth,
} from "../../lib/analytics/analyticsEngine";

export default function ExecutiveDashboardPage() {
  const [activeTrips, setActiveTrips] = useState(0);
  const [availableDrivers, setAvailableDrivers] = useState(0);
  const [availableVehicles, setAvailableVehicles] = useState(0);
  const [openIncidents, setOpenIncidents] = useState(0);
  const [emergencyAlerts, setEmergencyAlerts] = useState(0);
  const [fleetUtilisation, setFleetUtilisation] = useState(0);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  useEffect(() => {
    async function loadDashboard() {
      const userPlatform = await getUserPlatform();

      if (!userPlatform) return;

      const platformId = userPlatform.platformId;

      const [
        trips,
        drivers,
        vehicles,
        incidents,
        emergencies,
      ] = await Promise.all([
        supabase
          .from("trips")
          .select("*", { count: "exact", head: true })
          .eq("platform_id", platformId)
          .eq("status", "In Progress"),

        supabase
          .from("drivers")
          .select("*", { count: "exact", head: true })
          .eq("platform_id", platformId)
          .eq("availability_status", "Available"),

        supabase
          .from("vehicles")
          .select("*", { count: "exact", head: true })
          .eq("platform_id", platformId)
          .eq("availability_status", "Available"),

        supabase
          .from("incidents")
          .select("*", { count: "exact", head: true })
          .eq("platform_id", platformId)
          .neq("status", "Resolved"),

        supabase
          .from("emergency_alerts")
          .select("*", { count: "exact", head: true })
          .eq("platform_id", platformId)
          .neq("status", "Resolved"),
      ]);

      const activeTripCount = trips.count ?? 0;
      const availableVehicleCount = vehicles.count ?? 0;

      setActiveTrips(activeTripCount);
      setAvailableDrivers(drivers.count ?? 0);
      setAvailableVehicles(availableVehicleCount);
      setOpenIncidents(incidents.count ?? 0);
      setEmergencyAlerts(emergencies.count ?? 0);

      setFleetUtilisation(
        calculateFleetUtilisation(
          activeTripCount,
          availableVehicleCount
        )
      );

      setLastUpdated(new Date());
    }

    loadDashboard();

    const interval = setInterval(loadDashboard, 30000);

    return () => clearInterval(interval);
  }, []);

  const safetyScore = calculateSafetyScore(
    openIncidents,
    emergencyAlerts
  );

  const operationalHealth =
    calculateOperationalHealth(
      fleetUtilisation,
      openIncidents
    );

  return (
    <AdminLayout>
      <main className="min-h-screen bg-gray-100 p-6">

        <div className="mb-8">
          <p className="text-sm font-bold uppercase text-orange-500">
            GHO Executive
          </p>

          <h1 className="text-4xl font-black text-[#061B33]">
            Executive Operations Dashboard
          </h1>

          <p className="mt-2 text-gray-600">
            Live operational overview across transport,
            fleet, safety and incident management.
          </p>

          <p className="mt-2 text-sm text-gray-500">
            Last Updated: {lastUpdated.toLocaleTimeString()}
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-6"></div>
                <div className="rounded-2xl bg-white p-6 shadow">
          <p className="text-sm text-gray-500">
            Active Trips
          </p>

          <p className="mt-3 text-5xl font-black text-[#061B33]">
            {activeTrips}
          </p>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow">
          <p className="text-sm text-gray-500">
            Fleet Utilisation
          </p>

          <p className="mt-3 text-5xl font-black text-green-600">
            {fleetUtilisation}%
          </p>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow">
          <p className="text-sm text-gray-500">
            Open Incidents
          </p>

          <p className="mt-3 text-5xl font-black text-red-600">
            {openIncidents}
          </p>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow">
          <p className="text-sm text-gray-500">
            Emergency Alerts
          </p>

          <p className="mt-3 text-5xl font-black text-orange-600">
            {emergencyAlerts}
          </p>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow">
          <p className="text-sm text-gray-500">
            Safety Score
          </p>

          <p className="mt-3 text-5xl font-black text-green-600">
            {safetyScore}%
          </p>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow">
          <p className="text-sm text-gray-500">
            Operational Health
          </p>

          <p
            className={`mt-3 text-2xl font-black ${operationalHealth.colour}`}
          >
            {operationalHealth.label}
          </p>
        </div>



<div className="mt-8 grid gap-6 lg:grid-cols-2">

  <div className="rounded-2xl bg-white p-6 shadow">

          <h2 className="text-2xl font-black text-[#061B33]">
            Operational Overview
          </h2>

          <div className="mt-6 space-y-4">

            <div className="flex justify-between">
              <span>Drivers Available</span>
              <strong>{availableDrivers}</strong>
            </div>

            <div className="flex justify-between">
              <span>Vehicles Available</span>
              <strong>{availableVehicles}</strong>
            </div>

            <div className="flex justify-between">
              <span>Trips In Progress</span>
              <strong>{activeTrips}</strong>
            </div>

            <div className="flex justify-between">
              <span>Emergency Alerts</span>
              <strong>{emergencyAlerts}</strong>
            </div>

            <div className="flex justify-between">
              <span>Open Incidents</span>
              <strong>{openIncidents}</strong>
            </div>

          </div>

        </div>

        <div className="rounded-2xl bg-white p-6 shadow">

          <h2 className="text-2xl font-black text-[#061B33]">
            Executive Insights
          </h2>

          <div className="mt-6 space-y-4">

            <div
              className={`rounded-xl border p-4 ${
                operationalHealth.colour === "text-red-600"
                  ? "border-red-200 bg-red-50"
                  : operationalHealth.colour === "text-yellow-600"
                  ? "border-yellow-200 bg-yellow-50"
                  : "border-green-200 bg-green-50"
              }`}
            >
              <p className="font-bold">
                Operational Health
              </p>

              <p className={operationalHealth.colour}>
                {operationalHealth.label}
              </p>
            </div>

            <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
              <strong>Fleet Safety Score</strong>

              <p className="mt-2 text-2xl font-black text-blue-700">
                {safetyScore}%
              </p>
            </div>

            {openIncidents > 0 ? (
              <div className="rounded-xl border border-red-200 bg-red-50 p-4">
                🚨 {openIncidents} incident(s) require immediate attention.
              </div>
            ) : (
              <div className="rounded-xl border border-green-200 bg-green-50 p-4">
                ✅ No open incidents.
              </div>
            )}

            {emergencyAlerts > 0 ? (
              <div className="rounded-xl border border-orange-200 bg-orange-50 p-4">
                ⚠ {emergencyAlerts} active emergency alert(s).
              </div>
            ) : (
              <div className="rounded-xl border border-green-200 bg-green-50 p-4">
                ✅ No active emergency alerts.
              </div>
            )}

            {fleetUtilisation >= 85 ? (
              <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-4">
                🚐 Fleet utilisation is high ({fleetUtilisation}%).
              </div>
            ) : (
              <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
                🚐 Fleet utilisation is healthy ({fleetUtilisation}%).
              </div>
            )}

          </div>

        </div>

      </div>

      </main>
    </AdminLayout>
  );
}