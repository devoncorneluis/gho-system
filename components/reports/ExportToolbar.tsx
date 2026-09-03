"use client";

import {
  downloadCsv,
  CsvRow,
} from "../../lib/reports/csvExport";
import { downloadExcel } from "../../lib/reports/excelExport";
import { exportPdf } from "../../lib/reports/pdfExport";

type Props = {
  reportName: string;
  rows: CsvRow[];
};

export default function ExportToolbar({
  reportName,
  rows,
}: Props) {
  return (
    <div className="flex flex-wrap gap-3">

      <button
        onClick={() =>
          downloadCsv(`${reportName}.csv`, rows)
        }
        className="rounded-xl bg-[#061B33] px-5 py-3 font-semibold text-white"
      >
        Export CSV
      </button>

      <button
        onClick={() =>
          downloadExcel(`${reportName}.xlsx`, rows)
        }
        className="rounded-xl bg-green-600 px-5 py-3 font-semibold text-white"
      >
        Export Excel
      </button>

      <button
        onClick={() =>
          exportPdf(reportName, rows)
        }
        className="rounded-xl bg-red-600 px-5 py-3 font-semibold text-white"
      >
        Export PDF
      </button>

    </div>
  );
}
