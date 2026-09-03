import { supabase } from "../supabase";
import { TRIP_STATUS } from "../tripStatus";

export type ExecutiveMetrics = {
  revenue: number;
  activePlatforms: number;
  fleetUtilisation: number;
  collectionRate: number;
};

export async function loadExecutiveMetrics(): Promise<ExecutiveMetrics> {

  const [
    invoices,
    payments,
    vehicles,
    activeTrips,
    platforms,
  ] = await Promise.all([

    supabase.from("invoices")
      .select("total,status"),

    supabase.from("payments")
      .select("amount"),

    supabase.from("vehicles")
      .select("id,status"),

    supabase.from("trips")
      .select("id,status")
      .in("status", [
        TRIP_STATUS.ASSIGNED,
        TRIP_STATUS.ACCEPTED,
        TRIP_STATUS.IN_TRANSIT,
      ]),

    supabase.from("platforms")
      .select("id"),

  ]);

  const revenue =
    (payments.data ?? []).reduce(
      (sum, payment) =>
        sum + Number(payment.amount ?? 0),
      0
    );

  const totalInvoices =
    (invoices.data ?? []).length;

  const paidInvoices =
    (invoices.data ?? []).filter(
      (invoice) =>
        invoice.status === "Paid"
    ).length;

  const totalVehicles =
    (vehicles.data ?? []).length;

  const activeVehicleCount =
    (activeTrips.data ?? []).length;

  return {

    revenue,

    activePlatforms:
      (platforms.data ?? []).length,

    fleetUtilisation:
      totalVehicles === 0
        ? 0
        : (activeVehicleCount /
            totalVehicles) * 100,

    collectionRate:
      totalInvoices === 0
        ? 0
        : (paidInvoices /
            totalInvoices) * 100,

  };
}