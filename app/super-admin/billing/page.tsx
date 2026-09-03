"use client";

import { useEffect, useState } from "react";
import SuperAdminLayout from "../../../components/SuperAdminLayout";
import { supabase } from "../../../lib/supabase";

type Invoice = {
  id: string;
  total_trips: number | null;
  total_distance_km: number | null;
  total_amount: number | null;
  payment_status: string | null;
};

export default function SuperAdminBillingPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);

  async function loadBillingData() {
    const { data, error } = await supabase
      .from("invoices")
      .select(
        "id, total_trips, total_distance_km, total_amount, payment_status"
      );

    if (error) {
      alert(error.message);
      return;
    }

    setInvoices(data || []);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadBillingData();
  }, []);

  const completedTrips = invoices.reduce(
    (sum, invoice) => sum + Number(invoice.total_trips || 0),
    0
  );

  const totalKm = invoices.reduce(
    (sum, invoice) => sum + Number(invoice.total_distance_km || 0),
    0
  );

  const totalValue = invoices.reduce(
    (sum, invoice) => sum + Number(invoice.total_amount || 0),
    0
  );

  const outstandingInvoices = invoices.filter(
    (invoice) => invoice.payment_status !== "Paid"
  ).length;

  return (
    <SuperAdminLayout>
      <main className="min-h-screen bg-gray-100 p-6">

        <h1 className="text-4xl font-black text-[#061B33]">
          Billing Dashboard
        </h1>

        <p className="mt-2 text-gray-600">
          Company billing overview for trips, kilometers, invoices, and billing cycles.
        </p>

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-4">

          <div className="rounded-2xl bg-white p-5 shadow">
            <p className="font-bold text-gray-500">
              Completed Trips
            </p>

            <p className="text-4xl font-black text-[#061B33]">
              {completedTrips}
            </p>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow">
            <p className="font-bold text-gray-500">
              Total KM
            </p>

            <p className="text-4xl font-black text-orange-500">
              {totalKm.toLocaleString()} km
            </p>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow">
            <p className="font-bold text-gray-500">
              Invoice Value
            </p>

            <p className="text-4xl font-black text-[#061B33]">
              R {totalValue.toFixed(2)}
            </p>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow">
            <p className="font-bold text-gray-500">
              Outstanding Invoices
            </p>

            <p className="text-4xl font-black text-red-600">
              {outstandingInvoices}
            </p>
          </div>

        </div>

      </main>
    </SuperAdminLayout>
  );
}