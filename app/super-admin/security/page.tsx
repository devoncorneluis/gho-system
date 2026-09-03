"use client";

import SuperAdminLayout from "../../../components/SuperAdminLayout";

export default function SecurityPage() {
  return (
    <SuperAdminLayout>
      <main className="min-h-screen bg-gray-100 p-8">

        <h1 className="text-4xl font-black text-[#061B33]">
          Security Centre
        </h1>

        <p className="mt-2 text-gray-600">
          Monitor platform security, authentication and access across GHO.
        </p>

        <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
          <h2 className="text-2xl font-bold text-[#061B33]">
            Coming in RC1
          </h2>

          <p className="mt-3 text-gray-600">
            This page will contain security monitoring,
            authentication activity,
            failed login attempts,
            role management
            and platform security events.
          </p>
        </div>

      </main>
    </SuperAdminLayout>
  );
}