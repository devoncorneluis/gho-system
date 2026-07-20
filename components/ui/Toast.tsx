"use client";

type ToastTone = "info" | "success" | "warning" | "danger";

interface ToastProps {
  message: string;
  tone?: ToastTone;
  onClose?: () => void;
}

const TONE_CLASSES: Record<ToastTone, string> = {
  info: "bg-sky-600",
  success: "bg-emerald-600",
  warning: "bg-amber-600",
  danger: "bg-rose-600",
};

export default function Toast({ message, tone = "info", onClose }: ToastProps) {
  return (
    <div className={`fixed bottom-4 right-4 z-50 rounded-xl px-4 py-3 text-sm font-semibold text-white shadow-lg ${TONE_CLASSES[tone]}`}>
      <div className="flex items-center gap-3">
        <span>{message}</span>
        {onClose ? (
          <button onClick={onClose} className="rounded bg-white/20 px-2 py-1 text-xs">
            Close
          </button>
        ) : null}
      </div>
    </div>
  );
}
