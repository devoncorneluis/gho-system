"use client";

import { useEffect, useMemo, useState } from "react";
import SuperAdminLayout from "../../components/SuperAdminLayout";
import { supabase } from "../../lib/supabase";

type ReleaseStatus = "Blocked" | "In Progress" | "Complete" | string;
type GateState = "blocked" | "in_progress" | "complete";
type ReleaseStage =
  | "Development"
  | "Feature Freeze"
  | "Validation"
  | "Release Candidate"
  | "Production";
type ReleaseRecommendation = "Go" | "No-Go";

interface ReleaseModel {
  targetVersion: string;
  currentStage: ReleaseStage;
  recommendation: ReleaseRecommendation;
  completedGates: number;
  totalGates: number;
}

type DashboardPayload = {
  schemaVersion: "1.0";
  generatedAt: string;
  release: ReleaseModel;
  gatesList: Array<{
    id: "security" | "testing" | "performance" | "deployment" | "launch";
    name: string;
    state: GateState;
  }>;
  findings: {
    blockedCritical: number;
    blockedHigh: number;
  };
  validation: {
    uatStatus: string;
    performanceStatus: string;
    disasterRecoveryStatus: string;
  };
  uatEnvironment: {
    schemaVersion: string;
    seedVersion: string;
    generatedAt: string;
    build: string;
    seedStatus: string;
    platform: string;
    drivers: number;
    vehicles: number;
    trips: string;
    emergencies: number;
    lastReset: string;
  };
  releaseBoard: Array<{
    gate: string;
    status: string;
  }>;
  uat: {
    roles: Array<{
      id: "super_admin" | "platform_admin" | "dispatcher" | "driver" | "client" | "executive";
      name: string;
      status: string;
      state: "not_started" | "in_progress" | "complete" | "blocked";
    }>;
    startedCount: number;
    completeCount: number;
    totalRoles: number;
  };
  releaseReadiness: {
    architecture: ReleaseStatus;
    security: ReleaseStatus;
    performance: ReleaseStatus;
    testing: ReleaseStatus;
    monitoring: ReleaseStatus;
    documentation: ReleaseStatus;
    deployment: ReleaseStatus;
  };
  metrics: {
    latestProductionBuild: string;
    testPassRate: string;
    openCriticalFindings: number;
    openHighFindings: number;
    uatProgress: string;
    performanceBaselineStatus: string;
    disasterRecoveryStatus: string;
    overallRecommendation: string;
  };
  gates: {
    security: GateState;
    testing: GateState;
    performance: GateState;
    deployment: GateState;
    launch: GateState;
  };
  sources: {
    readinessChecklist: string;
    securityFindings: string;
    validationEvidence: string;
    rc3Stabilization: string;
  };
};

type PerformanceSnapshotPayload = {
  schemaVersion: "1.0";
  generatedAt: string;
  status: "pending" | "pass" | "warn" | "fail";
  statusLabel: string;
  metrics: {
    dashboardLoad: { displayValue: string; status: string };
    apiLatency: { displayValue: string; status: string };
    realtimeLatency: { displayValue: string; status: string };
    monitoringSnapshot: { displayValue: string; status: string };
    seedExecution: { displayValue: string; status: string };
    resetExecution: { displayValue: string; status: string };
    buildDuration: { displayValue: string; status: string };
  };
  queryStatistics: {
    totalQueries: number;
    averageMs: number | null;
    p95Ms: number | null;
    slowQueryCount: number;
    slowQueryThresholdMs: number;
  };
  slowQueryCount: number;
  notes: string[];
};

function statusEmoji(status: ReleaseStatus) {
  const normalized = status.toLowerCase();
  if (normalized.includes("complete") || normalized.includes("pass") || normalized.includes("approved")) {
    return "✅";
  }

  if (normalized.includes("blocked") || normalized.includes("hold") || normalized.includes("fail") || normalized.includes("no-go")) {
    return "⛔";
  }

  return "🟡";
}

function gateBadge(gate: GateState) {
  if (gate === "complete") {
    return { label: "Complete", icon: "🟢", classes: "bg-green-100 text-green-800 border-green-200" };
  }

  if (gate === "blocked") {
    return { label: "Blocked", icon: "🔴", classes: "bg-red-100 text-red-800 border-red-200" };
  }

  return { label: "In Progress", icon: "🟡", classes: "bg-amber-100 text-amber-800 border-amber-200" };
}

function uatBadge(state: "not_started" | "in_progress" | "complete" | "blocked") {
  if (state === "complete") {
    return { icon: "🟢", label: "Complete", classes: "bg-green-100 text-green-800 border-green-200" };
  }

  if (state === "blocked") {
    return { icon: "🔴", label: "Blocked", classes: "bg-red-100 text-red-800 border-red-200" };
  }

  if (state === "in_progress") {
    return { icon: "🟡", label: "In Progress", classes: "bg-amber-100 text-amber-800 border-amber-200" };
  }

  return { icon: "⚪", label: "Not Started", classes: "bg-gray-100 text-gray-700 border-gray-200" };
}

function MetricCard({ title, value }: { title: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-semibold uppercase tracking-wide text-gray-500">{title}</p>
      <p className="mt-2 text-2xl font-black text-[#061B33]">{value}</p>
    </div>
  );
}

function readinessBadge(status: "complete" | "in_progress" | "pending" | "blocked") {
  if (status === "complete") {
    return { icon: "🟢", label: "Complete", classes: "bg-green-100 text-green-800 border-green-200" };
  }

  if (status === "blocked") {
    return { icon: "🔴", label: "Blocked", classes: "bg-red-100 text-red-800 border-red-200" };
  }

  if (status === "in_progress") {
    return { icon: "🟡", label: "In Progress", classes: "bg-amber-100 text-amber-800 border-amber-200" };
  }

  return { icon: "⚪", label: "Pending", classes: "bg-gray-100 text-gray-700 border-gray-200" };
}

export default function ReleaseDashboardPage() {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<DashboardPayload | null>(null);
  const [performanceData, setPerformanceData] = useState<PerformanceSnapshotPayload | null>(null);

  useEffect(() => {
    async function authorizeAndLoad() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        window.location.href = "/login";
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from("user_profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (profileError || profile?.role !== "super_admin") {
        setIsAuthorized(false);
        setAuthChecked(true);
        return;
      }

      setIsAuthorized(true);
      setAuthChecked(true);

      try {
        const [releaseResponse, performanceResponse] = await Promise.all([
          fetch("/api/release-dashboard", { cache: "no-store" }),
          fetch("/api/performance", { cache: "no-store" }),
        ]);

        if (!releaseResponse.ok) {
          throw new Error("Failed to load release dashboard data.");
        }

        if (!performanceResponse.ok) {
          throw new Error("Failed to load performance snapshot.");
        }

        const payload = (await releaseResponse.json()) as DashboardPayload;
        const performancePayload = (await performanceResponse.json()) as PerformanceSnapshotPayload;
        setData(payload);
        setPerformanceData(performancePayload);
      } catch (dashboardError) {
        const message =
          dashboardError instanceof Error
            ? dashboardError.message
            : "An unknown error occurred while loading release data.";
        setError(message);
      } finally {
        setLoading(false);
      }
    }

    authorizeAndLoad();
  }, []);

  const readinessRows = useMemo(() => {
    if (!data) {
      return [];
    }

    return [
      { label: "Architecture", status: data.releaseReadiness.architecture },
      { label: "Security", status: data.releaseReadiness.security },
      { label: "Performance", status: data.releaseReadiness.performance },
      { label: "Testing", status: data.releaseReadiness.testing },
      { label: "Monitoring", status: data.releaseReadiness.monitoring },
      { label: "Documentation", status: data.releaseReadiness.documentation },
      { label: "Deployment", status: data.releaseReadiness.deployment },
    ];
  }, [data]);

  const releaseModel = useMemo<ReleaseModel | null>(() => {
    if (!data) {
      return null;
    }

    return data.release;
  }, [data]);

  const releaseReadiness = useMemo(() => {
    if (!data) {
      return null;
    }

    const uatStatus =
      data.uat.completeCount === data.uat.totalRoles
        ? "complete"
        : data.uat.startedCount > 0
          ? "in_progress"
          : "pending";
    const performanceStatus =
      performanceData?.status === "pass"
        ? "complete"
        : performanceData?.status === "fail"
          ? "blocked"
          : performanceData?.status === "warn"
            ? "in_progress"
            : "pending";
    const recoveryStatus =
      data.metrics.disasterRecoveryStatus === "Complete"
        ? "complete"
        : data.metrics.disasterRecoveryStatus === "Blocked"
          ? "blocked"
          : data.metrics.disasterRecoveryStatus === "In Progress"
            ? "in_progress"
            : "pending";

    const rows: Array<{ label: string; status: "complete" | "in_progress" | "pending" | "blocked" }> = [
      { label: "Architecture", status: data.releaseReadiness.architecture === "Complete" ? "complete" : "pending" },
      { label: "Security", status: data.gates.security === "complete" ? "complete" : data.gates.security === "blocked" ? "blocked" : "in_progress" },
      { label: "UAT", status: uatStatus },
      { label: "Performance", status: performanceStatus },
      { label: "Recovery", status: recoveryStatus },
      { label: "Pilot", status: "pending" },
    ];

    return {
      rows,
      overall: rows.every((row) => row.status === "complete") ? "READY FOR RC1" : "NOT READY",
    };
  }, [data, performanceData]);

  if (!authChecked) {
    return (
      <SuperAdminLayout>
        <main className="min-h-screen bg-[#F3F6FA] p-6">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <p className="text-lg font-semibold text-[#061B33]">Authorizing release dashboard access...</p>
          </div>
        </main>
      </SuperAdminLayout>
    );
  }

  if (!isAuthorized) {
    return (
      <SuperAdminLayout>
        <main className="min-h-screen bg-[#F3F6FA] p-6">
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 shadow-sm">
            <h1 className="text-2xl font-black text-red-700">Access denied</h1>
            <p className="mt-2 text-red-700">
              This dashboard is restricted to Super Admin users.
            </p>
          </div>
        </main>
      </SuperAdminLayout>
    );
  }

  return (
    <SuperAdminLayout>
      <main className="min-h-screen bg-[#F3F6FA] p-6">
        <section className="rounded-3xl bg-[#061B33] p-7 text-white shadow-xl">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-orange-300">Evidence Phase</p>
          <h1 className="mt-2 text-4xl font-black">Release Dashboard</h1>
          <p className="mt-3 max-w-3xl text-gray-200">
            Single-pane release readiness view from governance and validation sources.
            This dashboard visualizes current release evidence and gate status.
          </p>
          {data?.generatedAt && (
            <p className="mt-4 text-sm text-gray-300">
              Last refreshed: {new Date(data.generatedAt).toLocaleString()}
            </p>
          )}

          {data?.schemaVersion && (
            <p className="mt-1 text-xs text-gray-300">Schema version: {data.schemaVersion}</p>
          )}

          {releaseModel && (
            <div className="mt-5 grid grid-cols-1 gap-3 rounded-2xl border border-white/20 bg-white/10 p-4 md:grid-cols-5">
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-300">Target Version</p>
                <p className="mt-1 text-lg font-black">{releaseModel.targetVersion}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-300">Current Stage</p>
                <p className="mt-1 text-lg font-black">{releaseModel.currentStage}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-300">Recommendation</p>
                <p className="mt-1 text-lg font-black">{releaseModel.recommendation}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-300">Completed Gates</p>
                <p className="mt-1 text-lg font-black">{releaseModel.completedGates}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-300">Total Gates</p>
                <p className="mt-1 text-lg font-black">{releaseModel.totalGates}</p>
              </div>
            </div>
          )}
        </section>

        {loading && (
          <section className="mt-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <p className="text-lg font-semibold text-[#061B33]">Loading release evidence...</p>
          </section>
        )}

        {error && (
          <section className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-6 shadow-sm">
            <p className="font-bold text-red-700">{error}</p>
          </section>
        )}

        {!loading && !error && data && (
          <>
            <section className="mt-6 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="text-2xl font-black text-[#061B33]">Release Readiness</h2>
              <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
                {readinessRows.map((row) => (
                  <div
                    key={row.label}
                    className="rounded-xl border border-gray-200 bg-gray-50 p-4"
                  >
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{row.label}</p>
                    <p className="mt-2 text-xl font-black text-[#061B33]">
                      {statusEmoji(row.status)} {row.status}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            {data.gates.security === "complete" && (
              <section className="mt-6 rounded-3xl border border-green-200 bg-green-50 p-6 shadow-sm">
                <h2 className="text-2xl font-black text-green-800">Gate 1 Closed</h2>
                <p className="mt-2 text-sm font-semibold text-green-800">
                  Status: Complete | Decision: Approved | Date: 2026-07-02
                </p>
                <p className="mt-2 text-sm text-green-900">
                  Evidence: SEC-001, SEC-002, SEC-003, SEC-004. Program is now executing Gate 2 - User Acceptance Testing.
                </p>
              </section>
            )}

            <section className="mt-6">
              <h2 className="text-2xl font-black text-[#061B33]">Current Metrics</h2>
              <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                <MetricCard title="Latest production build" value={data.metrics.latestProductionBuild} />
                <MetricCard title="Test pass rate" value={data.metrics.testPassRate} />
                <MetricCard title="Blocked Critical findings" value={data.findings.blockedCritical} />
                <MetricCard title="Blocked High findings" value={data.findings.blockedHigh} />
                <MetricCard title="UAT progress" value={data.metrics.uatProgress} />
                <MetricCard title="Performance baseline" value={data.metrics.performanceBaselineStatus} />
                <MetricCard title="Disaster recovery" value={data.metrics.disasterRecoveryStatus} />
                <MetricCard title="Release recommendation" value={data.metrics.overallRecommendation} />
              </div>
            </section>

            {performanceData && (
              <section className="mt-6 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="flex flex-col gap-1 md:flex-row md:items-end md:justify-between">
                  <div>
                    <h2 className="text-2xl font-black text-[#061B33]">Performance</h2>
                    <p className="mt-2 text-sm text-gray-600">
                      Shared Gate 3 snapshot from the performance engine.
                    </p>
                  </div>
                  <div className="rounded-full border border-gray-200 bg-gray-50 px-4 py-2 text-sm font-bold text-[#061B33]">
                    {statusEmoji(performanceData.statusLabel)} {performanceData.statusLabel}
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                  <MetricCard title="Dashboard load" value={performanceData.metrics.dashboardLoad.displayValue} />
                  <MetricCard title="API latency" value={performanceData.metrics.apiLatency.displayValue} />
                  <MetricCard title="Realtime latency" value={performanceData.metrics.realtimeLatency.displayValue} />
                  <MetricCard title="Build status" value={performanceData.metrics.buildDuration.displayValue} />
                  <MetricCard title="Seed duration" value={performanceData.metrics.seedExecution.displayValue} />
                  <MetricCard title="Reset duration" value={performanceData.metrics.resetExecution.displayValue} />
                  <MetricCard title="Slow queries" value={performanceData.slowQueryCount} />
                  <MetricCard title="Overall status" value={performanceData.statusLabel} />
                </div>
                <p className="mt-4 text-xs font-medium text-gray-500">
                  Snapshot generated: {new Date(performanceData.generatedAt).toLocaleString()}
                </p>
              </section>
            )}

            {data.releaseBoard.length > 0 && (
              <section className="mt-6 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
                <h2 className="text-2xl font-black text-[#061B33]">Release Board Status</h2>
                <div className="mt-4 overflow-hidden rounded-xl border border-gray-200">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 text-xs font-bold uppercase text-gray-500">
                      <tr>
                        <th className="px-4 py-3">Gate</th>
                        <th className="px-4 py-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {data.releaseBoard.map((row) => (
                        <tr key={row.gate}>
                          <td className="px-4 py-3 font-semibold text-[#061B33]">{row.gate}</td>
                          <td className="px-4 py-3 font-semibold text-gray-700">
                            {statusEmoji(row.status)} {row.status}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            )}

            <section className="mt-6 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-1 md:flex-row md:items-end md:justify-between">
                <div>
                  <h2 className="text-2xl font-black text-[#061B33]">UAT Environment</h2>
                  <p className="mt-2 text-sm text-gray-600">
                    Deterministic seed status for release-board validation sessions.
                  </p>
                </div>
                <div className="rounded-full border border-gray-200 bg-gray-50 px-4 py-2 text-sm font-bold text-[#061B33]">
                  {statusEmoji(data.uatEnvironment.seedStatus)} {data.uatEnvironment.seedStatus}
                </div>
              </div>
              <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-6">
                <MetricCard title="Platform" value={data.uatEnvironment.platform} />
                <MetricCard title="Drivers" value={data.uatEnvironment.drivers} />
                <MetricCard title="Vehicles" value={data.uatEnvironment.vehicles} />
                <MetricCard title="Trips" value={data.uatEnvironment.trips} />
                <MetricCard title="Emergencies" value={data.uatEnvironment.emergencies} />
                <MetricCard
                  title="Last reset"
                  value={
                    data.uatEnvironment.lastReset === "Not run"
                      ? "Not run"
                      : new Date(data.uatEnvironment.lastReset).toLocaleString()
                  }
                />
              </div>
              <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
                <MetricCard title="Seed version" value={data.uatEnvironment.seedVersion} />
                <MetricCard title="Build" value={data.uatEnvironment.build} />
                <MetricCard
                  title="Generated"
                  value={
                    data.uatEnvironment.generatedAt === "Not run" ||
                    data.uatEnvironment.generatedAt === "Unknown"
                      ? data.uatEnvironment.generatedAt
                      : new Date(data.uatEnvironment.generatedAt).toLocaleString()
                  }
                />
              </div>
            </section>

            <section className="mt-6 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="text-2xl font-black text-[#061B33]">Gate 2 - UAT Progress</h2>
              <p className="mt-2 text-sm text-gray-600">
                Role-level status is derived from documented execution evidence in validation artifacts.
              </p>
              <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                {data.uat.roles.map((role) => {
                  const badge = uatBadge(role.state);
                  return (
                    <div key={role.id} className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                      <p className="text-sm font-bold text-[#061B33]">{role.name}</p>
                      <div
                        className={`mt-2 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm font-semibold ${badge.classes}`}
                      >
                        <span>{badge.icon}</span>
                        <span>{badge.label}</span>
                      </div>
                      <p className="mt-2 text-xs font-medium text-gray-600">Evidence status: {role.status}</p>
                    </div>
                  );
                })}
              </div>
              <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4">
                <p className="text-sm font-semibold text-[#061B33]">
                  Overall: {data.uat.startedCount} / {data.uat.totalRoles} Started
                </p>
                <p className="mt-1 text-sm font-semibold text-[#061B33]">
                  {data.uat.completeCount} / {data.uat.totalRoles} Complete
                </p>
              </div>
            </section>

            <section className="mt-6 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="text-2xl font-black text-[#061B33]">Tag Readiness</h2>
              <p className="mt-2 text-sm text-gray-600">
                Scheduled for Sprint 5. This card will derive readiness from the same release model and gate data.
              </p>
              {releaseModel && (
                <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4">
                  <p className="text-sm font-semibold text-gray-700">Target: {releaseModel.targetVersion}</p>
                  <p className="mt-1 text-sm font-semibold text-gray-700">
                    Current stage: {releaseModel.currentStage}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-gray-700">
                    Status: {releaseModel.completedGates === releaseModel.totalGates ? "Ready" : "Blocked"}
                  </p>
                </div>
              )}
            </section>

            <section className="mt-6 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="text-2xl font-black text-[#061B33]">Release Gates</h2>
              <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
                {[
                  { name: "Gate 1 Security", value: data.gates.security },
                  { name: "Gate 2 Testing", value: data.gates.testing },
                  { name: "Gate 3 Performance", value: data.gates.performance },
                  { name: "Gate 4 Deployment", value: data.gates.deployment },
                  { name: "Gate 5 Launch", value: data.gates.launch },
                ].map((gate) => {
                  const badge = gateBadge(gate.value);
                  return (
                    <div key={gate.name} className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                      <p className="text-sm font-bold text-[#061B33]">{gate.name}</p>
                      <div
                        className={`mt-3 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm font-semibold ${badge.classes}`}
                      >
                        <span>{badge.icon}</span>
                        <span>{badge.label}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {releaseReadiness && (
              <section className="mt-6 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="flex flex-col gap-1 md:flex-row md:items-end md:justify-between">
                  <div>
                    <h2 className="text-2xl font-black text-[#061B33]">Release Readiness</h2>
                    <p className="mt-2 text-sm text-gray-600">
                      Final release-candidate readiness across validation and pilot gates.
                    </p>
                  </div>
                  <div
                    className={`rounded-full border px-4 py-2 text-sm font-black ${
                      releaseReadiness.overall === "READY FOR RC1"
                        ? "border-green-200 bg-green-100 text-green-800"
                        : "border-gray-200 bg-gray-50 text-[#061B33]"
                    }`}
                  >
                    {releaseReadiness.overall}
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-6">
                  {releaseReadiness.rows.map((row) => {
                    const badge = readinessBadge(row.status);
                    return (
                      <div key={row.label} className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                        <p className="text-sm font-bold text-[#061B33]">{row.label}</p>
                        <div
                          className={`mt-3 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm font-semibold ${badge.classes}`}
                        >
                          <span>{badge.icon}</span>
                          <span>{badge.label}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <p className="mt-4 text-sm font-semibold text-gray-700">
                  Overall: {releaseReadiness.overall}
                </p>
              </section>
            )}

            <section className="mt-6 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="text-2xl font-black text-[#061B33]">Data Sources</h2>
              <p className="mt-2 text-sm text-gray-600">
                This dashboard reads the same governance and validation artifacts used in release board reviews.
              </p>
              <ul className="mt-4 space-y-2 text-sm font-medium text-[#061B33]">
                <li>{data.sources.readinessChecklist}</li>
                <li>{data.sources.securityFindings}</li>
                <li>{data.sources.validationEvidence}</li>
                <li>{data.sources.rc3Stabilization}</li>
              </ul>
            </section>
          </>
        )}
      </main>
    </SuperAdminLayout>
  );
}
