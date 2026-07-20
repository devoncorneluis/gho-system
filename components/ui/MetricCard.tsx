"use client";

interface MetricCardProps {
  label: string;
  value: string | number;
  trend?: string;
  icon?: string;
}

export default function MetricCard({ label, value, trend, icon }: MetricCardProps) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-gray-500">{label}</p>
        {icon ? <span>{icon}</span> : null}
      </div>
      <p className="mt-2 text-2xl font-black text-[#061B33]">{value}</p>
      {trend ? <p className="mt-1 text-xs font-semibold text-gray-500">{trend}</p> : null}
    </div>
  );
}
