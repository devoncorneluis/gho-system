"use client";

import { useEffect, useState } from "react";
import SuperAdminLayout from "../../../components/SuperAdminLayout";
import { supabase } from "../../../lib/supabase";

type Platform = {
  id: string;
  name: string;
  company_name: string | null;
  package_name: string | null;
  status: string | null;
};

type Trip = {
  id: string;
  platform_id: string | null;
  status: string | null;
};

function rateForPackage(packageName: string | null) {
  if (packageName === "Professional") return 18;
  if (packageName === "Enterprise") return 15;
  return 20;
}

export default function SuperAdminBillingPage() {
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [trips, setTrips] = useState<Trip[]>([]);

  async function loadBilling() {
    const { data: platformData, error: platformError } = await supabase
      .from("platforms")
      .select("id, name, company_name, package_name, status")
      .order("created_at", { ascending: false });

    if (platformError) {
      alert(platformError.message);
      return;
    }

    const { data: tripData, error: tripError } = await supabase
      .from("trips")
      .select("id, platform_id, status");

    if (tripError) {
      alert(tripError.message);
      return;
    }

    setPlatforms(platformData || []);
    setTrips(tripData || []);
  }

  useEffect(() => {
    loadBilling();
  }, []);

  const billingRows = platforms.map((platform) => {
    const completedTrips = trips.filter(
      (trip) => trip.platform_id === platform.id && trip.status === "Completed"
    ).length;

    const rate = rateForPackage(platform.package_name);
    const amount = completedTrips * rate;

    return {
      ...platform,
      completedTrips,
      rate,
      amount,
      invoiceStatus: amount > 0 ? "Unbilled" : "No Activity",
    };
  });

  const totalRevenue = billingRows.reduce((sum, row) => sum + row.amount, 0);
  const activePlatforms = platforms.filter((p) => p.status === "Active").length;
  const billablePlatforms = billingRows.filter((row) => row.amount > 0).length;
  const totalCompletedTrips = billingRows.reduce(
    (sum, row) => sum + row.completedTrips,
    0
  );

  return (
    <SuperAdminLayout>
      <main className="min-h-screen bg-[#F3F6FA] p-6">
        <section className="rounded-3xl bg-[#061B33] text-white p-8 shadow-xl">
          <p className="text-orange-400 font-bold tracking-wide uppercase">
            Corneluis Group Pty Ltd
          </p>

          <h1 className="text-4xl md:text-5xl font-black mt-2">
            Billing Dashboard
          </h1>

          <p className="text-gray-300 mt-3">
            View platform billing, completed trips, and estimated monthly revenue.
          </p>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-white rounded-2xl shadow p-5">
            <p className="font-bold text-gray-600">Estimated Revenue</p>
            <p className="text-4xl font-black text-green-600">
              R{totalRevenue.toLocaleString()}
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow p-5">
            <p className="font-bold text-gray-600">Completed Trips</p>
            <p className="text-4xl font-black text-[#061B33]">
              {totalCompletedTrips}
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow p-5">
            <p className="font-bold text-gray-600">Active Platforms</p>
            <p className="text-4xl font-black text-orange-500">
              {activePlatforms}
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow p-5">
            <p className="font-bold text-gray-600">Billable Platforms</p>
            <p className="text-4xl font-black text-blue-600">
              {billablePlatforms}
            </p>
          </div>
        </section>

        <section className="bg-white rounded-2xl shadow p-6 mt-6">
          <h2 className="text-2xl font-black text-[#061B33]">
            Platform Billing
          </h2>

          <div className="overflow-x-auto mt-5">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="p-3">Platform</th>
                  <th className="p-3">Company</th>
                  <th className="p-3">Package</th>
                  <th className="p-3">Rate</th>
                  <th className="p-3">Completed Trips</th>
                  <th className="p-3">Amount</th>
                  <th className="p-3">Invoice Status</th>
                </tr>
              </thead>

              <tbody>
                {billingRows.map((row) => (
                  <tr key={row.id} className="border-b">
                    <td className="p-3 font-bold">{row.name}</td>
                    <td className="p-3">{row.company_name || "Not set"}</td>
                    <td className="p-3">{row.package_name || "Starter"}</td>
                    <td className="p-3">R{row.rate}</td>
                    <td className="p-3">{row.completedTrips}</td>
                    <td className="p-3 font-bold text-green-600">
                      R{row.amount.toLocaleString()}
                    </td>
                    <td className="p-3">{row.invoiceStatus}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </SuperAdminLayout>
  );
}
