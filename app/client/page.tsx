"use client";

import { useEffect, useState } from "react";
import AdminLayout from "../../components/AdminLayout";
import { getClientMetrics } from "../../lib/analytics/metricsService";
import { getUserPlatform } from "../../lib/getUserPlatform";

const portalItems = [
  { title: "Live trips", detail: "See vehicle movement and trip status in real time." },
  { title: "Live vehicles", detail: "Monitor fleet availability and current location." },
  { title: "Employee ETAs", detail: "Share accurate arrival estimates with riders and staff." },
  { title: "Passenger tracking", detail: "Enable transparent progress updates for passengers." },
  { title: "Reports", detail: "Access summary reporting for operations and finance." },
  { title: "Invoices", detail: "Review billing history and payable documents." },
  { title: "Notifications", detail: "Receive dispatch and trip updates instantly." },
];

export default function ClientPortalPage() {
  const [metrics, setMetrics] = useState({
    totalTrips: 0,
    activeTrips: 0,
    completedTrips: 0,
    liveVehicles: 0,
    activeDrivers: 0,
    etaCoverage: 0,
    notificationCount: 0,
  });

  useEffect(() => {
    let mounted = true;

    async function loadMetrics() {
      const userPlatform = await getUserPlatform();
      if (!userPlatform) return;
      const client = await getClientMetrics(userPlatform.platformId);
      if (mounted) {
        setMetrics(client);
      }
    }

    loadMetrics();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <AdminLayout>
      <main className="min-h-screen bg-gray-100 p-6">
        <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-wide text-gray-500">Client Portal</p>
          <h1 className="mt-3 text-4xl font-black text-[#061B33]">Commercial experience for direct customers</h1>
          <p className="mt-3 max-w-2xl text-gray-600">
            This release introduces the customer-facing portal experience for live trips, vehicle monitoring, ETAs, reports, invoices, and alerts.
          </p>
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold text-gray-500">Live trips</p>
            <p className="mt-3 text-3xl font-black text-[#061B33]">{metrics.activeTrips}</p>
          </div>
          <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold text-gray-500">Completed trips</p>
            <p className="mt-3 text-3xl font-black text-[#061B33]">{metrics.completedTrips}</p>
          </div>
          <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold text-gray-500">Live vehicles</p>
            <p className="mt-3 text-3xl font-black text-[#061B33]">{metrics.liveVehicles}</p>
          </div>
          <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold text-gray-500">ETA coverage</p>
            <p className="mt-3 text-3xl font-black text-[#061B33]">{metrics.etaCoverage}%</p>
          </div>
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {portalItems.map((item) => (
            <div key={item.title} className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-black text-[#061B33]">{item.title}</h2>
              <p className="mt-2 text-sm text-gray-600">{item.detail}</p>
            </div>
          ))}
        </div>
      </main>
    </AdminLayout>
  );
}
