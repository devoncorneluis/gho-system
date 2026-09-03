import { supabase } from "../supabase";

import { loadBillingSettings } from "./loadBillingSettings";

import {
  generateInvoice,
  InvoiceTrip,
} from "./invoiceGenerator";

import { saveInvoice } from "./saveInvoice";

export type BillingRunResult = {
  billingCycleId: string;

  invoicesCreated: number;

  tripsProcessed: number;

  subtotal: number;

  vat: number;

  total: number;

  invoiceIds: string[];
};

export async function generateInvoicesForCycle(
  platformId: string,
  billingCycleId: string
): Promise<BillingRunResult> {

  const settings =
    await loadBillingSettings(
      platformId
    );

  const { data: billingCycle, error: billingCycleError } =
    await supabase
      .from("billing_cycles")
.select("id, cycle_name, start_date, end_date")
      .eq("id", billingCycleId)
      .eq("platform_id", platformId)
      .single();

  if (billingCycleError || !billingCycle) {
    throw billingCycleError || new Error("Billing cycle not found.");
  }

  const { data: trips } =
    await supabase
      .from("trips")
      .select("*")
      .eq("platform_id", platformId)
      .eq("billable", true)
      .eq("invoiced", false)
      .gte("trip_date", billingCycle.start_date)
      .lte("trip_date", billingCycle.end_date);

  const invoiceTrips: InvoiceTrip[] =
    (trips ?? []).map((trip) => ({
      tripId: trip.id,
      tripCode: trip.trip_code,

      distanceKm:
        Number(
          trip.distance_km ?? 0
        ),

      passengerCount:
        Number(
          trip.passenger_count ?? 0
        ),
    }));

  if (invoiceTrips.length === 0) {

    return {

      billingCycleId,

      invoicesCreated: 0,

      tripsProcessed: 0,

      subtotal: 0,

      vat: 0,

      total: 0,

      invoiceIds: [],

    };

  }

const invoice =
  generateInvoice(
    invoiceTrips,
    settings,
    billingCycle.cycle_name
  );

const savedInvoice =
  await saveInvoice(
    platformId,
    billingCycle.start_date,
    billingCycle.end_date,
    invoice,
    settings
  );

  return {

    billingCycleId,

    invoicesCreated: 1,

    tripsProcessed:
      invoiceTrips.length,

    subtotal:
      invoice.subtotal,

    vat:
      invoice.vat,

    total:
      invoice.total,

    invoiceIds: [
      savedInvoice.id,
    ],

  };
}
