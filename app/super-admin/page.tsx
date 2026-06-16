"use client";

import Link from "next/link";

export default function SuperAdminPage() {
  const cards = [
    ["/admin", "Platform Admin", "Open company admin dashboard"],
    ["/super-admin/billing", "Billing", "Billing cycles and invoices"],
    ["/reports", "Reports", "Operational reports"],
    ["/trips", "Trips", "Planned and assigned trips"],
    ["/calendar", "Calendar", "Daily transport calendar"],
    ["/route-planning", "Route Planning", "Group by area, shift and capacity"],
    ["/drivers", "Drivers", "Manage drivers"],
    ["/vehicles", "Vehicles", "Manage vehicles"],
    ["/agents", "Agents", "Manage agents"],
    ["/live-map", "Live Map", "Track drivers"],
    ["/emergency-dashboard", "Emergency", "Emergency alerts"],
    ["/support-tickets", "Support Tickets", "Driver support requests"],
    ["/super-admin/reports", "Super Reports", "Platform-level reports"],
    ["/super-admin/settings", "Settings", "System settings"],
  ];

  return (
    <main className="p-6">
      <h1 className="text-3xl font-bold mb-2">Super Admin Dashboard</h1>
      <p className="text-gray-600 mb-6">Corneluis Group Pty Ltd · GHO Platform Control</p>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map(([href, title, desc]) => (
          <Link key={href} href={href} className="bg-white border rounded-xl p-4 shadow hover:bg-gray-50">
            <h2 className="font-bold">{title}</h2>
            <p className="text-sm text-gray-600">{desc}</p>
          </Link>
        ))}
      </div>
    </main>
  );
}
