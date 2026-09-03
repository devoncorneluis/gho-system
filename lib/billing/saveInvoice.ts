import { supabase } from "../supabase";
import { TRIP_STATUS } from "../tripStatus";
import { Invoice } from "./invoiceGenerator";
import {
  BillingSettings,
  calculateTripCharge,
} from "./billingCalculator";

export async function saveInvoice(
  platformId: string,
  billingPeriodStart: string,
  billingPeriodEnd: string,
  invoice: Invoice,
  settings: BillingSettings
) {
  const { data: savedInvoice, error } = await supabase
    .from("invoices")
    .insert({
      platform_id: platformId,
      invoice_number: invoice.invoiceNumber,
      billing_period_start: billingPeriodStart,
      billing_period_end: billingPeriodEnd,
      total_trips: invoice.trips.length,
      total_passengers: invoice.trips.reduce(
        (sum, trip) => sum + trip.passengerCount,
        0
      ),
      total_distance_km: invoice.trips.reduce(
        (sum, trip) => sum + trip.distanceKm,
        0
      ),
      subtotal: invoice.subtotal,
      vat: invoice.vat,
      total_amount: invoice.total,
      payment_status: "Pending",
      generated_at: invoice.generatedAt.toISOString(),
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  const items = invoice.trips.map((trip) => {
    const charge = calculateTripCharge(trip, settings);

    return {
      invoice_id: savedInvoice.id,
      trip_code: trip.tripCode,
      description: `Transport Trip ${trip.tripCode}`,
      quantity: 1,
      unit_price: charge.subtotal,
      total: charge.subtotal,
    };
  });

  if (items.length > 0) {
    const { error: itemError } = await supabase
      .from("invoice_items")
      .insert(items);

    if (itemError) {
      throw itemError;
    }
  }

  const tripIds = invoice.trips.map((trip) => trip.tripId);

  const { data: updatedTrips, error: tripUpdateError } = await supabase
    .from("trips")
    .update({
      invoiced: true,
      invoice_id: savedInvoice.id,
    })
    .in("id", tripIds)
    .eq("platform_id", platformId)
    .eq("status", TRIP_STATUS.COMPLETED)
    .eq("billable", true)
    .eq("invoiced", false)
    .select("id");

  if (tripUpdateError) {
    throw tripUpdateError;
  }

  if (!updatedTrips || updatedTrips.length !== tripIds.length) {
    throw new Error(
      `Invoice created, but only ${updatedTrips?.length ?? 0} of ${tripIds.length} trips were marked as invoiced.`
    );
  }

  return savedInvoice;
}
