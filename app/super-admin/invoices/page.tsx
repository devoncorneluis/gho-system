"use client";

import { useEffect, useState } from "react";
import SuperAdminLayout from "../../../components/SuperAdminLayout";
import { supabase } from "../../../lib/supabase";
import { TRIP_STATUS } from "../../../lib/tripStatus";
import { generateInvoice } from "../../../lib/billing/invoiceGenerator";
import { saveInvoice } from "../../../lib/billing/saveInvoice";
import type { BillingSettings } from "../../../lib/billing/billingCalculator";

type Invoice = {
  id: string;
  invoice_number: string | null;
  total_trips: number | null;
  total_passengers: number | null;
  total_distance_km: number | null;
  subtotal: number | null;
  vat: number | null;
  total_amount: number | null;
  payment_status: string | null;
  paid_at: string | null;
  generated_at: string | null;
};

type Platform = {
  id: string;
  name: string;
};

type TripRow = {
  id: string;
  trip_code: string | null;
  distance_km: number | null;
  passenger_count: number | null;
};

export default function SuperAdminInvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [selectedPlatformId, setSelectedPlatformId] = useState("");
  const [loading, setLoading] = useState(false);

  const billingSettings: BillingSettings = {
    billingMethod: "per_trip",
    tripRate: 100,
    passengerRate: 0,
    monthlyFee: 0,
    distanceRate: 0,
    vatRate: 15,
  };

  async function loadInvoices() {
    const { data, error } = await supabase
      .from("invoices")
      .select(
        `
        id,
        invoice_number,
        total_trips,
        total_passengers,
        total_distance_km,
        subtotal,
        vat,
        total_amount,
        payment_status,
        paid_at,
        generated_at
      `
      )
      .order("generated_at", { ascending: false });

    if (error) {
      alert(error.message);
      return;
    }

    setInvoices(data || []);
  }

  async function loadPlatforms() {
    const { data, error } = await supabase
      .from("platforms")
      .select("id, name")
      .eq("active", true)
      .order("name");

    if (error) {
      alert(error.message);
      return;
    }

    setPlatforms(data || []);
  }
  async function updateInvoiceStatus(
    invoiceId: string,
    status: string
  ) {
    setLoading(true);

    try {
      const updateData: {
        payment_status: string;
        paid_at?: string | null;
      } = {
        payment_status: status,
      };

      if (status === "Paid") {
        updateData.paid_at = new Date().toISOString();
      } else {
        updateData.paid_at = null;
      }

const { data: updatedInvoice, error } = await supabase
  .from("invoices")
  .update(updateData)
  .eq("id", invoiceId)
  .select("id, invoice_number, payment_status, paid_at")
  .maybeSingle();

if (error) {
  throw error;
}

if (!updatedInvoice) {
  throw new Error(
    "Invoice update matched 0 rows. The invoice may be blocked by RLS or the invoice ID is incorrect."
  );
}
      if (error) {
        throw error;
      }

      await loadInvoices();
    } catch (error) {
      console.error("Invoice status update error:", error);

      if (error instanceof Error) {
        alert(error.message);
      } else {
        alert(String(error));
      }
    } finally {
      setLoading(false);
    }
  }
  function getBillingPeriod() {
    const today = new Date();

    const start = new Date(
      today.getFullYear(),
      today.getMonth(),
      1
    );

    const end = new Date(
      today.getFullYear(),
      today.getMonth() + 1,
      0
    );

    return {
      start: start.toISOString().slice(0, 10),
      end: end.toISOString().slice(0, 10),
    };
  }

  async function generatePlatformInvoice() {
    if (!selectedPlatformId) {
      alert("Please select a platform first.");
      return;
    }

    setLoading(true);

    try {
      const { data: trips, error: tripError } = await supabase
        .from("trips")
        .select(
          "id, trip_code, distance_km, passenger_count"
        )
        .eq("platform_id", selectedPlatformId)
        .eq("status", TRIP_STATUS.COMPLETED)
        .eq("billable", true)
        .eq("invoiced", false);

      if (tripError) {
        throw tripError;
      }

      if (!trips || trips.length === 0) {
        alert(
          "There are no completed, billable, uninvoiced trips for this platform."
        );
        return;
      }

      const invoiceTrips = (trips as TripRow[]).map(
        (trip) => ({
          tripId: trip.id,
          tripCode: trip.trip_code || trip.id,
          distanceKm: Number(trip.distance_km || 0),
          passengerCount: Number(
            trip.passenger_count || 0
          ),
        })
      );

      const billingPeriod = getBillingPeriod();

      const invoice = generateInvoice(
        invoiceTrips,
        billingSettings,
        `${billingPeriod.start} to ${billingPeriod.end}`
      );

      await saveInvoice(
        selectedPlatformId,
        billingPeriod.start,
        billingPeriod.end,
        invoice,
        billingSettings
      );

      alert(
        `Invoice ${invoice.invoiceNumber} generated successfully.\n\n` +
          `Trips: ${invoice.trips.length}\n` +
          `Subtotal: R${invoice.subtotal.toFixed(2)}\n` +
          `VAT: R${invoice.vat.toFixed(2)}\n` +
          `Total: R${invoice.total.toFixed(2)}`
      );

      setSelectedPlatformId("");
      await loadInvoices();
    } catch (error) {
      console.error("Invoice generation error:", error);

      if (error instanceof Error) {
        alert(error.message);
      } else {
        alert(String(error));
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadInvoices();
    loadPlatforms();
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
          <h2 className="text-xl font-bold mb-4">
            Generate Invoice
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <select
              value={selectedPlatformId}
              onChange={(e) =>
                setSelectedPlatformId(e.target.value)
              }
              className="border p-3 rounded-lg"
              disabled={loading}
            >
              <option value="">
                Select Platform
              </option>

              {platforms.map((platform) => (
                <option
                  key={platform.id}
                  value={platform.id}
                >
                  {platform.name}
                </option>
              ))}
            </select>

            <button
              className="bg-orange-500 text-white px-6 py-3 rounded-lg font-bold disabled:opacity-50"
              onClick={generatePlatformInvoice}
              disabled={loading}
            >
              {loading
                ? "Generating..."
                : "➕ Generate Invoice"}
            </button>
          </div>

          <div className="mt-4 text-sm text-gray-600">
            <p>
              Billing method:{" "}
              <strong>Per Trip</strong>
            </p>

            <p>
              Trip rate:{" "}
              <strong>R100.00</strong>
            </p>

            <p>
              VAT:{" "}
              <strong>15%</strong>
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow p-6 mt-6">
          {invoices.length === 0 ? (
            <p className="text-gray-500">
              No invoices generated yet.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="p-3">
                      Invoice
                    </th>

                    <th className="p-3">
                      Trips
                    </th>

                    <th className="p-3">
                      Passengers
                    </th>

                    <th className="p-3">
                      KM
                    </th>

                    <th className="p-3">
                      Subtotal
                    </th>

                    <th className="p-3">
                      VAT
                    </th>

                    <th className="p-3">
                      Total
                    </th>

                    <th className="p-3">
                      Status
                    </th>

                    <th className="p-3">
                      Created
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {invoices.map((invoice) => (
                    <tr
                      key={invoice.id}
                      className="border-b"
                    >
                      <td className="p-3 font-bold">
                        {invoice.invoice_number ||
                          "Draft"}
                      </td>

                      <td className="p-3">
                        {invoice.total_trips || 0}
                      </td>

                      <td className="p-3">
                        {invoice.total_passengers ||
                          0}
                      </td>

                      <td className="p-3">
                        {Number(
                          invoice.total_distance_km ||
                            0
                        ).toLocaleString()}{" "}
                        km
                      </td>

                      <td className="p-3">
                        R
                        {Number(
                          invoice.subtotal || 0
                        ).toLocaleString(
                          undefined,
                          {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          }
                        )}
                      </td>

                      <td className="p-3">
                        R
                        {Number(
                          invoice.vat || 0
                        ).toLocaleString(
                          undefined,
                          {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          }
                        )}
                      </td>

                      <td className="p-3 font-bold text-green-600">
                        R
                        {Number(
                          invoice.total_amount || 0
                        ).toLocaleString(
                          undefined,
                          {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          }
                        )}
                      </td>

<td className="p-3">
  <select
    value={invoice.payment_status || "Pending"}
    onChange={(e) =>
      updateInvoiceStatus(
        invoice.id,
        e.target.value
      )
    }
    disabled={loading}
    className="border rounded-lg px-3 py-2 text-sm"
  >
    <option value="Pending">
      Pending
    </option>

    <option value="Paid">
      Paid
    </option>

    <option value="Overdue">
      Overdue
    </option>

    <option value="Cancelled">
      Cancelled
    </option>
  </select>

  {invoice.paid_at && (
    <div className="text-xs text-gray-500 mt-1">
      Paid{" "}
      {new Date(
        invoice.paid_at
      ).toLocaleDateString()}
    </div>
  )}
</td>

                      <td className="p-3 text-sm">
                        {invoice.generated_at
                          ? new Date(
                              invoice.generated_at
                            ).toLocaleDateString()
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