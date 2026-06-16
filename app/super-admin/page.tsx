"use client";

import Link from "next/link";

export default function SuperAdminPage() {
  return (
    <main className="p-6">
      <h1 className="text-3xl font-bold mb-4">Super Admin</h1>

      <div className="grid md:grid-cols-3 gap-4">
        <Link href="/super-admin/billing" className="bg-white border rounded-xl p-4 shadow">
          <h2 className="font-bold">Billing</h2>
          <p className="text-sm text-gray-600">View platform billing</p>
        </Link>

        <Link href="/reports" className="bg-white border rounded-xl p-4 shadow">
          <h2 className="font-bold">Reports</h2>
          <p className="text-sm text-gray-600">Open reports</p>
        </Link>

        <Link href="/admin" className="bg-white border rounded-xl p-4 shadow">
          <h2 className="font-bold">Admin Dashboard</h2>
          <p className="text-sm text-gray-600">Go to admin</p>
        </Link>
      </div>
    </main>
  );
}
