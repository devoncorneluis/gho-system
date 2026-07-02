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

function MetricCard({ title, value }: { title: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-semibold uppercase tracking-wide text-gray-500">{title}</p>
      <p className="mt-2 text-2xl font-black text-[#061B33]">{value}</p>
    </div>
  );
}

export default function ReleaseDashboardPage() {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<DashboardPayload | null>(null);

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
        const response = await fetch("/api/release-dashboard", { cache: "no-store" });
        if (!response.ok) {
          throw new Error("Failed to load release dashboard data.");
        }

        const payload = (await response.json()) as DashboardPayload;
        setData(payload);
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
