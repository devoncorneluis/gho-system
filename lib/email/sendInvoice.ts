import { Invoice } from "../billing/invoiceGenerator";

import { generateInvoicePdf } from "../pdf/generateInvoicePdf";

import { invoiceEmailTemplate } from "./emailTemplates";

import { sendEmail } from "./emailService";

export async function sendInvoice(
  invoice: Invoice,
  email: string
) {
  const pdf =
    await generateInvoicePdf(
      invoice
    );

  const template =
    invoiceEmailTemplate(
      invoice.invoiceNumber
    );

  return sendEmail({
    to: email,

    subject: template.subject,

    html: template.html,

    attachments: [
      {
        filename:
          `${invoice.invoiceNumber}.pdf`,

        bytes: pdf,
      },
    ],
  });
}