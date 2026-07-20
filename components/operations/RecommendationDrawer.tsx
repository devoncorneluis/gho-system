"use client";

import type { RecommendationDetails } from "../../lib/automation/automationFacade";

interface RecommendationDrawerProps {
  open: boolean;
  onClose: () => void;
  details?: RecommendationDetails;
}

function Row({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex items-center justify-between border-b border-gray-100 py-2 text-sm">
      <span className="text-gray-500">{label}</span>
      <span className="font-semibold text-[#061B33]">{value}</span>
    </div>
  );
}

export default function RecommendationDrawer({ open, onClose, details }: RecommendationDrawerProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/30">
      <aside className="h-full w-full max-w-md overflow-y-auto bg-white p-6 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-xl font-black text-[#061B33]">Recommendation Reasoning</h3>
          <button onClick={onClose} className="rounded-md border px-3 py-1 text-sm font-semibold">
            Close
          </button>
        </div>

        {!details ? (
          <p className="text-sm text-gray-500">No recommendation details available.</p>
        ) : (
          <div className="space-y-1 rounded-2xl border border-gray-200 p-4">
            <Row label="Driver score" value={details.driverScore} />
            <Row label="Distance" value={`${details.distanceKm} km`} />
            <Row label="ETA" value={`${details.etaMinutes} min`} />
            <Row label="Capacity" value={details.capacity} />
            <Row label="Current workload" value={`${details.currentWorkload}%`} />
            <Row label="Shift hours" value={`${details.shiftHours} h`} />
            <Row label="Acceptance history" value={`${details.acceptanceHistory}%`} />
            <Row label="Risk score" value={details.riskScore} />
            <Row label="Confidence" value={`${details.confidence}%`} />
          </div>
        )}
      </aside>
    </div>
  );
}
