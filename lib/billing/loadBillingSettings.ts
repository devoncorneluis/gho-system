import { supabase } from "../supabase";
import { BillingSettings } from "./billingCalculator";

export async function loadBillingSettings(
  platformId: string
): Promise<BillingSettings> {
  const { data, error } = await supabase
    .from("billing_settings")
    .select("*")
    .eq("platform_id", platformId)
    .single();

  if (error || !data) {
    throw new Error(
      "Billing settings not configured."
    );
  }

  return {
    billingMethod: data.billing_method,
    tripRate: Number(data.trip_rate ?? 0),
    monthlyFee: Number(data.monthly_fee ?? 0),
    distanceRate: Number(data.distance_rate ?? 0),
    vatRate: Number(data.vat_rate ?? 0),
  };
}
