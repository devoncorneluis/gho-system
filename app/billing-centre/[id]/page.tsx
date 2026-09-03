"use client";

import { use, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import AdminLayout from "../../../components/AdminLayout";
import { supabase } from "../../../lib/supabase";
import { recordPayment } from "../../../lib/billing/recordPayment";
type Invoice = {
  id: string;
  platform_id: string;
  invoice_number: string;
  subtotal: number;
  vat: number;
  total: number;
  payment_status: string;
  created_at: string;
};

type InvoiceItem = {
  id: string;
  trip_code: string | null;
  description: string | null;
  quantity: number;
  unit_price: number;
  total: number;
};

export default function InvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingPayment, setProcessingPayment] =
    useState(false);

  const loadInvoice = useCallback(async () => {
    const { data: invoiceData } = await supabase
      .from("invoices")
      .select("*")
      .eq("id", id)
      .single();

    const { data: itemData } = await supabase
      .from("invoice_items")
      .select("*")
      .eq("invoice_id", id)
      .order("trip_code");

    setInvoice(invoiceData);
    setItems(itemData ?? []);
    setLoading(false);
  }, [id]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadInvoice();
  }, [loadInvoice]);

  async function handleRecordPayment() {
    if (!invoice) return;

    try {
      setProcessingPayment(true);

      await recordPayment({
        platformId: invoice.platform_id,
        invoiceId: invoice.id,
        amount: Number(invoice.total),
        paymentMethod: "Manual",
        paymentReference: invoice.invoice_number,
      });

      alert("Payment recorded successfully.");

      await loadInvoice();
    } catch (error) {
      console.error(error);
      alert("Unable to record payment.");
    } finally {
      setProcessingPayment(false);
    }
  }

  if (loading) {
    return (
      <AdminLayout>
        <main className="min-h-screen bg-gray-100 p-6">
          Loading invoice...
        </main>
      </AdminLayout>
    );
  }

  if (!invoice) {
    return (
      <AdminLayout>
        <main className="min-h-screen bg-gray-100 p-6">
          Invoice not found.
        </main>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <main className="min-h-screen bg-gray-100 p-6">

        <Link
          href="/billing-centre"
          className="font-semibold text-blue-600"
        >
          ← Back to Billing Centre
        </Link>

        <div className="mt-6 rounded-3xl bg-white p-8 shadow">

          <h1 className="text-4xl font-black text-[#061B33]">
            {invoice.invoice_number}
          </h1>

          <p className="mt-2 text-gray-500">
            Created {new Date(invoice.created_at).toLocaleDateString()}
          </p>

        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-4">

          <div className="rounded-2xl bg-white p-6 shadow">
            <p className="text-sm text-gray-500">Subtotal</p>
            <p className="mt-3 text-3xl font-black">
              R {Number(invoice.subtotal).toFixed(2)}
            </p>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow">
            <p className="text-sm text-gray-500">VAT</p>
            <p className="mt-3 text-3xl font-black">
              R {Number(invoice.vat).toFixed(2)}
            </p>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow">
            <p className="text-sm text-gray-500">Total</p>
            <p className="mt-3 text-3xl font-black text-[#061B33]">
              R {Number(invoice.total).toFixed(2)}
            </p>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow">
            <p className="text-sm text-gray-500">Status</p>
            <p className="mt-3 text-3xl font-black text-green-600">
              {invoice.payment_status}
            </p>
          </div>

        </div>

        <div className="mt-8 rounded-2xl bg-white shadow overflow-hidden">

          <table className="w-full">

            <thead className="bg-gray-100">

              <tr>
                <th className="p-4 text-left">Trip</th>
                <th className="p-4 text-left">Description</th>
                <th className="p-4 text-left">Qty</th>
                <th className="p-4 text-left">Unit Price</th>
                <th className="p-4 text-left">Total</th>
              </tr>

            </thead>

            <tbody>

              {items.map((item) => (

                <tr
                  key={item.id}
                  className="border-t"
                >

                  <td className="p-4 font-semibold">
                    {item.trip_code}
                  </td>

                  <td className="p-4">
                    {item.description}
                  </td>

                  <td className="p-4">
                    {item.quantity}
                  </td>

                  <td className="p-4">
                    R {Number(item.unit_price).toFixed(2)}
                  </td>

                  <td className="p-4">
                    R {Number(item.total).toFixed(2)}
                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

        <div className="mt-8 flex gap-4">

          <button
            onClick={handleRecordPayment}
            disabled={processingPayment}
            className="rounded-xl bg-green-600 px-6 py-3 font-semibold text-white disabled:opacity-50"
          >
            {processingPayment
              ? "Recording..."
              : "Record Payment"}
          </button>

          <button
            className="rounded-xl bg-[#061B33] px-6 py-3 font-semibold text-white"
          >
            Download PDF
          </button>

        </div>

      </main>
    </AdminLayout>
  );
}
