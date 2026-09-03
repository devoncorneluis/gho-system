"use client";

import SuperAdminLayout from "../../../components/SuperAdminLayout";

export default function PlatformSettingsPage() {
  return (
    <SuperAdminLayout>
      <main className="min-h-screen bg-gray-100 p-8">

        <h1 className="text-4xl font-black text-[#061B33]">
          Platform Settings
        </h1>

        <p className="mt-2 text-gray-600">
          Configure platform-wide settings for the GHO system.
        </p>

        <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
          <h2 className="text-2xl font-bold text-[#061B33]">
            Coming in RC1
          </h2>

          <p className="mt-3 text-gray-600">
            This page will include global configuration options, security settings,
            feature toggles, and platform defaults.
          </p>
        </div>

      </main>
    </SuperAdminLayout>
  );
}
