"use client";

import SuperAdminLayout from "../../../components/SuperAdminLayout";

export default function ProfilePage() {
  return (
    <SuperAdminLayout>
      <main className="min-h-screen bg-gray-100 p-8">

        <h1 className="text-4xl font-black text-[#061B33]">
          My Profile
        </h1>

        <p className="mt-2 text-gray-600">
          Manage your Super Administrator account, profile information and security preferences.
        </p>

        <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
          <h2 className="text-2xl font-bold text-[#061B33]">
            Coming in RC1
          </h2>

          <p className="mt-3 text-gray-600">
            This page will allow super admins to update their display name, email,
            change password, and configure two-factor authentication and notification preferences.
          </p>
        </div>

      </main>
    </SuperAdminLayout>
  );
}
