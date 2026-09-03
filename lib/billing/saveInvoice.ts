import { supabase } from "../supabase";
import { Invoice } from "./invoiceGenerator";

export async function saveInvoice(
  platformId: string,
  billingCycleId: string,
  invoice: Invoice
) {
  const { data: savedInvoice, error } = await supabase
    .from("invoices")
    .insert({
      platform_id: platformId,
      billing_cycle_id: billingCycleId,
      invoice_number: invoice.invoiceNumber,
      subtotal: invoice.subtotal,
      vat: invoice.vat,
      total: invoice.total,
      payment_status: "Pending",
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  const items = invoice.trips.map((trip) => ({
    invoice_id: savedInvoice.id,
    trip_code: trip.tripCode,
    description: `Transport Trip ${trip.tripCode}`,
    quantity: 1,
    unit_price:
      invoice.trips.length > 0
        ? invoice.subtotal / invoice.trips.length
        : 0,
    total:
      invoice.trips.length > 0
        ? invoice.subtotal / invoice.trips.length
        : 0,
  }));

  const { error: itemError } = await supabase
    .from("invoice_items")
    .insert(items);

  if (itemError) {
    throw itemError;
  }

  const { error: tripUpdateError } = await supabase
    .from("trips")
    .update({
      invoiced: true,
      invoice_id: savedInvoice.id,
    })
    .in(
      "id",
      invoice.trips.map((trip) => trip.tripId)
    );

  if (tripUpdateError) {
    throw tripUpdateError;
  }

  return savedInvoice;
}
