"use client";

import type { FleetStatusItem } from "../../lib/automation/automationFacade";

type Props = {
  fleet: FleetStatusItem[];
};

export default function LiveFleetStatusPanel({ fleet }: Props) {
  return (
    <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            Live Fleet Status
          </p>

          <h2 className="text-xl font-bold text-[#061B33]">
            Fleet Command
          </h2>
        </div>

        <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
          {fleet.length} Drivers
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="border-b bg-gray-50">
            <tr>
              <th className="px-3 py-3 text-left">Driver</th>
              <th className="px-3 py-3 text-left">Vehicle</th>
              <th className="px-3 py-3 text-left">Trip</th>
              <th className="px-3 py-3 text-left">GPS</th>
              <th className="px-3 py-3 text-left">Status</th>
              <th className="px-3 py-3 text-left">Last Update</th>
            </tr>
          </thead>

          <tbody>
            {fleet.map((item) => (
              <tr key={item.id} className="border-b">
                <td className="px-3 py-3 font-medium">
                  {item.driverName}
                </td>

                <td className="px-3 py-3">
                  {item.vehicleName}
                </td>

                <td className="px-3 py-3">
                  {item.tripCode ?? "-"}
                </td>

                <td className="px-3 py-3">
                  {item.gpsConnected ? "🟢 Online" : "🔴 Offline"}
                </td>

                <td className="px-3 py-3">
                  {item.status}
                </td>

                <td className="px-3 py-3 text-gray-500">
                  {item.lastUpdate
                    ? new Date(item.lastUpdate).toLocaleTimeString()
                    : "-"}
                </td>
              </tr>
            ))}

            {fleet.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="py-8 text-center text-gray-500"
                >
                  No fleet currently available.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}