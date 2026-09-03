import { supabase } from "../supabase";
import { logActivity } from "../activity/logActivity";

type RecordPaymentArgs = {
  platformId: string;
  invoiceId: string;
  amount: number;
  paymentMethod: string;
  paymentReference: string;
};

export async function recordPayment({
  platformId,
  invoiceId,
  amount,
  paymentMethod,
  paymentReference,
}: RecordPaymentArgs) {
  const { error: paymentError } = await supabase
    .from("payments")
    .insert({
      invoice_id: invoiceId,
      amount,
      payment_method: paymentMethod,
      payment_reference: paymentReference,
      status: "Completed",
    });

  if (paymentError) {
    throw paymentError;
  }

  const { error: invoiceError } = await supabase
    .from("invoices")
    .update({
      payment_status: "Paid",
    })
    .eq("id", invoiceId)
    .eq("platform_id", platformId);

  if (invoiceError) {
    throw invoiceError;
  }

  await logActivity({
    platformId,
    activityType: "payment_recorded",
    entityType: "invoice",
    entityId: invoiceId,
    entityName: paymentReference,
    createdByName: "Platform Admin",
  });

  return true;
}
