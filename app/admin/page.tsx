"use client";

import { useEffect, useState } from "react";
import { getCurrentUserRole } from "../../lib/auth";
import { supabase } from "../../lib/supabase";

const menuItems = [
  { name: "📅 Transport Calendar", href: "/calendar" },
  { name: "🚐 Trips", href: "/trips" },
  { name: "📜 Trip History", href: "/trip-history" },
  { name: "👥 Agents", href: "/agents" },
  { name: "🚗 Drivers", href: "/drivers" },
  { name: "🚙 Vehicles", href: "/vehicles" },
  { name: "📍 Live Map", href: "/live-map" },
  { name: "🚨 Emergency Dashboard", href: "/emergency-dashboard" },
  { name: "🔔 Notifications", href: "/notifications" },
  { name: "📊 Reports", href: "/reports" },
  { name: "🚨 Safety Center", href: "/safety" },
  { name: "👤 Admin Profile", href: "/profile" },
  { name: "⚙️ Settings", href: "/settings" },
];

export default function AdminPage() {
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    async function checkRole() {
      const role = await getCurrentUserRole();

      if (role !== "admin") {
        window.location.href = "/login";
        return;
      }

      setAllowed(true);
    }

    checkRole();
  }, []);

  if (!allowed) {
    return <p className="p-6">Checking access...</p>;
  }

  async function logout() {
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-bold text-[#061B33]">
          GHO Admin Dashboard
        </h1>

        <button
          onClick={logout}
          className="bg-red-600 text-white px-4 py-2 rounded-lg font-bold"
        >
          Logout
        </button>
      </div>

      <p className="text-gray-600 mt-2">
        Manage all transport operations from one place.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
        {menuItems.map((item) => (
          <a
            key={item.href}
            href={item.href}
            className="bg-white rounded-xl shadow p-6 font-bold text-[#061B33] hover:bg-orange-50"
          >
            {item.name}
          </a>
        ))}
      </div>
    </main>
  );
}
