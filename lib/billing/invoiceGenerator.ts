import {
  BillingSettings,
  BillingTrip,
  calculateTripCharge,
} from "./billingCalculator";

import { generateInvoiceNumber } from "./invoiceNumber";
import { getBillingCycle } from "./billingCycle";

export type InvoiceTrip = BillingTrip & {
  tripId: string;
  tripCode: string;
};

export type Invoice = {
  invoiceNumber: string;
  billingCycle: string;
  generatedAt: Date;

  trips: InvoiceTrip[];

  subtotal: number;
  vat: number;
  total: number;
};

export function generateInvoice(
  trips: InvoiceTrip[],
  settings: BillingSettings
): Invoice {

  let subtotal = 0;
  let vat = 0;

  for (const trip of trips) {

    const result =
      calculateTripCharge(
        trip,
        settings
      );

    subtotal += result.subtotal;
    vat += result.vat;

  }

  return {

    invoiceNumber:
      generateInvoiceNumber(),

    billingCycle:
      getBillingCycle(new Date()).cycle,

    generatedAt:
      new Date(),

    trips,

    subtotal,

    vat,

    total:
      subtotal + vat,

  };
}
