"use client";

import Link from "next/link";

export const menuItems = [
  { name: "🏠 Dashboard", href: "/super-admin" },
  { name: "🏢 Customer Companies", href: "/super-admin/companies" },
{ name: "👤 Platform Administrators", href: "/super-admin/customer-administrators" },
  { name: "💳 Billing", href: "/super-admin/billing" },
  { name: "🧾 Invoices", href: "/super-admin/invoices" },
  { name: "📜 Audit Logs", href: "/super-admin/audit-logs" },
  { name: "🛡 Security Centre", href: "/super-admin/security" },
  { name: "🎫 Support Centre", href: "/super-admin/support" },
  { name: "⚙️ Platform Settings", href: "/super-admin/settings" },
  { name: "👤 My Profile", href: "/super-admin/profile" },
];

export default function SuperAdminSidebar() {
  return (
    <nav className="space-y-3">
      {menuItems.map((item) => (
        <Link key={item.href} href={item.href} className="block bg-white/10 hover:bg-white/20 rounded-xl px-4 py-3 font-bold">
          {item.name}
        </Link>
      ))}
    </nav>
  );
}
