import { Invoice } from "../billing/invoiceGenerator";
import { companyDetails } from "./companyDetails";
import * as format from "./pdfFormatter";

export function buildInvoiceDocument(
  invoice: Invoice
) {
  return {
    company: companyDetails,

    invoiceNumber:
      invoice.invoiceNumber,

    billingCycle:
      invoice.billingCycle,

    generated:
      format.date(
        invoice.generatedAt
      ),

    subtotal:
      format.money(
        invoice.subtotal
      ),

    vat:
      format.money(
        invoice.vat
      ),

    total:
      format.money(
        invoice.total
      ),

    trips:
      invoice.trips.map(
        (trip) => ({
          tripCode:
            trip.tripCode,

          passengers:
            trip.passengerCount,

          distance:
            trip.distanceKm,
        })
      ),
  };
}