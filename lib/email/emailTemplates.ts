export function invoiceEmailTemplate(
  invoiceNumber: string
) {
  return {
    subject: `Invoice ${invoiceNumber}`,

    html: `
      <h2>GHO Transport Management</h2>

      <p>
        Please find your invoice attached.
      </p>

      <p>
        Invoice:
        <strong>${invoiceNumber}</strong>
      </p>

      <p>
        Thank you for using
        GHO Transport Management.
      </p>
    `,
  };
}