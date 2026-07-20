"use client";

import type { ReassignmentRecommendation } from "../../types/recommendation";
import type { RecommendationDetails } from "../../lib/automation/automationFacade";

interface RecommendationPanelProps {
  recommendation?: ReassignmentRecommendation;
  details?: RecommendationDetails;
  onApprove: () => void;
  onIgnore: () => void;
  onViewReasoning: () => void;
}

export default function RecommendationPanel({
  recommendation,
  details,
  onApprove,
  onIgnore,
  onViewReasoning,
}: RecommendationPanelProps) {
  const etaImpact = details ? Math.max(0, Math.round(details.etaMinutes * 0.2)) : 0;
  const riskReduction = details ? Math.max(0, Math.round(details.riskScore * 0.3)) : 0;

  return (
    <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-gray-500">Recommendation</p>
          <h3 className="mt-1 text-xl font-black text-[#061B33]">Dispatch recommendation</h3>
        </div>
        <button onClick={onViewReasoning} className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-600">
          View Reasoning
        </button>
      </div>

      {!recommendation ? (
        <p className="mt-6 text-sm text-gray-500">No recommendation generated.</p>
      ) : (
        <div className="mt-6 space-y-3">
          <div className="rounded-2xl border border-gray-100 bg-slate-50 px-4 py-3">
            <p className="text-sm text-gray-500">Best driver</p>
            <p className="text-lg font-bold text-[#061B33]">{recommendation.recommendedDriverId}</p>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="rounded-2xl border border-gray-100 bg-slate-50 px-4 py-3">
              <p className="text-sm text-gray-500">Confidence</p>
              <p className="text-2xl font-black text-[#061B33]">{recommendation.confidence}%</p>
            </div>
            <div className="rounded-2xl border border-gray-100 bg-slate-50 px-4 py-3">
              <p className="text-sm text-gray-500">ETA impact</p>
              <p className="text-2xl font-black text-[#061B33]">-{etaImpact} min</p>
            </div>
          </div>
          <div className="rounded-2xl border border-gray-100 bg-slate-50 px-4 py-3">
            <p className="text-sm text-gray-500">Risk reduction</p>
            <p className="text-2xl font-black text-[#061B33]">{riskReduction}%</p>
          </div>
          <div className="rounded-2xl border border-gray-100 bg-slate-50 px-4 py-3">
            <p className="text-sm font-semibold text-gray-500">Reasoning</p>
            <ul className="mt-2 space-y-1 text-sm text-gray-600">
              {recommendation.reasons.slice(0, 3).map((reason) => (
                <li key={reason.code}>• {reason.message}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <div className="mt-6 flex flex-wrap gap-3">
        <button onClick={onApprove} className="rounded-lg bg-[#061B33] px-4 py-2 text-sm font-bold text-white">
          Approve
        </button>
        <button onClick={onIgnore} className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-bold text-gray-700">
          Ignore
        </button>
      </div>
    </section>
  );
}
