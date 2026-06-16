"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function SuperAdminPage() {
  const [metrics, setMetrics] = useState({
    trips: 0,
    drivers: 0,
    vehicles: 0,
    agents: 0,
    emergencies: 0,
    supportTickets: 0,
  });

  const loadMetrics = async () => {
    const [trips, drivers, vehicles, agents, emergencies, tickets] =
      await Promise.all([
        supabase.from("trips").select("*", { count: "exact", head: true }),
        supabase.from("drivers").select("*", { count: "exact", head: true }),
        supabase.from("vehicles").select("*", { count: "exact", head: true }),
        supabase.from("agents").select("*", { count: "exact", head: true }),
        supabase
          .from("emergency_alerts")
          .select("*", { count: "exact", head: true })
          .eq("status", "Open"),
        supabase
          .from("support_tickets")
          .select("*", { count: "exact", head: true })
          .eq("status", "Open"),
      ]);

    setMetrics({
      trips: trips.count || 0,
      drivers: drivers.count || 0,
      vehicles: vehicles.count || 0,
      agents: agents.count || 0,
      emergencies: emergencies.count || 0,
      supportTickets: tickets.count || 0,
    });
  };

  useEffect(() => {
    loadMetrics();
  }, []);

  return (
    <main className="p-6">
      <h1 className="text-3xl font-bold mb-2">Super Admin Dashboard</h1>
      <p className="text-gray-600 mb-6">
        Corneluis Group Pty Ltd · GHO Platform Control
      </p>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        <div className="bg-white border rounded-xl p-4 shadow">
          <p className="text-sm text-gray-600">Trips</p>
          <p className="text-2xl font-bold">{metrics.trips}</p>
        </div>

        <div className="bg-white border rounded-xl p-4 shadow">
          <p className="text-sm text-gray-600">Drivers</p>
          <p className="text-2xl font-bold">{metrics.drivers}</p>
        </div>

        <div className="bg-white border rounded-xl p-4 shadow">
          <p className="text-sm text-gray-600">Vehicles</p>
          <p className="text-2xl font-bold">{metrics.vehicles}</p>
        </div>

        <div className="bg-white border rounded-xl p-4 shadow">
          <p className="text-sm text-gray-600">Agents</p>
          <p className="text-2xl font-bold">{metrics.agents}</p>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-xl p-4 shadow">
          <p className="text-sm text-gray-600">Open Emergencies</p>
          <p className="text-2xl font-bold text-red-700">{metrics.emergencies}</p>
        </div>

        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 shadow">
          <p className="text-sm text-gray-600">Support Tickets</p>
          <p className="text-2xl font-bold text-orange-700">{metrics.supportTickets}</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Link href="/admin" className="bg-white border rounded-xl p-4 shadow">Platform Admin</Link>
        <Link href="/super-admin/billing" className="bg-white border rounded-xl p-4 shadow">Billing</Link>
        <Link href="/super-admin/invoices" className="bg-white border rounded-xl p-4 shadow">Invoices</Link>
        <Link href="/super-admin/audit-logs" className="bg-white border rounded-xl p-4 shadow">Audit Logs</Link>
        <Link href="/reports" className="bg-white border rounded-xl p-4 shadow">Reports</Link>
        <Link href="/trips" className="bg-white border rounded-xl p-4 shadow">Trips</Link>
        <Link href="/calendar" className="bg-white border rounded-xl p-4 shadow">Calendar</Link>
        <Link href="/route-planning" className="bg-white border rounded-xl p-4 shadow">Route Planning</Link>
        <Link href="/drivers" className="bg-white border rounded-xl p-4 shadow">Drivers</Link>
        <Link href="/vehicles" className="bg-white border rounded-xl p-4 shadow">Vehicles</Link>
        <Link href="/agents" className="bg-white border rounded-xl p-4 shadow">Agents</Link>
        <Link href="/live-map" className="bg-white border rounded-xl p-4 shadow">Live Map</Link>
        <Link href="/emergency-dashboard" className="bg-white border rounded-xl p-4 shadow">Emergency</Link>
        <Link href="/support-tickets" className="bg-white border rounded-xl p-4 shadow">Support Tickets</Link>
      </div>
    </main>
  );
}
