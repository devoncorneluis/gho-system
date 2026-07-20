"use client";

import React from "react";

type NotificationItem = {
  title: string;
  detail: string;
  severity: "Info" | "Warning" | "Critical";
};

const items: NotificationItem[] = [
  { title: "Vehicle maintenance due", detail: "V-315 requires inspection", severity: "Warning" },
  { title: "New dispatch request", detail: "Two trips await assignment", severity: "Info" },
  { title: "SLA threshold breach", detail: "Priority queue is running hot", severity: "Critical" },
];

const toneMap: Record<string, string> = {
  Info: "bg-sky-100 text-sky-700",
  Warning: "bg-amber-100 text-amber-700",
  Critical: "bg-rose-100 text-rose-700",
};

export default function NotificationsPanel() {
  return (
    <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-gray-500">Notifications</p>
          <h3 className="mt-1 text-xl font-black text-[#061B33]">Operator attention queue</h3>
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-600">3 open</span>
      </div>

      <div className="mt-6 space-y-3">
        {items.map((item) => (
          <div key={`${item.title}-${item.detail}`} className="rounded-2xl border border-gray-100 bg-slate-50 px-4 py-3">
            <div className="flex items-center justify-between">
              <p className="font-semibold text-[#061B33]">{item.title}</p>
              <span className={`rounded-full px-3 py-1 text-sm font-semibold ${toneMap[item.severity]}`}>{item.severity}</span>
            </div>
            <p className="mt-1 text-sm text-gray-500">{item.detail}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
