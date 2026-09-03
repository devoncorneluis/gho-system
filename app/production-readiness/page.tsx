"use client";

import AdminLayout from "../../components/AdminLayout";
import ReadinessChecklist from "../../components/production/ReadinessChecklist";

export default function ProductionReadinessPage() {
  return (
    <AdminLayout>
      <main className="min-h-screen bg-gray-100 p-6">

        <div className="mb-8">

          <h1 className="text-4xl font-black text-[#061B33]">
            Production Readiness
          </h1>

          <p className="mt-2 text-gray-500">
            Track the release readiness of GHO
            before deployment.
          </p>

        </div>

        <ReadinessChecklist />

      </main>
    </AdminLayout>
  );
}
