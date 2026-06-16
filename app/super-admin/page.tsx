import Link from "next/link";

export default function SuperAdminPage() {
  return (
    <main className="p-6">
      <h1 className="text-3xl font-bold mb-2">Super Admin Dashboard</h1>
      <p className="text-gray-600 mb-6">Corneluis Group Pty Ltd · GHO Platform Control</p>

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
