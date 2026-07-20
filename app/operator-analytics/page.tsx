"use client";

import { useMemo } from "react";
import AdminLayout from "../../components/AdminLayout";
import { buildExecutiveInsights } from "../../lib/insights/executiveInsights";
import { buildOperatorInsights } from "../../lib/insights/operatorInsights";
import { getEventTimeline } from "../../lib/observability/eventTimeline";
import { getHealthMetricsSnapshot } from "../../lib/observability/healthMetrics";
import { getOperatorAnalyticsSummary } from "../../lib/observability/operatorAnalytics";
import { getPerformanceMetricsSnapshot } from "../../lib/observability/performanceMetrics";
import type { EventTimelinePoint } from "../../lib/observability/observabilityTypes";

const PLATFORM_ID = "platform-demo";

export default function OperatorAnalyticsPage() {
  const operator = useMemo(() => getOperatorAnalyticsSummary(PLATFORM_ID), []);
  const executive = useMemo(() => buildExecutiveInsights(PLATFORM_ID), []);
  const health = useMemo(() => getHealthMetricsSnapshot(PLATFORM_ID), []);
  const avgLatencyMs = useMemo(() => getPerformanceMetricsSnapshot(PLATFORM_ID).averageActionLatencyMs, []);
  const timeline = useMemo<EventTimelinePoint[]>(() => getEventTimeline(PLATFORM_ID, 10), []);
  const signal = useMemo(() => buildOperatorInsights(PLATFORM_ID).strongestSignal, []);

  return (
    <AdminLayout>
      <main className="min-h-screen bg-gray-100 p-6">
        <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-wide text-gray-500">Operator Analytics</p>
          <h1 className="mt-2 text-4xl font-black text-[#061B33]">Operations manager decision intelligence</h1>
          <p className="mt-3 max-w-3xl text-gray-600">
            This dashboard is for operations managers. It tracks decision quality, blocked actions, manual intervention,
            and response speed across control-tower workflows.
          </p>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <MetricCard label="Dispatch Attempts Today" value={operator.dispatchAttemptsToday} />
          <MetricCard label="Blocked Dispatches" value={operator.blockedDispatches} />
          <MetricCard label="Manual Overrides" value={operator.manualOverrides} />
          <MetricCard label="Recommendation Approvals" value={operator.recommendationApprovals} />
          <MetricCard label="Recommendation Ignores" value={operator.recommendationIgnores} />
          <MetricCard label="Average Decision Time" value={`${Math.round(operator.averageDecisionTimeMs)} ms`} />
          <MetricCard label="Emergency Acknowledgements" value={operator.emergencyAcknowledgements} />
          <MetricCard label="Average Clicks / Dispatch" value={operator.averageClicksPerDispatch} />
          <MetricCard label="Realtime Reliability" value={`${health.realtimeReliability}%`} />
          <MetricCard label="Average Action Latency" value={`${Math.round(avgLatencyMs)} ms`} />
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-2">
          <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-black text-[#061B33]">Most Common Failures</h2>
            <div className="mt-4 space-y-3">
              {operator.mostCommonFailures.length === 0 ? (
                <p className="text-sm text-gray-500">No failure patterns found.</p>
              ) : (
                operator.mostCommonFailures.map((item) => (
                  <div key={item.reason} className="rounded-xl border border-gray-100 bg-gray-50 p-3">
                    <p className="text-sm font-semibold text-[#061B33]">{item.reason}</p>
                    <p className="text-xs text-gray-500">Count: {item.count}</p>
                  </div>
                ))
              )}
            </div>
          </section>

          <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-black text-[#061B33]">Operator Workload</h2>
            <div className="mt-4 space-y-3">
              {operator.operatorWorkload.map((entry) => (
                <div key={entry.operatorId} className="rounded-xl border border-gray-100 bg-gray-50 p-3">
                  <p className="text-sm font-semibold text-[#061B33]">{entry.operatorId}</p>
                  <p className="text-xs text-gray-500">
                    Attempts {entry.attempts} | Success {entry.success} | Blocked {entry.blocked} | Cautioned {entry.cautioned}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-2">
          <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-black text-[#061B33]">Executive Trend Signals</h2>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <Trend label="Automation acceptance" value={`${executive.automationAcceptance}%`} />
              <Trend label="Operator efficiency" value={`${executive.operatorEfficiency}%`} />
              <Trend label="Manual intervention rate" value={`${executive.manualInterventionRate}%`} />
              <Trend label="Average dispatch time" value={`${Math.round(executive.averageDispatchTimeMs)} ms`} />
              <Trend label="Recommendation adoption" value={`${executive.recommendationAdoption}%`} />
              <Trend label="Workflow completion" value={`${executive.workflowCompletion}%`} />
              <Trend label="Critical escalations" value={executive.criticalEscalations} />
              <Trend label="Operational cost index" value={executive.operationalCostIndex} />
            </div>
          </section>

          <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-black text-[#061B33]">Telemetry Timeline</h2>
            <p className="mt-1 text-xs text-gray-500">Operations health: {health.operationsHealth} | Alerts: {health.alertCount}</p>
            <div className="mt-4 space-y-2">
              {timeline.map((point) => (
                <div key={point.bucketIso} className="rounded-xl border border-gray-100 bg-gray-50 p-3">
                  <p className="text-xs font-semibold text-[#061B33]">{new Date(point.bucketIso).toLocaleString()}</p>
                  <p className="text-xs text-gray-500">
                    Total {point.total} | Blocked {point.blocked} | Caution {point.caution} | Failed {point.failed}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="mt-6 rounded-3xl border border-blue-100 bg-blue-50 p-5">
          <p className="text-sm font-semibold text-blue-900">Primary signal</p>
          <p className="mt-1 text-sm text-blue-800">{signal}</p>
        </div>
      </main>
    </AdminLayout>
  );
}

function MetricCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</p>
      <p className="mt-2 text-2xl font-black text-[#061B33]">{value}</p>
    </div>
  );
}

function Trend({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-gray-50 p-3">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-lg font-black text-[#061B33]">{value}</p>
    </div>
  );
}
