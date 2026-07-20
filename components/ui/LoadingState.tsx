"use client";

interface LoadingStateProps {
  label?: string;
}

export default function LoadingState({ label = "Loading..." }: LoadingStateProps) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 text-center">
      <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-[#061B33]" />
      <p className="mt-3 text-sm text-gray-500">{label}</p>
    </div>
  );
}
