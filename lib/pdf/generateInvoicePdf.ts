import {
  PDFDocument,
  StandardFonts,
  rgb,
} from "pdf-lib";

import { buildInvoiceDocument } from "./invoicePdf";
import { Invoice } from "../billing/invoiceGenerator";

export async function generateInvoicePdf(
  invoice: Invoice
) {
  const document =
    buildInvoiceDocument(invoice);

  const pdf =
    await PDFDocument.create();

  const page =
    pdf.addPage([595, 842]);

  const font =
    await pdf.embedFont(
      StandardFonts.Helvetica
    );

  let y = 800;

  function write(
    text: string,
    size = 12
  ) {
    page.drawText(text, {
      x: 50,
      y,
      size,
      font,
      color: rgb(0, 0, 0),
    });

    y -= size + 8;
  }

  write(
    document.company.company,
    20
  );

  write(
    document.company.product,
    14
  );

  y -= 10;

  write(
    `Invoice: ${document.invoiceNumber}`
  );

  write(
    `Billing Cycle: ${document.billingCycle}`
  );

  write(
    `Generated: ${document.generated}`
  );

  y -= 15;

  write("Trips", 16);

  document.trips.forEach(
    (trip) => {

      write(
        `${trip.tripCode} | ${trip.passengers} passengers | ${trip.distance} km`
      );

    }
  );

  y -= 20;

  write(
    `Subtotal: ${document.subtotal}`
  );

  write(
    `VAT: ${document.vat}`
  );

  write(
    `Total: ${document.total}`,
    16
  );

  return await pdf.save();
}