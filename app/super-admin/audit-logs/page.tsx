"use client";

import { useEffect, useState } from "react";
import SuperAdminLayout from "../../../components/SuperAdminLayout";
import { supabase } from "../../../lib/supabase";

type AuditLog = {
  id: string;
  platform_id: string | null;
  user_id: string | null;
  action_type: string;
  entity_type: string;
  entity_id: string | null;
  description: string | null;
  created_by: string | null;
  created_at: string | null;
};

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);

  async function loadLogs() {
    const { data, error } = await supabase
      .from("audit_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) {
      alert(error.message);
      return;
    }

    setLogs(data || []);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadLogs();
  }, []);

  return (
    <SuperAdminLayout>
      <main className="min-h-screen bg-gray-100 p-6">
        <h1 className="text-4xl font-black text-[#061B33]">
          Audit Logs
        </h1>

        <p className="text-gray-600 mt-2">
          Track important Super Admin and platform actions.
        </p>

        <div className="bg-white rounded-2xl shadow p-6 mt-6">
          {logs.length === 0 ? (
            <p className="text-gray-500">No audit logs recorded yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="p-3">Date</th>
                    <th className="p-3">Action</th>
                    <th className="p-3">Entity</th>
                    <th className="p-3">Description</th>
                    <th className="p-3">Created By</th>
                  </tr>
                </thead>

                <tbody>
                  {logs.map((log) => (
                    <tr key={log.id} className="border-b">
                      <td className="p-3 text-sm">
                        {log.created_at
                          ? new Date(log.created_at).toLocaleString()
                          : "Unknown"}
                      </td>
                      <td className="p-3 font-bold text-[#061B33]">
                        {log.action_type}
                      </td>
                      <td className="p-3">{log.entity_type}</td>
                      <td className="p-3">{log.description || "No description"}</td>
                      <td className="p-3">{log.created_by || "System"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </SuperAdminLayout>
  );
}
