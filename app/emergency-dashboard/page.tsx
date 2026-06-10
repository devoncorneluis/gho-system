"use client";

import { useEffect, useState } from "react";
import AdminLayout from "../../components/AdminLayout";
import { supabase } from "../../lib/supabase";

const PLATFORM_ID = "713c411b-847e-4379-8e38-c142e06ff5fd";

type EmergencyAlert = {
  id: string;
  driver_name: string | null;
  vehicle_name: string | null;
  vehicle_registration: string | null;
  alert_type: string | null;
  emergency_type: string | null;
  description: string | null;
  status: string | null;
  created_at: string | null;
  assigned_agent: string | null;
  acknowledged_at: string | null;
  resolved_at: string | null;
  resolution_notes: string | null;
};

export default function EmergencyDashboardPage() {
  const [alerts, setAlerts] = useState<EmergencyAlert[]>([]);
  const [agentInputs, setAgentInputs] = useState<Record<string, string>>({});
  const [noteInputs, setNoteInputs] = useState<Record<string, string>>({});

  async function loadAlerts() {
    const { data, error } = await supabase
      .from("emergency_alerts")
      .select("*")
      .eq("platform_id", PLATFORM_ID)
      .order("created_at", { ascending: false });

    if (error) {
      alert(error.message);
      return;
    }

    setAlerts(data || []);
  }

  async function acknowledgeAlert(id: string) {
    const { error } = await supabase
      .from("emergency_alerts")
      .update({
        status: "Acknowledged",
        acknowledged_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) {
      alert(error.message);
      return;
    }

    loadAlerts();
  }

  async function assignAgent(id: string) {
    const assignedAgent = agentInputs[id];

    if (!assignedAgent) {
      alert("Please enter assigned agent name");
      return;
    }

    const { error } = await supabase
      .from("emergency_alerts")
      .update({
        status: "Response Assigned",
        assigned_agent: assignedAgent,
      })
      .eq("id", id);

    if (error) {
      alert(error.message);
      return;
    }

    setAgentInputs({ ...agentInputs, [id]: "" });
    loadAlerts();
  }

  async function resolveAlert(id: string) {
    const resolutionNotes = noteInputs[id];

    if (!resolutionNotes) {
      alert("Please enter resolution notes before resolving");
      return;
    }

    const { error } = await supabase
      .from("emergency_alerts")
      .update({
        status: "Resolved",
        resolution_notes: resolutionNotes,
        resolved_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) {
      alert(error.message);
      return;
    }

    setNoteInputs({ ...noteInputs, [id]: "" });
    loadAlerts();
  }

  useEffect(() => {
    loadAlerts();

    const timer = setInterval(loadAlerts, 10000);

    return () => clearInterval(timer);
  }, []);

  const openAlerts = alerts.filter((alert) => alert.status === "Open");
  const acknowledgedAlerts = alerts.filter(
    (alert) => alert.status === "Acknowledged"
  );
  const assignedAlerts = alerts.filter(
    (alert) => alert.status === "Response Assigned"
  );
  const resolvedAlerts = alerts.filter((alert) => alert.status === "Resolved");

  const activeAlerts = alerts.filter((alert) => alert.status !== "Resolved");

  return (
    <AdminLayout>
      <main className="min-h-screen bg-gray-100 p-6">
        <h1 className="text-4xl font-bold text-red-700">
          🚨 GHO Emergency Response Center
        </h1>

        <p className="text-gray-600 mt-2">
          Manage emergency workflow from open alert to response assignment and resolution.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mt-6">
          <div className="bg-red-50 border border-red-300 rounded-xl shadow p-5">
            <p className="font-bold">Open</p>
            <p className="text-4xl font-bold text-red-600">{openAlerts.length}</p>
          </div>

          <div className="bg-orange-50 border border-orange-300 rounded-xl shadow p-5">
            <p className="font-bold">Acknowledged</p>
            <p className="text-4xl font-bold text-orange-500">{acknowledgedAlerts.length}</p>
          </div>

          <div className="bg-blue-50 border border-blue-300 rounded-xl shadow p-5">
            <p className="font-bold">Response Assigned</p>
            <p className="text-4xl font-bold text-blue-600">{assignedAlerts.length}</p>
          </div>

          <div className="bg-green-50 border border-green-300 rounded-xl shadow p-5">
            <p className="font-bold">Resolved</p>
            <p className="text-4xl font-bold text-green-600">{resolvedAlerts.length}</p>
          </div>

          <div className="bg-white rounded-xl shadow p-5">
            <p className="font-bold">Total Alerts</p>
            <p className="text-4xl font-bold text-[#061B33]">{alerts.length}</p>
          </div>
        </div>

        <section className="mt-8">
          <h2 className="text-2xl font-bold text-red-700">
            Active Emergency Workflow
          </h2>

          {activeAlerts.length === 0 && (
            <p className="text-gray-500 mt-4">No active emergency alerts.</p>
          )}

          {activeAlerts.map((alert) => (
            <div
              key={alert.id}
              className="bg-white rounded-xl shadow p-6 mt-4 border-l-8 border-red-600"
            >
              <div className="flex flex-col md:flex-row md:justify-between gap-4">
                <div>
                  <p className="text-xl font-bold text-red-700">
                    🚨 {alert.emergency_type || alert.alert_type || "Emergency Alert"}
                  </p>

                  <p className="mt-1 text-sm text-gray-500">
                    Status: <strong>{alert.status || "Open"}</strong>
                  </p>
                </div>

                <div className="bg-gray-100 rounded-lg px-4 py-2 text-sm">
                  <p><strong>Created:</strong> {alert.created_at || "Unknown"}</p>
                  <p><strong>Acknowledged:</strong> {alert.acknowledged_at || "Not yet"}</p>
                  <p><strong>Resolved:</strong> {alert.resolved_at || "Not yet"}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="space-y-1">
                  <p><strong>Driver:</strong> {alert.driver_name || "Unknown"}</p>
                  <p><strong>Vehicle:</strong> {alert.vehicle_name || "Unknown"}</p>
                  <p><strong>Registration:</strong> {alert.vehicle_registration || "Unknown"}</p>
                  <p><strong>Assigned Agent:</strong> {alert.assigned_agent || "Not assigned"}</p>
                </div>

                <div>
                  <p><strong>Description:</strong></p>
                  <p className="bg-gray-50 rounded-lg p-3 mt-1">
                    {alert.description || "No description provided"}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5">
                <button
                  onClick={() => acknowledgeAlert(alert.id)}
                  className="bg-orange-500 text-white px-5 py-3 rounded-lg font-bold"
                >
                  Acknowledge
                </button>

                <div className="flex gap-2">
                  <input
                    value={agentInputs[alert.id] || ""}
                    onChange={(e) =>
                      setAgentInputs({
                        ...agentInputs,
                        [alert.id]: e.target.value,
                      })
                    }
                    className="border p-3 rounded-lg w-full"
                    placeholder="Assign agent"
                  />

                  <button
                    onClick={() => assignAgent(alert.id)}
                    className="bg-blue-600 text-white px-4 py-3 rounded-lg font-bold"
                  >
                    Assign
                  </button>
                </div>

                <div className="flex gap-2">
                  <input
                    value={noteInputs[alert.id] || ""}
                    onChange={(e) =>
                      setNoteInputs({
                        ...noteInputs,
                        [alert.id]: e.target.value,
                      })
                    }
                    className="border p-3 rounded-lg w-full"
                    placeholder="Resolution notes"
                  />

                  <button
                    onClick={() => resolveAlert(alert.id)}
                    className="bg-green-600 text-white px-4 py-3 rounded-lg font-bold"
                  >
                    Resolve
                  </button>
                </div>
              </div>
            </div>
          ))}
        </section>

        <section className="mt-10">
          <h2 className="text-2xl font-bold text-[#061B33]">
            Resolved Emergency History
          </h2>

          {resolvedAlerts.length === 0 && (
            <p className="text-gray-500 mt-4">No resolved alerts yet.</p>
          )}

          {resolvedAlerts.map((alert) => (
            <div key={alert.id} className="bg-white rounded-xl shadow p-6 mt-4 opacity-90">
              <p className="font-bold">
                ✅ {alert.emergency_type || alert.alert_type || "Emergency Alert"}
              </p>
              <p><strong>Driver:</strong> {alert.driver_name || "Unknown"}</p>
              <p><strong>Vehicle:</strong> {alert.vehicle_name || "Unknown"}</p>
              <p><strong>Registration:</strong> {alert.vehicle_registration || "Unknown"}</p>
              <p><strong>Assigned Agent:</strong> {alert.assigned_agent || "Not assigned"}</p>
              <p><strong>Resolution Notes:</strong> {alert.resolution_notes || "No notes"}</p>
              <p><strong>Resolved:</strong> {alert.resolved_at || "Unknown"}</p>
            </div>
          ))}
        </section>
      </main>
    </AdminLayout>
  );
}
