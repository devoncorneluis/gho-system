"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { TRIP_STATUS } from "../../lib/tripStatus";

type Invoice = {
  id: string;
  platform_id: string | null;
  invoice_number: string;
  billing_period_start: string;
  billing_period_end: string;
  total_trips: number;
  total_amount: number;
  payment_status: string;
  subtotal: number;
  vat: number;
};


export default function BillingPage() {
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [, setStats] = useState({
  outstanding: 0,
  paid: 0,
  revenue: 0,
  completedTrips: 0,
});
  useEffect(() => {
    async function loadInvoices() {
const {
  data: { user },
} = await supabase.auth.getUser();

if (!user) return;

const { data: profile } = await supabase
  .from("user_profiles")
  .select("platform_id")
  .eq("id", user.id)
  .single();

if (!profile?.platform_id) return;

const { data, error } = await supabase
  .from("invoices")
  .select("*")
  .eq("platform_id", profile.platform_id)
  .order("generated_at", { ascending: false });

      if (!error) {
        setInvoices(data || []);
        const invoiceList = data || [];

setStats({
  outstanding: invoiceList.filter(
    (i) => i.payment_status === "Outstanding"
  ).length,

  paid: invoiceList.filter(
    (i) => i.payment_status === "Paid"
  ).length,

  revenue: invoiceList
    .filter((i) => i.payment_status === "Paid")
    .reduce((sum, i) => sum + Number(i.total_amount), 0),

  completedTrips: invoiceList.reduce(
    (sum, i) => sum + Number(i.total_trips),
    0
  ),
});
      }
    }

    loadInvoices();
  }, []);
async function generateInvoice() {
  const today = new Date().toISOString().split("T")[0];
  const startOfMonth = today.substring(0, 8) + "01";
const {
  data: { user },
} = await supabase.auth.getUser();

if (!user) {
  alert("User not found.");
  return;
}

const { data: profile } = await supabase
  .from("user_profiles")
  .select("platform_id")
  .eq("id", user.id)
  .single();

if (!profile?.platform_id) {
  alert("Platform not found.");
  return;
}
  // Prevent duplicate invoice
  const { data: existingInvoice } = await supabase
    .from("invoices")
    .select("id")
    .eq("billing_period_start", startOfMonth)
    .eq("billing_period_end", today)
    .maybeSingle();

  if (existingInvoice) {
    alert("An invoice has already been generated for today.");
    return;
  }

  // Load completed trips
// const today = new Date().toISOString().split("T")[0];
// const startOfMonth = today.substring(0, 8) + "01";

const { data: trips, error: tripsError } = await supabase
  .from("trips")
  .select("*")
  .eq("status", TRIP_STATUS.COMPLETED)
  .gte("trip_date", startOfMonth)
  .lte("trip_date", today);

  if (tripsError) {
    alert("Unable to load completed trips.");
    return;
  }

  // Load billing settings
  const { data: settings, error: settingsError } = await supabase
    .from("billing_settings")
    .select("*")
    .limit(1)
    .single();

  if (settingsError || !settings) {
    alert("No billing settings found.");
    return;
  }

  const totalTrips = trips?.length ?? 0;

  let subtotal = 0;

  switch (settings.billing_method) {
    case "per_trip":
      subtotal = totalTrips * Number(settings.trip_rate);
      break;

    case "monthly":
      subtotal = Number(settings.monthly_fee);
      break;

    default:
      subtotal = totalTrips * Number(settings.trip_rate);
      break;
  }

  const vat = subtotal * (Number(settings.vat_rate) / 100);
  const totalAmount = subtotal + vat;

  const invoiceNumber = `INV-${Date.now()}`;

  const { error: insertError } = await supabase
    .from("invoices")
.insert({
  platform_id: profile.platform_id,
  invoice_number: invoiceNumber,
  billing_period_start: startOfMonth,
  billing_period_end: today,
  total_trips: totalTrips,
  subtotal,
  vat,
  total_amount: totalAmount,
  payment_status: "Outstanding",
});

  if (insertError) {
    alert(insertError.message);
    return;
  }

  alert("Invoice generated successfully.");

const { data } = await supabase
  .from("invoices")
  .select("*")
  .eq("platform_id", profile.platform_id)
  .order("generated_at", { ascending: false });

  setInvoices(data || []);
}
return (
    <main className="min-h-screen bg-gray-100 p-6">
      <h1 className="mb-6 text-3xl font-bold text-[#061B33]">
        Billing Centre
      </h1>

      {/* KPI Cards */}
      <div className="mb-8 grid gap-4 md:grid-cols-4">
        <div className="rounded-xl bg-white p-5 shadow">
          <h2 className="text-sm text-gray-500">Outstanding Invoices</h2>
          <p className="mt-2 text-3xl font-bold text-red-600">0</p>
        </div>

        <div className="rounded-xl bg-white p-5 shadow">
          <h2 className="text-sm text-gray-500">Paid This Month</h2>
          <p className="mt-2 text-3xl font-bold text-green-600">$0.00</p>
        </div>

        <div className="rounded-xl bg-white p-5 shadow">
          <h2 className="text-sm text-gray-500">Completed Trips</h2>
          <p className="mt-2 text-3xl font-bold text-blue-600">0</p>
        </div>

        <div className="rounded-xl bg-white p-5 shadow">
          <h2 className="text-sm text-gray-500">Revenue This Month</h2>
          <p className="mt-2 text-3xl font-bold text-orange-600">$0.00</p>
        </div>
      </div>

      {/* Generate Invoice */}
      <div className="mb-6">
        <button
onClick={generateInvoice}
          className="rounded-xl bg-[#F97316] px-5 py-3 font-bold text-white hover:bg-orange-600"
        >
          Generate Invoice
        </button>
      </div>

      {/* Invoice Table */}
      <div className="overflow-hidden rounded-xl bg-white shadow">
        <table className="min-w-full">
          <thead className="bg-[#061B33] text-white">
            <tr>
              <th className="p-3 text-left">Invoice #</th>
              <th className="p-3 text-left">Company</th>
              <th className="p-3 text-left">Billing Period</th>
              <th className="p-3 text-left">Trips</th>
              <th className="p-3 text-left">Amount</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-center">Action</th>
            </tr>
          </thead>

<tbody>
  {invoices.length === 0 ? (
    <tr>
      <td
        colSpan={7}
        className="p-8 text-center text-gray-500"
      >
        No invoices generated yet.
      </td>
    </tr>
  ) : (
    invoices.map((invoice) => (
      <tr key={invoice.id} className="border-t">
        <td className="p-3">{invoice.invoice_number}</td>

        <td className="p-3">Platform</td>

        <td className="p-3">
          {invoice.billing_period_start} - {invoice.billing_period_end}
        </td>

        <td className="p-3">{invoice.total_trips}</td>

        <td className="p-3">
          ${invoice.total_amount.toFixed(2)}
        </td>

        <td className="p-3">{invoice.payment_status}</td>

<td className="p-3 text-center">
  <Link
    href={`/billing/${invoice.id}`}
    className="font-semibold text-blue-600 hover:underline"
  >
    View
  </Link>
</td>
      </tr>
    ))
  )}
</tbody>
        </table>
      </div>
    </main>
  );
}