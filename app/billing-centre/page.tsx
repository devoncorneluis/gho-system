"use client";

import { useCallback, useEffect, useState } from "react";
import AdminLayout from "../../components/AdminLayout";
import { supabase } from "../../lib/supabase";
import { getUserPlatform } from "../../lib/getUserPlatform";
import { generateInvoicesForCycle } from "../../lib/billing/generateInvoicesForCycle";
type Invoice = {
  id: string;
  invoice_number: string;
  total_amount: number;
  payment_status: string;
  created_at: string;
};

export default function BillingCentrePage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
const [generating, setGenerating] =
  useState(false);
  const [outstanding, setOutstanding] = useState(0);
  const [paid, setPaid] = useState(0);
  const [revenue, setRevenue] = useState(0);

  const loadInvoices = useCallback(async () => {
    const userPlatform = await getUserPlatform();

    if (!userPlatform) return;

    const { data } = await supabase
      .from("invoices")
      .select("*")
      .eq("platform_id", userPlatform.platformId)
      .order("created_at", {
        ascending: false,
      });

    const rows = data ?? [];

    setInvoices(rows);

    setOutstanding(
      rows.filter(
        (i) => i.payment_status === "Pending"
      ).length
    );

    setPaid(
      rows.filter(
        (i) => i.payment_status === "Paid"
      ).length
    );

    setRevenue(
      rows.reduce(
        (sum, invoice) => sum + Number(invoice.total_amount),
        0
      )
    );

    setLoading(false);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadInvoices();
  }, [loadInvoices]);
async function handleGenerateBilling() {
  try {
    setGenerating(true);

    const userPlatform =
      await getUserPlatform();

    if (!userPlatform) {
      alert("Platform not found.");
      return;
    }

    const { data: cycle } =
      await supabase
        .from("billing_cycles")
        .select("*")
        .eq("platform_id", userPlatform.platformId)
        .eq("status", "Open")
        .order("start_date", {
          ascending: false,
        })
        .limit(1)
        .single();

    if (!cycle) {
      alert(
        "No open billing cycle found."
      );
      return;
    }

    const result =
      await generateInvoicesForCycle(
        userPlatform.platformId,
        cycle.id
      );

    alert(
      `Created ${result.invoicesCreated} invoice(s) for ${result.tripsProcessed} trip(s).`
    );

    await loadInvoices();

  } catch (error) {
    console.error(error);

    alert(
      "Unable to generate billing."
    );

  } finally {
    setGenerating(false);
  }
}
  return (
    <AdminLayout>
      <main className="min-h-screen bg-gray-100 p-6">

        <div className="mb-8">

          <p className="text-sm font-bold uppercase text-orange-500">
            GHO Billing
          </p>

          <h1 className="text-4xl font-black text-[#061B33]">
            Billing Centre
          </h1>

          <p className="mt-2 text-gray-600">
            Enterprise billing and invoice management.
          </p>

          <div className="mt-5">
            <button
              onClick={handleGenerateBilling}
              disabled={generating}
              className="rounded-xl bg-[#061B33] px-5 py-3 text-sm font-bold text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {generating ? "Generating..." : "Generate Billing For Open Cycle"}
            </button>
          </div>

        </div>

        <div className="mb-8 grid gap-6 md:grid-cols-3">

          <div className="rounded-2xl bg-white p-6 shadow">

            <p className="text-sm text-gray-500">
              Outstanding
            </p>

            <p className="mt-3 text-5xl font-black text-red-600">
              {outstanding}
            </p>

          </div>

          <div className="rounded-2xl bg-white p-6 shadow">

            <p className="text-sm text-gray-500">
              Paid
            </p>

            <p className="mt-3 text-5xl font-black text-green-600">
              {paid}
            </p>

          </div>

          <div className="rounded-2xl bg-white p-6 shadow">

            <p className="text-sm text-gray-500">
              Revenue
            </p>

            <p className="mt-3 text-5xl font-black text-[#061B33]">
              R {revenue.toFixed(2)}
            </p>

          </div>

        </div>

        <div className="overflow-hidden rounded-2xl bg-white shadow">

          {loading ? (

            <div className="p-8 text-center">
              Loading invoices...
            </div>

          ) : invoices.length === 0 ? (

            <div className="p-8 text-center text-gray-500">
              No invoices available.
            </div>

          ) : (

            <table className="w-full">

              <thead className="bg-gray-100">

                <tr>

                  <th className="p-4 text-left">
                    Invoice
                  </th>

                  <th className="p-4 text-left">
                    Total
                  </th>

                  <th className="p-4 text-left">
                    Status
                  </th>

                  <th className="p-4 text-left">
                    Created
                  </th>

                </tr>

              </thead>

              <tbody>

                {invoices.map((invoice) => (

                  <tr
                    key={invoice.id}
                    className="border-t"
                  >

                    <td className="p-4 font-semibold">
                      {invoice.invoice_number}
                    </td>

                    <td className="p-4">
                      R {Number(invoice.total_amount).toFixed(2)}
                    </td>

                    <td className="p-4">
                      {invoice.payment_status}
                    </td>

                    <td className="p-4">
                      {new Date(
                        invoice.created_at
                      ).toLocaleDateString()}
                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          )}

        </div>

      </main>
    </AdminLayout>
  );
}