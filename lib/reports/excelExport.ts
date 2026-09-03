import type { CsvRow } from "./csvExport";
import { downloadCsv } from "./csvExport";

export function downloadExcel(
  filename: string,
  rows: CsvRow[]
) {
  // Placeholder implementation.
  // Later we'll replace this with a true .xlsx generator.

  downloadCsv(
    filename.replace(".xlsx", ".csv"),
    rows
  );
}