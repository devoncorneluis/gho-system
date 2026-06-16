"use client";

import Link from "next/link";

export default function SuperAdminPage() {
  return (
    <main className="p-6">
      <h1 className="text-3xl font-bold mb-2">Super Admin Dashboard</h1>
      <p className="text-gray-600 mb-6">
        Corneluis Group Pty Ltd · GHO Platform Control
      </p>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Link href="/admin" className="bg-white border rounded-xl p-4 shadow">
          <h2 className="font-bold">Platform Admin</h2>
          <p className="text-sm text-gray-600">Company admin dashboard</p>
        </Link>

        <Link href="/super-admin/billing" className="bg-white border rounded-xl p-4 shadow">
          <h2 className="font-bold">Billing</h2>
          <p className="text-sm text-gray-600">Billing dashboard</p>
        </Link>

        <Link href="/reports" className="bg-white border rounded-xl p-4 shadow">
          <h2 className="font-bold">Reports</h2>
          <p className="text-sm text-gray-600">Reports dashboard</p>
        </Link>

        <Link href="/trips" className="bg-white border rounded-xl p-4 shadow">
          <h2 className="font-bold">Trips</h2>
          <p className="text-sm text-gray-600">Trip management</p>
        </Link>

        <Link href="/calendar" className="bg-white border rounded-xl p-4 shadow">
          <h2 className="font-bold">Calendar</h2>
          <p className="text-sm text-gray-600">Transport calendar</p>
        </Link>

        <Link href="/route-planning" className="bg-white border rounded-xl p-4 shadow">
          <h2 className="font-bold">Route Planning</h2>
          <p className="text-sm text-gray-600">Plan grouped transport</p>
        </Link>

        <Link href="/drivers" className="bg-white border rounded-xl p-4 shadow">
          <h2 className="font-bold">Drivers</h2>
          <p className="text-sm text-gray-600">Driver management</p>
        </Link>

        <Link href="/vehicles" className="bg-white border rounded-xl p-4 shadow">
          <h2 className="font-bold">Vehicles</h2>
          <p className="text-sm text-gray-600">Vehicle management</p>
        </Link>

        <Link href="/agents" className="bg-white border rounded-xl p-4 shadow">
          <h2 className="font-bold">Agents</h2>
          <p className="text-sm text-gray-600">Agent management</p>
        </Link>

        <Link href="/live-map" className="bg-white border rounded-xl p-4 shadow">
          <h2 className="font-bold">Live Map</h2>
          <p className="text-sm text-gray-600">Live driver tracking</p>
        </Link>

        <Link href="/emergency-dashboard" className="bg-white border rounded-xl p-4 shadow">
          <h2 className="font-bold">Emergency</h2>
          <p className="text-sm text-gray-600">Emergency dashboard</p>
        </Link>

        <Link href="/support-tickets" className="bg-white border rounded-xl p-4 shadow">
          <h2 className="font-bold">Support Tickets</h2>
          <p className="text-sm text-gray-600">Driver support requests</p>
        </Link>
      </div>
    </main>
  );
}
