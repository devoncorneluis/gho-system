"use client";

import { useEffect, useState } from "react";
import AdminLayout from "../../components/AdminLayout";
import EmergencyCard from "../../components/emergency/EmergencyCard";
import { supabase } from "../../lib/supabase";
import { transitionEmergencyAlert } from "../../lib/emergencyTransitionService";
import { recordOperationHistory } from "../../lib/operationsHistory";
const PLATFORM_ID = "713c411b-847e-4379-8e38-c142e06ff5fd";

type EmergencyAlert = {
  id: string;

  trip_id: string | null;
  trip_code: string | null;

  driver_name: string | null;
  vehicle_name: string | null;
  vehicle_registration: string | null;

  alert_type: string | null;
  emergency_type: string | null;
  description: string | null;

  status: string | null;

  assigned_agent: string | null;

  created_at: string | null;
  acknowledged_at: string | null;
  resolved_at: string | null;

  resolution_notes: string | null;

  latitude: number | null;
  longitude: number | null;
};

export default function EmergencyDashboardPage() {
  const [alerts, setAlerts] = useState<EmergencyAlert[]>([]);
  const [loading, setLoading] = useState(true);

  const [agentInputs, setAgentInputs] = useState<
    Record<string, string>
  >({});

  const [noteInputs, setNoteInputs] = useState<
    Record<string, string>
  >({});


  async function assignAgent(id: string) {
    const assignedAgent = agentInputs[id];

    if (!assignedAgent?.trim()) {
      alert("Please enter the responder name.");
      return;
    }

    try {
      await transitionEmergencyAlert("assign", {
        alertId: id,
        platformId: PLATFORM_ID,
        assignedAgent,
      });
const alertRecord = alerts.find((a) => a.id === id);

if (alertRecord) {
  await recordOperationHistory({
    tripId: alertRecord.trip_id ?? alertRecord.id,
    tripCode: alertRecord.trip_code,
    platformId: PLATFORM_ID,
    eventType: "emergency_assigned",
    eventTitle: "Emergency Response Assigned",
    eventDescription: `Responder assigned: ${assignedAgent}`,
    driverName: alertRecord.driver_name,
    vehicleName: alertRecord.vehicle_name,
    severity: "warning",
  });
}
      setAgentInputs({
        ...agentInputs,
        [id]: "",
      });

      loadAlerts();
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "Unable to assign responder."
      );
    }
  }
async function loadAlerts() {
  setLoading(true);

  const { data, error } = await supabase
    .from("emergency_alerts")
    .select("*")
    .eq("platform_id", PLATFORM_ID)
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    alert(error.message);
    setLoading(false);
    return;
  }

  setAlerts(data || []);
  setLoading(false);
}
async function acknowledgeAlert(id: string) {
  try {
    await transitionEmergencyAlert("acknowledge", {
      alertId: id,
      platformId: PLATFORM_ID,
    });
const alertRecord = alerts.find((a) => a.id === id);

if (alertRecord) {
  await recordOperationHistory({
    tripId: alertRecord.trip_id ?? alertRecord.id,
    tripCode: alertRecord.trip_code,
    platformId: PLATFORM_ID,
    eventType: "emergency_acknowledged",
    eventTitle: "Emergency Acknowledged",
    eventDescription: "Emergency acknowledged by Operations.",
    driverName: alertRecord.driver_name,
    vehicleName: alertRecord.vehicle_name,
    severity: "warning",
  });
}
    loadAlerts();
  } catch (error) {
    alert(
      error instanceof Error
        ? error.message
        : "Unable to acknowledge alert."
    );
  }
}
  async function resolveAlert(id: string) {
    const resolutionNotes = noteInputs[id];

    if (!resolutionNotes?.trim()) {
      alert("Please enter resolution notes.");
      return;
    }

    try {
      await transitionEmergencyAlert("resolve", {
        alertId: id,
        platformId: PLATFORM_ID,
        resolutionNotes,
      });

      setNoteInputs({
        ...noteInputs,
        [id]: "",
      });
const alertRecord = alerts.find((a) => a.id === id);

if (alertRecord) {
  await recordOperationHistory({
    tripId: alertRecord.trip_id ?? alertRecord.id,
    tripCode: alertRecord.trip_code,
    platformId: PLATFORM_ID,
    eventType: "emergency_resolved",
    eventTitle: "Emergency Resolved",
    eventDescription: resolutionNotes,
    driverName: alertRecord.driver_name,
    vehicleName: alertRecord.vehicle_name,
    severity: "success",
  });
}
      loadAlerts();
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "Unable to resolve emergency."
      );
    }
  }
    useEffect(() => {
    loadAlerts();

    const channel = supabase
      .channel("emergency-alerts")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "emergency_alerts",
        },
        () => {
          loadAlerts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const openAlerts = alerts.filter(
    (alert) => alert.status === "Open"
  );

  const acknowledgedAlerts = alerts.filter(
    (alert) => alert.status === "Acknowledged"
  );

  const assignedAlerts = alerts.filter(
    (alert) => alert.status === "Response Assigned"
  );

  const resolvedAlerts = alerts.filter(
    (alert) => alert.status === "Resolved"
  );

  const activeAlerts = alerts.filter(
    (alert) => alert.status !== "Resolved"
  );

  return (
    <AdminLayout>
      <main className="min-h-screen bg-gray-100 p-6">

        <h1 className="text-4xl font-bold text-red-700">
          🚨 GHO Emergency Response Centre
        </h1>

        <p className="mt-2 text-gray-600">
          Monitor, acknowledge, assign and resolve emergency incidents
          across your transport fleet.
        </p>

        <div className="mt-6">
          <EmergencyCard
            driver="John Smith"
            vehicle="Toyota Quantum"
            trip="GHO-104"
            passengers={11}
            status="SOS ACTIVE"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 mt-6 md:grid-cols-5">

          <div className="rounded-xl border border-red-300 bg-red-50 p-5 shadow">
            <p className="font-bold">
              Open
            </p>

            <p className="text-4xl font-bold text-red-600">
              {openAlerts.length}
            </p>
          </div>

          <div className="rounded-xl border border-orange-300 bg-orange-50 p-5 shadow">
            <p className="font-bold">
              Acknowledged
            </p>

            <p className="text-4xl font-bold text-orange-600">
              {acknowledgedAlerts.length}
            </p>
          </div>

          <div className="rounded-xl border border-blue-300 bg-blue-50 p-5 shadow">
            <p className="font-bold">
              Response Assigned
            </p>

            <p className="text-4xl font-bold text-blue-600">
              {assignedAlerts.length}
            </p>
          </div>

          <div className="rounded-xl border border-green-300 bg-green-50 p-5 shadow">
            <p className="font-bold">
              Resolved
            </p>

            <p className="text-4xl font-bold text-green-600">
              {resolvedAlerts.length}
            </p>
          </div>

          <div className="rounded-xl bg-white p-5 shadow">
            <p className="font-bold">
              Total Alerts
            </p>

            <p className="text-4xl font-bold text-[#061B33]">
              {alerts.length}
            </p>
          </div>

        </div>

        {loading && (
          <div className="mt-8 rounded-xl bg-white p-6 shadow">
            Loading emergency alerts...
          </div>
        )}

{!loading && (
  <>
                      <section className="mt-8">
              <h2 className="text-2xl font-bold text-red-700">
                Active Emergency Workflow
              </h2>

              {activeAlerts.length === 0 && (
                <p className="mt-4 text-gray-500">
                  No active emergency alerts.
                </p>
              )}

              {activeAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className="mt-4 rounded-xl border-l-8 border-red-600 bg-white p-6 shadow"
                >
                  <div className="flex flex-col gap-4 md:flex-row md:justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-red-700">
                        🚨{" "}
                        {alert.emergency_type ||
                          alert.alert_type ||
                          "Emergency Alert"}
                      </h3>

                      <p className="mt-1 text-sm text-gray-500">
                        Status:{" "}
                        <strong>{alert.status || "Open"}</strong>
                      </p>
                    </div>

                    <div className="rounded-lg bg-gray-100 px-4 py-2 text-sm">
                      <p>
                        <strong>Created:</strong>{" "}
                        {alert.created_at || "Unknown"}
                      </p>

                      <p>
                        <strong>Acknowledged:</strong>{" "}
                        {alert.acknowledged_at || "Not yet"}
                      </p>

                      <p>
                        <strong>Resolved:</strong>{" "}
                        {alert.resolved_at || "Not yet"}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <p>
                        <strong>Driver:</strong>{" "}
                        {alert.driver_name || "Unknown"}
                      </p>

                      <p>
                        <strong>Vehicle:</strong>{" "}
                        {alert.vehicle_name || "Unknown"}
                      </p>

                      <p>
                        <strong>Registration:</strong>{" "}
                        {alert.vehicle_registration || "Unknown"}
                      </p>

                      <p>
                        <strong>Assigned Agent:</strong>{" "}
                        {alert.assigned_agent || "Not assigned"}
                      </p>
                    </div>

                    <div>
                      <p className="font-bold">
                        Description
                      </p>

                      <div className="mt-2 rounded-lg bg-gray-50 p-3">
                        {alert.description ||
                          "No description provided"}
                      </div>

                      <div className="mt-4 rounded-lg border bg-blue-50 p-3">
                        <p className="font-bold text-[#061B33]">
                          📍 Incident Location
                        </p>

                        <p>
                          <strong>Latitude:</strong>{" "}
                          {alert.latitude ?? "Unavailable"}
                        </p>

                        <p>
                          <strong>Longitude:</strong>{" "}
                          {alert.longitude ?? "Unavailable"}
                        </p>

                        {alert.latitude !== null &&
                          alert.longitude !== null && (
                            <button
                              onClick={() =>
                                window.open(
                                  `https://www.google.com/maps?q=${alert.latitude},${alert.longitude}`,
                                  "_blank"
                                )
                              }
                              className="mt-3 rounded-lg bg-[#061B33] px-4 py-2 font-bold text-white hover:bg-blue-700"
                            >
                              🌍 Open in Google Maps
                            </button>
                          )}
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 grid gap-4 md:grid-cols-3">
                    <button
                      onClick={() =>
                        acknowledgeAlert(alert.id)
                      }
                      className="rounded-lg bg-orange-500 px-5 py-3 font-bold text-white hover:bg-orange-600"
                    >
                      Acknowledge
                    </button>

                    <div className="flex gap-2">
                      <input
                        className="w-full rounded-lg border p-3"
                        placeholder="Assign responder"
                        value={
                          agentInputs[alert.id] || ""
                        }
                        onChange={(e) =>
                          setAgentInputs({
                            ...agentInputs,
                            [alert.id]:
                              e.target.value,
                          })
                        }
                      />

                      <button
                        onClick={() =>
                          assignAgent(alert.id)
                        }
                        className="rounded-lg bg-blue-600 px-4 py-3 font-bold text-white hover:bg-blue-700"
                      >
                        Assign
                      </button>
                    </div>

                    <div className="flex gap-2">
                      <input
                        className="w-full rounded-lg border p-3"
                        placeholder="Resolution notes"
                        value={
                          noteInputs[alert.id] || ""
                        }
                        onChange={(e) =>
                          setNoteInputs({
                            ...noteInputs,
                            [alert.id]:
                              e.target.value,
                          })
                        }
                      />

                      <button
                        onClick={() =>
                          resolveAlert(alert.id)
                        }
                        className="rounded-lg bg-green-600 px-4 py-3 font-bold text-white hover:bg-green-700"
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
                <p className="mt-4 text-gray-500">
                  No resolved alerts yet.
                </p>
              )}

              {resolvedAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className="mt-4 rounded-xl bg-white p-6 opacity-90 shadow"
                >
                  <p className="font-bold">
                    ✅{" "}
                    {alert.emergency_type ||
                      alert.alert_type ||
                      "Emergency Alert"}
                  </p>

                  <p>
                    <strong>Driver:</strong>{" "}
                    {alert.driver_name || "Unknown"}
                  </p>

                  <p>
                    <strong>Vehicle:</strong>{" "}
                    {alert.vehicle_name || "Unknown"}
                  </p>

                  <p>
                    <strong>Registration:</strong>{" "}
                    {alert.vehicle_registration ||
                      "Unknown"}
                  </p>

                  <p>
                    <strong>Assigned Agent:</strong>{" "}
                    {alert.assigned_agent ||
                      "Not assigned"}
                  </p>

                  <p>
                    <strong>Resolution Notes:</strong>{" "}
                    {alert.resolution_notes ||
                      "No notes"}
                  </p>

                  <p>
                    <strong>Resolved:</strong>{" "}
                    {alert.resolved_at || "Unknown"}
                  </p>
                </div>
              ))}
            </section>
          </>
        )}
      </main>
    </AdminLayout>
  );
}