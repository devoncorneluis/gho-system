"use client";

import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabase";

const links = [
  { name: "🏠 Dashboard", href: "/admin" },
  { name: "📅 Calendar", href: "/calendar" },
  { name: "🚐 Trips", href: "/trips" },
  { name: "👥 Agents", href: "/agents" },
  { name: "🚗 Drivers", href: "/drivers" },
  { name: "🚙 Vehicles", href: "/vehicles" },
  { name: "📍 Live Map", href: "/live-map" },
  { name: "🚨 Emergency", href: "/emergency-dashboard" },
  { name: "🔔 Notifications", href: "/notifications" },
  { name: "📊 Reports", href: "/reports" },
  { name: "👤 Profile", href: "/profile" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  async function logout() {
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <aside className="fixed left-0 top-0 h-screen w-64 bg-[#061B33] text-white p-4 overflow-y-auto">
        <h1 className="text-2xl font-bold mb-6">GHO</h1>

        <button
          onClick={() => router.back()}
          className="bg-white text-[#061B33] w-full py-2 rounded-lg font-bold mb-4"
        >
          ← Back
        </button>

        <nav className="space-y-2">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="block bg-white/10 hover:bg-orange-500 rounded-lg px-4 py-3 font-bold"
            >
              {link.name}
            </a>
          ))}
        </nav>

        <button
          onClick={logout}
          className="bg-red-600 w-full py-3 rounded-lg font-bold mt-6"
        >
          Logout
        </button>
      </aside>

      <main className="ml-64 min-h-screen">
        {children}
      </main>
    </div>
  );
}
