"use client";

interface ErrorStateProps {
  title?: string;
  message: string;
  retryLabel?: string;
  onRetry?: () => void;
}

export default function ErrorState({ title = "Something went wrong", message, retryLabel = "Retry", onRetry }: ErrorStateProps) {
  return (
    <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6">
      <h3 className="text-lg font-bold text-rose-700">{title}</h3>
      <p className="mt-2 text-sm text-rose-600">{message}</p>
      {onRetry ? (
        <button onClick={onRetry} className="mt-4 rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white">
          {retryLabel}
        </button>
      ) : null}
    </div>
  );
}
