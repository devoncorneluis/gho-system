"use client";

import type { ReactNode } from "react";

interface TableProps {
  headers: string[];
  rows: ReactNode[][];
  emptyText?: string;
}

export default function Table({ headers, rows, emptyText = "No records." }: TableProps) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-gray-200">
      <table className="min-w-full text-sm">
        <thead className="bg-slate-50 text-left text-gray-600">
          <tr>
            {headers.map((header) => (
              <th key={header} className="px-4 py-3 font-semibold">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={headers.length} className="px-4 py-6 text-center text-gray-500">
                {emptyText}
              </td>
            </tr>
          ) : (
            rows.map((row, rowIndex) => (
              <tr key={`row-${rowIndex}`} className="border-t border-gray-100">
                {row.map((cell, cellIndex) => (
                  <td key={`cell-${rowIndex}-${cellIndex}`} className="px-4 py-3 text-gray-700">
                    {cell}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
