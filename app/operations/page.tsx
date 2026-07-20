"use client";

import AdminLayout from "../../components/AdminLayout";
import OperationsGrid from "../../components/operations/OperationsGrid";

export default function OperationsPage() {
  return (
    <AdminLayout>
      <main className="min-h-screen bg-gray-100 p-6">
        <div className="mb-8 rounded-3xl bg-white p-8 shadow-sm border border-gray-200">
          <p className="text-sm font-semibold uppercase text-gray-500">GHO Operations Control Tower</p>
          <h1 className="mt-3 text-4xl font-black text-[#061B33]">Decision Support Command Surface</h1>
          <p className="mt-2 text-gray-600 max-w-2xl">
            Automation, intelligence, and analytics feed this dashboard. The page remains a thin presentation layer.
          </p>
        </div>

        <OperationsGrid />
      </main>
    </AdminLayout>
  );
}
