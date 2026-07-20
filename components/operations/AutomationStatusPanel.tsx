"use client";

import type { MonitoringSnapshot } from "../../lib/monitoring/monitoringTypes";

interface AutomationStatusPanelProps {
  status: {
    rulesLoaded: number;
    recommendationsToday: number;
    escalationsToday: number;
    workflowsRunning: number;
    automationHealth: "Healthy" | "Degraded" | "Down";
    lastEvaluation: string;
  };
  monitoring: MonitoringSnapshot;
}

function healthTone(health: AutomationStatusPanelProps["status"]["automationHealth"]): string {
  if (health === "Healthy") return "bg-emerald-100 text-emerald-700";
  if (health === "Degraded") return "bg-amber-100 text-amber-700";
  return "bg-rose-100 text-rose-700";
}

function monitoringTone(status: MonitoringSnapshot["overallStatus"]): string {
  if (status === "healthy") return "bg-emerald-100 text-emerald-700";
  if (status === "degraded") return "bg-amber-100 text-amber-700";
  return "bg-rose-100 text-rose-700";
}

export default function AutomationStatusPanel({ status, monitoring }: AutomationStatusPanelProps) {
  return (
    <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-gray-500">Automation Status</p>
          <h3 className="mt-1 text-xl font-black text-[#061B33]">Automation control health</h3>
        </div>
        <span className={`rounded-full px-3 py-1 text-sm font-semibold ${healthTone(status.automationHealth)}`}>
          {status.automationHealth}
        </span>
      </div>

      <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        <div className="rounded-2xl border border-gray-100 bg-slate-50 p-3">
          <p className="text-xs text-gray-500">Rules Loaded</p>
          <p className="text-2xl font-black text-[#061B33]">{status.rulesLoaded}</p>
        </div>
        <div className="rounded-2xl border border-gray-100 bg-slate-50 p-3">
          <p className="text-xs text-gray-500">Recommendations Today</p>
          <p className="text-2xl font-black text-[#061B33]">{status.recommendationsToday}</p>
        </div>
        <div className="rounded-2xl border border-gray-100 bg-slate-50 p-3">
          <p className="text-xs text-gray-500">Escalations Today</p>
          <p className="text-2xl font-black text-[#061B33]">{status.escalationsToday}</p>
        </div>
        <div className="rounded-2xl border border-gray-100 bg-slate-50 p-3">
          <p className="text-xs text-gray-500">Workflows Running</p>
          <p className="text-2xl font-black text-[#061B33]">{status.workflowsRunning}</p>
        </div>
        <div className="rounded-2xl border border-gray-100 bg-slate-50 p-3 md:col-span-2 xl:col-span-2">
          <p className="text-xs text-gray-500">Last Evaluation</p>
          <p className="text-sm font-semibold text-[#061B33]">{new Date(status.lastEvaluation).toLocaleString()}</p>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-gray-100 bg-slate-50 p-4">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-[#061B33]">Monitoring Snapshot</p>
          <span className={`rounded-full px-2 py-1 text-xs font-semibold uppercase ${monitoringTone(monitoring.overallStatus)}`}>
            {monitoring.overallStatus}
          </span>
        </div>

        <div className="mt-3 grid gap-3 md:grid-cols-3">
          <div>
            <p className="text-xs text-gray-500">Queue Depth</p>
            <p className="text-lg font-black text-[#061B33]">{monitoring.queueDepth}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Realtime</p>
            <p className="text-lg font-black text-[#061B33]">{monitoring.realtimeConnected ? "Connected" : "Disconnected"}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Errors (1h)</p>
            <p className="text-lg font-black text-[#061B33]">{monitoring.errorCountLastHour}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
