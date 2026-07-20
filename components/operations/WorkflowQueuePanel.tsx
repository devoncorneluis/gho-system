"use client";

interface WorkflowQueuePanelProps {
  statuses: {
    running: number;
    waiting: number;
    completed: number;
    failed: number;
    paused: number;
  };
}

function StatusTile({ title, value, tone }: { title: string; value: number; tone: string }) {
  return (
    <div className={`rounded-2xl border p-4 ${tone}`}>
      <p className="text-xs font-semibold uppercase tracking-wide">{title}</p>
      <p className="mt-2 text-2xl font-black">{value}</p>
    </div>
  );
}

export default function WorkflowQueuePanel({ statuses }: WorkflowQueuePanelProps) {
  return (
    <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
      <p className="text-sm font-semibold uppercase tracking-wide text-gray-500">Workflow Queue</p>
      <h3 className="mt-1 text-xl font-black text-[#061B33]">Workflow execution states</h3>

      <div className="mt-6 grid gap-3 grid-cols-2 xl:grid-cols-3">
        <StatusTile title="Running" value={statuses.running} tone="border-emerald-200 bg-emerald-50 text-emerald-700" />
        <StatusTile title="Waiting" value={statuses.waiting} tone="border-amber-200 bg-amber-50 text-amber-700" />
        <StatusTile title="Completed" value={statuses.completed} tone="border-sky-200 bg-sky-50 text-sky-700" />
        <StatusTile title="Failed" value={statuses.failed} tone="border-rose-200 bg-rose-50 text-rose-700" />
        <StatusTile title="Paused" value={statuses.paused} tone="border-gray-200 bg-gray-50 text-gray-700" />
      </div>
    </section>
  );
}
