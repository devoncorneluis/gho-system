"use client";

interface EmptyStateProps {
  title: string;
  message: string;
}

export default function EmptyState({ title, message }: EmptyStateProps) {
  return (
    <div className="rounded-2xl border border-dashed border-gray-300 bg-slate-50 p-8 text-center">
      <h3 className="text-lg font-bold text-[#061B33]">{title}</h3>
      <p className="mt-2 text-sm text-gray-500">{message}</p>
    </div>
  );
}
