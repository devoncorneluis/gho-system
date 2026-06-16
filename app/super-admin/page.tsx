import Link from "next/link";

export default function SuperAdminPage() {
  return (
    <main className="p-6">
      <h1 className="text-3xl font-bold mb-2">Super Admin Dashboard</h1>
      <p className="text-gray-600 mb-6">
        Corneluis Group Pty Ltd · GHO Platform Control
      </p>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link href="/super-admin/billing" className="bg-white border rounded-xl p-4 shadow">
          <h2 className="font-bold">Billing</h2>
          <p className="text-sm text-gray-600">Billing dashboard</p>
        </Link>

        <Link href="/super-admin/invoices" className="bg-white border rounded-xl p-4 shadow">
          <h2 className="font-bold">Invoices</h2>
          <p className="text-sm text-gray-600">View invoices</p>
        </Link>

        <Link href="/super-admin/audit-logs" className="bg-white border rounded-xl p-4 shadow">
          <h2 className="font-bold">Audit Logs</h2>
          <p className="text-sm text-gray-600">System activity logs</p>
        </Link>

        <Link href="/admin" className="bg-white border rounded-xl p-4 shadow">
          <h2 className="font-bold">Platform Admin</h2>
          <p className="text-sm text-gray-600">Open admin dashboard</p>
        </Link>
      </div>
    </main>
  );
}
