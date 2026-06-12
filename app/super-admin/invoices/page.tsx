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

export default function SuperAdminInvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);

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
