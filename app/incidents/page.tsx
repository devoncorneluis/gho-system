"use client";
import { useEffect, useState } from "react";
import AdminLayout from "../../components/AdminLayout";
import { supabase } from "../../lib/supabase";
import { getUserPlatform } from "../../lib/getUserPlatform";
import {
  subscribeToIncidents,
  resolveIncident,
} from "../../lib/incidents/incidentStore";
import type { Incident } from "../../lib/incidents/incidentEngine";
import { getIncidentSla } from "../../lib/incidents/sla";
type Dispatcher = {
  id: string;
  full_name: string;
};

export default function IncidentsPage() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [dispatchers, setDispatchers] = useState<Dispatcher[]>([]);
  const [platformId, setPlatformId] = useState("");

  const [statusFilter, setStatusFilter] = useState<
    "All" | "Open" | "Acknowledged" | "Resolved"
  >("All");

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    async function load() {
      const userPlatform = await getUserPlatform();

      if (!userPlatform) return;

      setPlatformId(userPlatform.platformId);

      const { data } = await supabase
        .from("user_profiles")
        .select("id, full_name")
        .eq("platform_id", userPlatform.platformId)
        .in("role", ["platform_admin", "admin"]);

      setDispatchers(data ?? []);

      unsubscribe = subscribeToIncidents(
        userPlatform.platformId,
        (items) => {
          setIncidents(items);
        }
      );
    }

    load();

    return () => {
      unsubscribe?.();
    };
  }, []);

  async function assignDispatcher(
    incidentId: string,
    dispatcherId: string
  ) {
    if (!platformId) return;

    const { error } = await supabase
      .from("incidents")
      .update({
        assigned_to: dispatcherId,
        status: "Acknowledged",
        acknowledged_at: new Date().toISOString(),
      })
      .eq("id", incidentId)
      .eq("platform_id", platformId);

    if (error) {
      alert(error.message);
    }
  }

  const filteredIncidents =
    statusFilter === "All"
      ? incidents
      : incidents.filter(
          (incident) => incident.status === statusFilter
        );

  return (
    <AdminLayout>
      <main className="min-h-screen bg-gray-100 p-6">

        {/* Header */}

        <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
          <p className="text-sm font-semibold uppercase text-red-600">
            GHO Operations
          </p>

          <h1 className="mt-3 text-4xl font-black text-[#061B33]">
            Incident Centre
          </h1>

          <p className="mt-2 max-w-3xl text-gray-600">
            Manage emergencies, vehicle breakdowns,
            trip cancellations, route deviations and
            operational incidents.
          </p>
        </div>

        {/* Summary */}

        <div className="mt-8 grid gap-6 md:grid-cols-4">

          <div className="rounded-2xl bg-white p-6 shadow">
            <p className="text-sm text-gray-500">
              Open Incidents
            </p>

            <p className="mt-3 text-4xl font-black text-red-600">
              {incidents.filter(i => i.status === "Open").length}
            </p>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow">
            <p className="text-sm text-gray-500">
              Critical
            </p>

            <p className="mt-3 text-4xl font-black text-orange-600">
              {incidents.filter(i => i.severity === "Critical").length}
            </p>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow">
            <p className="text-sm text-gray-500">
              Resolved
            </p>

            <p className="mt-3 text-4xl font-black text-green-600">
              {incidents.filter(i => i.status === "Resolved").length}
            </p>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow">
            <p className="text-sm text-gray-500">
              Total
            </p>

            <p className="mt-3 text-4xl font-black text-[#061B33]">
              {incidents.length}
            </p>
          </div>

        </div>

        {/* Queue */}

        <div className="mt-8 rounded-3xl bg-white p-6 shadow">

          <h2 className="mb-6 text-2xl font-black text-[#061B33]">
            Incident Queue
          </h2>

          <div className="mb-6 flex flex-wrap gap-2">
            {(
              [
                "All",
                "Open",
                "Acknowledged",
                "Resolved",
              ] as const
            ).map((filter) => (
              <button
                key={filter}
                onClick={() => setStatusFilter(filter)}
                className={`rounded-lg px-4 py-2 font-semibold transition ${
                  statusFilter === filter
                    ? "bg-[#061B33] text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                {filter}
              </button>
            ))}
          </div>

          {filteredIncidents.length === 0 ? (

            <div className="py-20 text-center text-gray-500">
              No active incidents.
            </div>

          ) : (

            <div className="space-y-4">

              {filteredIncidents.map((incident) => (

                <div
                  key={incident.id}
                  className="rounded-2xl border border-gray-200 p-5"
                >

                  <div className="flex items-center justify-between">

                    <div>

                      <h3 className="text-lg font-bold text-[#061B33]">
                        {incident.type}
                      </h3>

                      <p className="text-sm text-gray-500">
                        {incident.description}
                      </p>

                    </div>

                    <span
                      className={`rounded-full px-3 py-1 text-sm font-bold ${
                        incident.severity === "Critical"
                          ? "bg-red-100 text-red-700"
                          : incident.severity === "High"
                          ? "bg-orange-100 text-orange-700"
                          : incident.severity === "Medium"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-green-100 text-green-700"
                      }`}
                    >
                      {incident.severity}
                    </span>

                  </div>

                  <div className="mt-5 grid gap-4 md:grid-cols-3 text-sm">

                    <div>
                      <strong>Status</strong>
                      <br />
                      {incident.status}
                    </div>

                    <div>
                      <strong>Created</strong>
                      <br />
                      {new Date(
                        incident.createdAt
                      ).toLocaleString()}
                    </div>

                    <div>
                      <strong>ID</strong>
                      <br />
                      {incident.id}
                    </div>

                  </div>

                  <div className="mt-5">
{(() => {
  const sla = getIncidentSla(incident.createdAt);

  return (
    <div className="mt-5 rounded-xl bg-gray-50 p-4 border">
      <p className="text-sm text-gray-500">
        Incident SLA
      </p>

      <div className="mt-2 flex items-center justify-between">
        <span className={`font-bold ${sla.colour}`}>
          {sla.label}
        </span>

        <span className={`font-bold ${sla.colour}`}>
          {sla.minutes} min
        </span>
      </div>
    </div>
  );
})()}
                    <label className="mb-2 block text-sm font-semibold text-gray-600">
                      Assigned Dispatcher
                    </label>

                    <select
                      className="w-full rounded-lg border border-gray-300 p-2"
                      value={incident.assigned_to ?? ""}
                      onChange={(e) =>
                        assignDispatcher(
                          incident.id,
                          e.target.value
                        )
                      }
                    >
                      <option value="">
                        Unassigned
                      </option>

                      {dispatchers.map((dispatcher) => (
                        <option
                          key={dispatcher.id}
                          value={dispatcher.id}
                        >
                          {dispatcher.full_name}
                        </option>
                      ))}
                    </select>

                  </div>

                  <div className="mt-5 flex gap-3">

                    <button
                      className="rounded-lg bg-[#061B33] px-4 py-2 font-semibold text-white"
                      onClick={() =>
                        alert(
                          `Incident ${incident.id} acknowledged.`
                        )
                      }
                    >
                      Acknowledge
                    </button>

                    {incident.status !== "Resolved" && (
                      <button
                        onClick={() =>
                          resolveIncident(
                            incident.id,
                            platformId
                          )
                        }
                        className="rounded-lg bg-green-600 px-4 py-2 font-semibold text-white"
                      >
                        Resolve
                      </button>
                    )}

                  </div>

                </div>

              ))}

            </div>

          )}

        </div>

      </main>
    </AdminLayout>
  );
}