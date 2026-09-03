"use client";

import { DispatchConflict } from "../../lib/dispatch/conflictEngine";

type Props = {
  conflicts: DispatchConflict[];
};

export default function DispatchConflicts({
  conflicts,
}: Props) {
  if (conflicts.length === 0) {
    return (
      <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-green-700">
        ✅ No dispatch conflicts detected.
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-red-200 bg-red-50 p-4">

      <h3 className="font-bold text-red-700">
        Dispatch Warnings
      </h3>

      <ul className="mt-3 list-disc pl-5 space-y-2 text-red-700">

        {conflicts.map((conflict, index) => (
          <li key={index}>
            <strong>{conflict.severity}:</strong>{" "}
            {conflict.message}
          </li>
        ))}

      </ul>

    </div>
  );
}