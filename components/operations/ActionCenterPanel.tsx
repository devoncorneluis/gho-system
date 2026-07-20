"use client";

import type { ActionGuardrailTelemetry, ControlTowerAction } from "../../lib/automation/automationFacade";
import type { MonitoringSnapshot } from "../../lib/monitoring/monitoringTypes";

interface ActionCenterPanelProps {
  onAction: (action: ControlTowerAction) => void;
  onGuardrailEvent?: (event: ActionGuardrailTelemetry) => void;
  busy?: boolean;
  monitoring: MonitoringSnapshot;
}

const ACTIONS: Array<{ key: ControlTowerAction; label: string }> = [
  { key: "approve_recommendation", label: "Approve Recommendation" },
  { key: "reassign_driver", label: "Reassign Driver" },
  { key: "notify_driver", label: "Notify Driver" },
  { key: "escalate", label: "Escalate" },
  { key: "open_trip", label: "Open Trip" },
  { key: "resolve_alert", label: "Resolve Alert" },
  { key: "create_emergency_ticket", label: "Create Emergency Ticket" },
];

function evaluateActionGuard(action: ControlTowerAction, monitoring: MonitoringSnapshot) {
  const isDown = monitoring.overallStatus === "down";
  const isDegraded = monitoring.overallStatus === "degraded";

  if (isDown) {
    const allowedDuringDown = action === "create_emergency_ticket" || action === "escalate" || action === "notify_driver";
    if (!allowedDuringDown) {
      return {
        blocked: true,
        caution: false,
        reason: "Temporarily blocked while monitoring is down.",
      };
    }

    return {
      blocked: false,
      caution: true,
      reason: "System is down; execute only critical-response actions.",
    };
  }

  if (isDegraded) {
    if (!monitoring.realtimeConnected && action === "approve_recommendation") {
      return {
        blocked: true,
        caution: false,
        reason: "Realtime disconnected; recommendation approvals are blocked.",
      };
    }

    if (action === "reassign_driver" || action === "open_trip") {
      return {
        blocked: false,
        caution: true,
        reason: "Proceed with caution while monitoring is degraded.",
      };
    }
  }

  return {
    blocked: false,
    caution: false,
    reason: "",
  };
}

function statusTone(status: MonitoringSnapshot["overallStatus"]): string {
  if (status === "healthy") return "bg-emerald-100 text-emerald-700 border-emerald-200";
  if (status === "degraded") return "bg-amber-100 text-amber-700 border-amber-200";
  return "bg-rose-100 text-rose-700 border-rose-200";
}

export default function ActionCenterPanel({
  onAction,
  onGuardrailEvent,
  busy = false,
  monitoring,
}: ActionCenterPanelProps) {
  return (
    <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
      <p className="text-sm font-semibold uppercase tracking-wide text-gray-500">Action Centre</p>
      <h3 className="mt-1 text-xl font-black text-[#061B33]">One-click operational controls</h3>

      <div className={`mt-4 rounded-xl border px-3 py-2 text-xs font-semibold uppercase ${statusTone(monitoring.overallStatus)}`}>
        Monitoring {monitoring.overallStatus} | Queue {monitoring.queueDepth} | Errors(1h) {monitoring.errorCountLastHour}
      </div>

      <div className="mt-6 grid gap-3 md:grid-cols-2">
        {ACTIONS.map((action) => {
          const guard = evaluateActionGuard(action.key, monitoring);
          const disabled = busy;

          return (
            <button
              key={action.key}
              onClick={() => {
                if (disabled) return;

                if (guard.blocked || guard.caution) {
                  onGuardrailEvent?.({
                    action: action.key,
                    outcome: guard.blocked ? "blocked" : "caution",
                    reason: guard.reason,
                    monitoringStatus: monitoring.overallStatus,
                    queueDepth: monitoring.queueDepth,
                    errorCountLastHour: monitoring.errorCountLastHour,
                    happenedAt: new Date().toISOString(),
                  });
                }

                if (guard.blocked) return;
                onAction(action.key);
              }}
              disabled={disabled}
              className={`rounded-xl border px-4 py-3 text-left text-sm font-semibold transition ${
                disabled
                  ? "cursor-not-allowed bg-gray-100 text-gray-400"
                  : guard.blocked
                    ? "bg-rose-50 text-rose-800 hover:bg-rose-100"
                  : guard.caution
                    ? "bg-amber-50 text-amber-800 hover:bg-amber-100"
                    : "bg-slate-50 text-[#061B33] hover:bg-slate-100"
              }`}
            >
              <p>{action.label}</p>
              {guard.reason ? <p className="mt-1 text-[11px] font-medium opacity-80">{guard.reason}</p> : null}
            </button>
          );
        })}
      </div>

      <p className="mt-4 text-xs text-gray-500">All actions are routed through automation and workflow services.</p>
    </section>
  );
}
