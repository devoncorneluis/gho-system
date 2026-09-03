"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import SuperAdminSidebar from "./SuperAdminSidebar";

export default function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  function logout() {
    window.location.href = "/login";
  }

  return (
    <div className="min-h-screen flex bg-gray-100">
      <aside className="w-72 bg-[#061B33] text-white p-5 min-h-screen">
        <h1 className="text-3xl font-black mb-2">GHO</h1>
        <p className="text-sm text-orange-400 font-bold mb-6">
          Super Admin
        </p>

        <button
          onClick={() => router.back()}
          className="w-full bg-white text-[#061B33] rounded-xl px-4 py-3 font-bold mb-4"
        >
          ← Back
        </button>

        <Link
          href="/super-admin"
          className="block bg-orange-500 hover:bg-orange-600 rounded-xl px-4 py-3 font-bold mb-4 text-center"
        >
          🏠 Super Admin Home
        </Link>

        <SuperAdminSidebar />

        <div className="mt-6">
          <button
            onClick={logout}
            className="w-full bg-red-600 hover:bg-red-700 rounded-xl px-4 py-3 font-bold"
          >
            🚪 Logout
          </button>
        </div>
      </aside>

      <section className="flex-1">
        {children}
      </section>
    </div>
  );
}
