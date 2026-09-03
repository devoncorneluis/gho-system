export type CsvValue =
  | string
  | number
  | boolean
  | null
  | undefined;

export type CsvRow = Record<string, CsvValue>;

function escapeValue(value: CsvValue): string {
  if (value === null || value === undefined) {
    return "";
  }

  const text = String(value);

  if (
    text.includes(",") ||
    text.includes('"') ||
    text.includes("\n")
  ) {
    return `"${text.replace(/"/g, '""')}"`;
  }

  return text;
}

export function generateCsv(rows: CsvRow[]): string {
  if (rows.length === 0) {
    return "";
  }

  const headers = Object.keys(rows[0]);

  const headerRow = headers.join(",");

  const body = rows.map((row) =>
    headers
      .map((header) =>
        escapeValue(row[header])
      )
      .join(",")
  );

  return [headerRow, ...body].join("\n");
}

export function downloadCsv(
  filename: string,
  rows: CsvRow[]
) {
  const csv = generateCsv(rows);

  const blob = new Blob([csv], {
    type: "text/csv;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");

  link.href = url;
  link.download = filename;

  document.body.appendChild(link);

  link.click();

  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}