"use client";

import { useEffect, useState } from "react";
import AdminLayout from "../../components/AdminLayout";
import ExecutiveAlerts from "../../components/executive/ExecutiveAlerts";
import ExecutiveInsights from "../../components/executive/ExecutiveInsights";
import OperationsOverview from "../../components/executive/OperationsOverview";
import RevenueTrendCard from "../../components/executive/RevenueTrendCard";
import type { ExecutiveAlert } from "../../components/executive/ExecutiveAlerts";
import { getExecutiveMetrics } from "../../lib/analytics/metricsService";
import { getUserPlatform } from "../../lib/getUserPlatform";

export default function ExecutiveDashboardPage() {
  const [metrics, setMetrics] = useState<{
    executiveAlerts: ExecutiveAlert[];
    revenue: number;
    previousMonthRevenue: number;
    totalTrips: number;
    activeTrips: number;
    completedTrips: number;
    fleetUtilisation: number;
    driverAcceptanceRate: number;
    slaCompliance: number;
    activeEmergencies: number;
  }>({
    executiveAlerts: [],
    revenue: 0,
    previousMonthRevenue: 0,
    totalTrips: 0,
    activeTrips: 0,
    completedTrips: 0,
    fleetUtilisation: 0,
    driverAcceptanceRate: 0,
    slaCompliance: 0,
    activeEmergencies: 0,
  });

  useEffect(() => {
    let mounted = true;

    async function loadMetrics() {
      const userPlatform = await getUserPlatform();
      if (!userPlatform) return;
      const executive = await getExecutiveMetrics(userPlatform.platformId);
      if (mounted) {
        setMetrics(executive);
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
          <p className="text-sm font-semibold uppercase tracking-wide text-gray-500">Executive Dashboard</p>
          <h1 className="mt-3 text-4xl font-black text-[#061B33]">Business intelligence for leadership</h1>
          <p className="mt-3 max-w-2xl text-gray-600">
            This view packages revenue, fleet utilization, SLA compliance, trip success, driver performance, growth, and cost trends for executives.
          </p>
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold text-gray-500">Revenue</p>
            <p className="mt-3 text-3xl font-black text-[#061B33]">R {metrics.revenue.toLocaleString()}</p>
          </div>
          <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold text-gray-500">Fleet utilization</p>
            <p className="mt-3 text-3xl font-black text-[#061B33]">{metrics.fleetUtilisation}%</p>
          </div>
          <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold text-gray-500">SLA compliance</p>
            <p className="mt-3 text-3xl font-black text-[#061B33]">{metrics.slaCompliance}%</p>
          </div>
          <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold text-gray-500">Trip success</p>
            <p className="mt-3 text-3xl font-black text-[#061B33]">
              {metrics.totalTrips > 0
                ? Math.round(
                    (metrics.completedTrips /
                      metrics.totalTrips) *
                      100
                  )
                : 0}
              %
            </p>
          </div>
        </div>

        <div className="mt-6">
          <RevenueTrendCard
            currentMonth={metrics.revenue}
            previousMonth={metrics.previousMonthRevenue}
          />
        </div>

        <div className="mt-6">

          <ExecutiveInsights
            insights={[
              {
                title: "Top Platform",
                value: "Cape Town",
                subtitle: "Highest completed trips",
              },
              {
                title: "Top Driver",
                value: "John Smith",
                subtitle: "Highest acceptance rate",
              },
              {
                title: "Most Used Vehicle",
                value: "Toyota Quantum",
                subtitle: "Most dispatched vehicle",
              },
              {
                title: "Average Trip Time",
                value: "42 min",
                subtitle: "Current monthly average",
              },
            ]}
          />

        </div>

        <div className="mt-6">

          <OperationsOverview
            activeTrips={metrics.activeTrips}
            awaitingDispatch={
              metrics.totalTrips -
              metrics.activeTrips -
              metrics.completedTrips
            }
            activeEmergencies={
              metrics.activeEmergencies
            }
            overdueInvoices={0}
          />

        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold text-gray-500">Driver performance</p>
            <p className="mt-3 text-3xl font-black text-[#061B33]">{metrics.driverAcceptanceRate}% acceptance</p>
          </div>
          <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold text-gray-500">Active emergencies</p>
            <p className="mt-3 text-3xl font-black text-[#061B33]">{metrics.activeEmergencies}</p>
          </div>
        </div>

        <div className="mt-6">
          <ExecutiveAlerts alerts={metrics.executiveAlerts} />
        </div>
      </main>
    </AdminLayout>
  );
}
