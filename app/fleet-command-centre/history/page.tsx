"use client";

import { useCallback, useEffect, useState } from "react";
import AdminLayout from "../../../components/AdminLayout";
import { supabase } from "../../../lib/supabase";

type HistoryRow = {
  id: string;
  created_at: string;
  trip_code: string | null;

  previous_driver_name: string | null;
  new_driver_name: string | null;

  previous_vehicle_name: string | null;
  new_vehicle_name: string | null;

  reason: string | null;
};

export default function FleetReassignmentHistoryPage() {
  const [logs, setLogs] = useState<HistoryRow[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState("");

  const loadLogs = useCallback(async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("trip_reassignment_logs")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
    } else {
      setLogs(data ?? []);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadLogs();
  }, [loadLogs]);

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      !search ||
      (log.trip_code ?? "")
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      (log.previous_driver_name ?? "")
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      (log.new_driver_name ?? "")
        .toLowerCase()
        .includes(search.toLowerCase());

    const matchesDate =
      !dateFilter || log.created_at.startsWith(dateFilter);

    return matchesSearch && matchesDate;
  });

  const today = new Date();

  const totalReassignments = logs.length;

  const todayReassignments = logs.filter((log) => {
    const date = new Date(log.created_at);

    return (
      date.getFullYear() === today.getFullYear() &&
      date.getMonth() === today.getMonth() &&
      date.getDate() === today.getDate()
    );
  }).length;

  const weekAgo = new Date();
  weekAgo.setDate(today.getDate() - 7);

  const weeklyReassignments = logs.filter(
    (log) => new Date(log.created_at) >= weekAgo
  ).length;

  const monthReassignments = logs.filter((log) => {
    const date = new Date(log.created_at);

    return (
      date.getFullYear() === today.getFullYear() &&
      date.getMonth() === today.getMonth()
    );
  }).length;

  function exportCSV() {
    const headers = [
      "Time",
      "Trip",
      "Previous Driver",
      "New Driver",
      "Previous Vehicle",
      "New Vehicle",
      "Reason",
    ];

    const rows = filteredLogs.map((log) => [
      new Date(log.created_at).toLocaleString(),
      log.trip_code ?? "",
      log.previous_driver_name ?? "",
      log.new_driver_name ?? "",
      log.previous_vehicle_name ?? "",
      log.new_vehicle_name ?? "",
      log.reason ?? "",
    ]);

    const csv = [
      headers.join(","),
      ...rows.map((row) =>
        row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(",")
      ),
    ].join("\n");

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `fleet-reassignment-history-${new Date()
      .toISOString()
      .slice(0, 10)}.csv`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  }

  function printReport() {
    window.print();
  }

  return (
    <AdminLayout>
      <main className="min-h-screen bg-gray-100 p-6">
        <h1 className="mb-6 text-3xl font-bold text-[#0B3A82]">
          Fleet Reassignment History
        </h1>

        {/* Filters */}
        <div className="mb-6 flex flex-col gap-4 md:flex-row">
          <input
            type="text"
            placeholder="Search trip or driver..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 rounded-lg border p-3"
          />

          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="rounded-lg border p-3"
          />
        </div>

        {/* Summary Cards */}
        <div className="mb-6 grid gap-4 md:grid-cols-4">
          <div className="rounded-xl bg-white p-5 shadow">
            <p className="text-sm text-gray-500">Total Reassignments</p>
            <h2 className="mt-2 text-3xl font-bold text-[#0B3A82]">
              {totalReassignments}
            </h2>
          </div>

          <div className="rounded-xl bg-white p-5 shadow">
            <p className="text-sm text-gray-500">Today</p>
            <h2 className="mt-2 text-3xl font-bold text-green-600">
              {todayReassignments}
            </h2>
          </div>

          <div className="rounded-xl bg-white p-5 shadow">
            <p className="text-sm text-gray-500">Last 7 Days</p>
            <h2 className="mt-2 text-3xl font-bold text-orange-500">
              {weeklyReassignments}
            </h2>
          </div>

          <div className="rounded-xl bg-white p-5 shadow">
            <p className="text-sm text-gray-500">This Month</p>
            <h2 className="mt-2 text-3xl font-bold text-blue-600">
              {monthReassignments}
            </h2>
          </div>
        </div>

        {/* Actions */}
        <div className="mb-4 flex justify-end gap-3">
          <button
            onClick={exportCSV}
            className="rounded-lg bg-[#0B3A82] px-4 py-2 text-white hover:bg-[#092f67]"
          >
            Export CSV
          </button>

          <button
            onClick={printReport}
            className="rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700"
          >
            Print Report
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-xl bg-white shadow">
          <table className="min-w-full">
            <thead className="bg-[#0B3A82] text-white">
              <tr>
                <th className="px-4 py-3 text-left">Time</th>
                <th className="px-4 py-3 text-left">Trip</th>
                <th className="px-4 py-3 text-left">Previous Driver</th>
                <th className="px-4 py-3 text-left">New Driver</th>
                <th className="px-4 py-3 text-left">Previous Vehicle</th>
                <th className="px-4 py-3 text-left">New Vehicle</th>
                <th className="px-4 py-3 text-left">Reason</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-6 text-center text-gray-500">
                    Loading...
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-6 text-center text-gray-500">
                    No reassignment history found.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3">
                      {new Date(log.created_at).toLocaleString()}
                    </td>

                    <td className="px-4 py-3 font-medium">
                      {log.trip_code}
                    </td>

                    <td className="px-4 py-3">
                      {log.previous_driver_name}
                    </td>

                    <td className="px-4 py-3 font-semibold text-green-700">
                      {log.new_driver_name}
                    </td>

                    <td className="px-4 py-3">
                      {log.previous_vehicle_name}
                    </td>

                    <td className="px-4 py-3 font-semibold text-blue-700">
                      {log.new_vehicle_name}
                    </td>

                    <td className="px-4 py-3">
                      {log.reason}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>

      <style jsx global>{`
        @media print {
          button,
          input {
            display: none !important;
          }

          body {
            background: white !important;
          }

          table {
            font-size: 12px;
          }

          h1 {
            margin-bottom: 20px;
          }
        }
      `}</style>
    </AdminLayout>
  );
}