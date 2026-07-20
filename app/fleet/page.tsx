"use client";

import AdminLayout from "../../components/AdminLayout";

export default function FleetPage() {
  return (
    <AdminLayout>
      <main className="min-h-screen bg-gray-100 p-6">
        <h1 className="text-4xl font-black text-[#061B33]">
          🚐 Fleet Command Centre
        </h1>

        <p className="mt-2 text-gray-600">
          Manage vehicles, drivers and fleet operations.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">

          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="font-bold">Vehicles</h2>
            <p className="text-5xl font-black mt-3">0</p>
          </div>

          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="font-bold">Available</h2>
            <p className="text-5xl font-black mt-3">0</p>
          </div>

          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="font-bold">Assigned</h2>
            <p className="text-5xl font-black mt-3">0</p>
          </div>

          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="font-bold">Maintenance</h2>
            <p className="text-5xl font-black mt-3">0</p>
          </div>

        </div>
      </main>
    </AdminLayout>
  );
}