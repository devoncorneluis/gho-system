"use client";

import { useEffect, useState } from "react";
import SuperAdminLayout from "../../../components/SuperAdminLayout";
import { supabase } from "../../../lib/supabase";

type Invoice = {
  id: string;
  invoice_number: string | null;
  company_name: string | null;
  completed_trips: number | null;
  contract_type: string | null;
  contract_rate: number | null;
  total_amount: number | null;
  status: string | null;
  created_at: string | null;
};

type Platform = {
  id: string;
  name: string;
  company_name: string | null;
  contract_type: string | null;
  contract_rate: number | null;
  invoice_day: number | null;
};

export default function SuperAdminInvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [selectedPlatformId, setSelectedPlatformId] = useState("");

  async function loadInvoices() {
    const { data, error } = await supabase
      .from("invoices")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      alert(error.message);
      return;
    }

    setInvoices(data || []);

    const { data: platformData, error: platformError } = await supabase
      .from("platforms")
      .select("id, name, company_name, contract_type, contract_rate, invoice_day")
      .order("created_at", { ascending: false });

    if (platformError) {
      alert(platformError.message);
      return;
    }

    setPlatforms(platformData || []);
  }

  function nextInvoiceNumber() {
    const year = new Date().getFullYear();
    const nextNumber = String(invoices.length + 1).padStart(5, "0");
    return `GHO-${year}-${nextNumber}`;
  }

  async function generateInvoice() {
    if (!selectedPlatformId) {
      alert("Please select a platform first.");
      return;
    }

    const platform = platforms.find((item) => item.id === selectedPlatformId);

    if (!platform) {
      alert("Platform not found.");
      return;
    }

    const { data: completedTrips, error: tripError } = await supabase
      .from("trips")
      .select("id")
      .eq("platform_id", selectedPlatformId)
      .eq("status", "Completed");

    if (tripError) {
      alert(tripError.message);
      return;
    }

    const tripCount = completedTrips?.length || 0;
    const contractType = platform.contract_type || "Per Trip";
    const contractRate = Number(platform.contract_rate || 0);
    const totalAmount =
      contractType === "Fixed Contract" ? contractRate : tripCount * contractRate;

    const today = new Date();
    const dueDate = new Date(today);
    dueDate.setDate(platform.invoice_day || 8);

    const { error } = await supabase.from("invoices").insert({
      platform_id: platform.id,
      invoice_number: nextInvoiceNumber(),
      invoice_month: `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`,
      billing_period_start: new Date(today.getFullYear(), today.getMonth(), 1).toISOString().slice(0, 10),
      billing_period_end: new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().slice(0, 10),
      company_name: platform.company_name || platform.name,
      completed_trips: tripCount,
      contract_type: contractType,
      contract_rate: contractRate,
      subtotal: totalAmount,
      vat_amount: 0,
      total_amount: totalAmount,
      due_date: dueDate.toISOString().slice(0, 10),
      status: "Generated",
    });

    if (error) {
      alert(error.message);
      return;
    }

    setSelectedPlatformId("");
    loadInvoices();
  }

  useEffect(() => {
    loadInvoices();
  }, []);

  return (
    <SuperAdminLayout>
      <main className="min-h-screen bg-gray-100 p-6">
        <h1 className="text-4xl font-black text-[#061B33]">
          Invoices
        </h1>

        <p className="text-gray-600 mt-2">
          Generate, track, and manage company invoices.
        </p>

        <div className="bg-white rounded-2xl shadow p-6 mt-6">
          <h2 className="text-xl font-bold mb-4">Generate Invoice</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <select
              value={selectedPlatformId}
              onChange={(e) => setSelectedPlatformId(e.target.value)}
              className="border p-3 rounded-lg"
            >
              <option value="">Select Platform</option>
              {platforms.map((platform) => (
                <option key={platform.id} value={platform.id}>
                  {platform.name} - {platform.company_name}
                </option>
              ))}
            </select>

            <button
              className="bg-orange-500 text-white px-6 py-3 rounded-lg font-bold"
              onClick={generateInvoice}
            >
              ➕ Generate Invoice
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow p-6 mt-6">
          {invoices.length === 0 ? (
            <p className="text-gray-500">No invoices generated yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="p-3">Invoice</th>
                    <th className="p-3">Company</th>
                    <th className="p-3">Trips</th>
                    <th className="p-3">Contract</th>
                    <th className="p-3">Total</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Created</th>
                  </tr>
                </thead>

                <tbody>
                  {invoices.map((invoice) => (
                    <tr key={invoice.id} className="border-b">
                      <td className="p-3 font-bold">
                        {invoice.invoice_number || "Draft"}
                      </td>
                      <td className="p-3">{invoice.company_name}</td>
                      <td className="p-3">{invoice.completed_trips || 0}</td>
                      <td className="p-3">
                        {invoice.contract_type || "Per Trip"} - R
                        {invoice.contract_rate || 0}
                      </td>
                      <td className="p-3 font-bold text-green-600">
                        R{Number(invoice.total_amount || 0).toLocaleString()}
                      </td>
                      <td className="p-3">{invoice.status || "Draft"}</td>
                      <td className="p-3 text-sm">
                        {invoice.created_at
                          ? new Date(invoice.created_at).toLocaleDateString()
                          : "Unknown"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </SuperAdminLayout>
  );
}
