"use client";

interface EscalationItem {
  id: string;
  severity: "low" | "medium" | "high" | "critical";
  priority: "p1" | "p2" | "p3" | "p4";
  owner: "dispatcher" | "operations" | "safety" | "executive" | "system";
  recommendedAction: string;
  deadline: string;
}

interface EscalationQueuePanelProps {
  escalations: EscalationItem[];
}

const severityMeta: Record<EscalationItem["severity"], { label: string; tone: string }> = {
  critical: { label: "🔴 Critical", tone: "bg-rose-100 text-rose-700" },
  high: { label: "🟠 High", tone: "bg-orange-100 text-orange-700" },
  medium: { label: "🟡 Medium", tone: "bg-amber-100 text-amber-700" },
  low: { label: "🔵 Low", tone: "bg-sky-100 text-sky-700" },
};

function countdown(deadline: string): string {
  const ms = new Date(deadline).getTime() - Date.now();
  if (ms <= 0) return "Overdue";
  const min = Math.floor(ms / 60000);
  const sec = Math.floor((ms % 60000) / 1000);
  return `${min}m ${sec}s`;
}

export default function EscalationQueuePanel({ escalations }: EscalationQueuePanelProps) {
  const grouped = {
    critical: escalations.filter((item) => item.severity === "critical"),
    high: escalations.filter((item) => item.severity === "high"),
    medium: escalations.filter((item) => item.severity === "medium"),
    low: escalations.filter((item) => item.severity === "low"),
  };

  return (
    <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
      <p className="text-sm font-semibold uppercase tracking-wide text-gray-500">Escalation Queue</p>
      <h3 className="mt-1 text-xl font-black text-[#061B33]">Prioritized escalation stream</h3>

      <div className="mt-5 space-y-4">
        {(Object.keys(grouped) as Array<keyof typeof grouped>).map((severity) => (
          <div key={severity}>
            <p className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${severityMeta[severity].tone}`}>
              {severityMeta[severity].label}
            </p>
            <div className="mt-2 space-y-2">
              {grouped[severity].length === 0 ? (
                <p className="text-sm text-gray-400">No items.</p>
              ) : (
                grouped[severity].map((item) => (
                  <div key={item.id} className="rounded-2xl border border-gray-100 bg-slate-50 p-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-semibold text-[#061B33]">{item.owner}</span>
                      <span className="text-gray-500">{countdown(item.deadline)}</span>
                    </div>
                    <p className="mt-2 text-sm text-gray-600">{item.recommendedAction}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
