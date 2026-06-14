"use client";

import { useEffect, useState } from "react";
import SuperAdminLayout from "../../../components/SuperAdminLayout";
import { supabase } from "../../../lib/supabase";

type Invoice = {
  id: string;
  completed_trips: number | null;
  total_km: number | null;
  total_amount: number | null;
  status: string | null;
};

export default function SuperAdminBillingPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);

  async function loadBillingData() {
    const { data, error } = await supabase
      .from("invoices")
      .select("id, completed_trips, total_km, total_amount, status");

    if (error) {
      alert(error.message);
      return;
    }

    setInvoices(data || []);
  }

  useEffect(() => {
    loadBillingData();
  }, []);

  const completedTrips = invoices.reduce(
    (sum, invoice) => sum + Number(invoice.completed_trips || 0),
    0
  );

  const totalKm = invoices.reduce(
    (sum, invoice) => sum + Number(invoice.total_km || 0),
    0
  );

  const totalValue = invoices.reduce(
    (sum, invoice) => sum + Number(invoice.total_amount || 0),
    0
  );

  const outstandingInvoices = invoices.filter(
    (invoice) => invoice.status !== "Paid"
  ).length;

  return (
    <SuperAdminLayout>
      <main className="min-h-screen bg-gray-100 p-6">
        <h1 className="text-4xl font-black text-[#061B33]">
          Billing Dashboard
        </h1>

        <p className="text-gray-600 mt-2">
          Company billing overview for trips, kilometers, invoices, and billing cycles.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-white rounded-2xl shadow p-5">
            <p className="text-gray-500 font-bold">Completed Trips</p>
            <p className="text-4xl font-black text-[#061B33]">{completedTrips}</p>
          </div>

          <div className="bg-white rounded-2xl shadow p-5">
            <p className="text-gray-500 font-bold">Total KM</p>
            <p className="text-4xl font-black text-orange-500">
              {totalKm.toLocaleString()} km
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow p-5">
            <p className="text-gray-500 font-bold">Invoice Value</p>
            <p className="text-4xl font-black text-green-600">
              R{totalValue.toLocaleString()}
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow p-5">
            <p className="text-gray-500 font-bold">Outstanding</p>
            <p className="text-4xl font-black text-red-600">
              {outstandingInvoices}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow p-6 mt-6">
          <h2 className="text-xl font-black text-[#061B33]">
            Billing Rules
          </h2>

          <p className="text-gray-600 mt-3">
            GHO billing is based on completed company/platform trips and billing-cycle totals.
            It is not an Uber-style per-second or on-demand billing model.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5">
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="font-bold">Default Billing Cycle</p>
              <p className="text-gray-500 mt-1">Every second week</p>
            </div>

            <div className="bg-gray-50 rounded-xl p-4">
              <p className="font-bold">Invoice Day</p>
              <p className="text-gray-500 mt-1">8th day or company terms</p>
            </div>

            <div className="bg-gray-50 rounded-xl p-4">
              <p className="font-bold">Billing Basis</p>
              <p className="text-gray-500 mt-1">Completed trips + KM visibility</p>
            </div>
          </div>
        </div>
      </main>
    </SuperAdminLayout>
  );
}
