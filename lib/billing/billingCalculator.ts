export type BillingTrip = {
  distanceKm: number;
  passengerCount: number;
};

export type BillingSettings = {
  billingMethod:
    | "per_trip"
    | "monthly"
    | "distance";

  tripRate: number;
  monthlyFee: number;
  distanceRate: number;
  vatRate: number;
};

export function calculateTripCharge(
  trip: BillingTrip,
  settings: BillingSettings
) {
  let subtotal = 0;

  switch (settings.billingMethod) {
    case "per_trip":
      subtotal = settings.tripRate;
      break;

    case "distance":
      subtotal =
        trip.distanceKm *
        settings.distanceRate;
      break;

    case "monthly":
      subtotal = settings.monthlyFee;
      break;
  }

  const vat =
    subtotal * (settings.vatRate / 100);

  return {
    subtotal,
    vat,
    total: subtotal + vat,
  };
}
