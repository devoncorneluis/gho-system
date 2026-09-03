"use client";

import AdminLayout from "../../components/AdminLayout";

export default function AuditPage() {
  return (
    <AdminLayout>
      <main className="min-h-screen bg-gray-100 p-6">

        <div className="mb-8">

          <h1 className="text-4xl font-black text-[#061B33]">
            Audit Centre
          </h1>

          <p className="mt-2 text-gray-500">
            Monitor every operational activity across
            your transport platform.
          </p>

        </div>

        <div className="grid gap-6 md:grid-cols-4">

          <div className="rounded-2xl bg-white p-6 shadow">
            <p className="text-sm text-gray-500">
                Today&apos;s Events
            </p>

            <h2 className="mt-3 text-3xl font-black">
              0
            </h2>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow">
            <p className="text-sm text-gray-500">
              Billing Events
            </p>

            <h2 className="mt-3 text-3xl font-black">
              0
            </h2>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow">
            <p className="text-sm text-gray-500">
              Driver Events
            </p>

            <h2 className="mt-3 text-3xl font-black">
              0
            </h2>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow">
            <p className="text-sm text-gray-500">
              Emergency Events
            </p>

            <h2 className="mt-3 text-3xl font-black">
              0
            </h2>
          </div>

        </div>

      </main>
    </AdminLayout>
  );
}