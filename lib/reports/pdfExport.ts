import type { CsvRow } from "./csvExport";

export function exportPdf(
  title: string,
  rows: CsvRow[]
) {
  console.log("PDF Export");

  console.log(title);

  console.table(rows);

  alert(
    "PDF export framework created.\nFull PDF generation will be added in the next phase."
  );
}