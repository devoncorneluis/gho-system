"use client";

import { useEffect, useState } from "react";
import type { EnterpriseIntelligenceSnapshot } from "../../lib/intelligence";

const EMPTY_SNAPSHOT: EnterpriseIntelligenceSnapshot = {
  schemaVersion: "1.0",
  generatedAt: new Date().toISOString(),
  status: "watch",
  confidence: 0,
  recommendations: [],
  risks: [],
  predictions: [],
  insights: [],
  explanations: [],
};

function statusClasses(status: EnterpriseIntelligenceSnapshot["status"]) {
  if (status === "critical") return "border-red-200 bg-red-50 text-red-800";
  if (status === "risk") return "border-orange-200 bg-orange-50 text-orange-800";
  if (status === "watch") return "border-amber-200 bg-amber-50 text-amber-800";
  return "border-green-200 bg-green-50 text-green-800";
}

export default function EnterpriseIntelligencePanel() {
  const [snapshot, setSnapshot] = useState<EnterpriseIntelligenceSnapshot>(EMPTY_SNAPSHOT);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadSnapshot() {
      try {
        const response = await fetch("/api/intelligence", { cache: "no-store" });
        if (!response.ok) return;
        const payload = (await response.json()) as EnterpriseIntelligenceSnapshot;
        if (mounted) setSnapshot(payload);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadSnapshot();

    return () => {
      mounted = false;
    };
  }, []);

  const primaryRecommendation = snapshot.recommendations[0];

  return (
    <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-1 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-bold uppercase text-gray-500">v1.1 Intelligence</p>
          <h2 className="mt-1 text-2xl font-black text-[#061B33]">Enterprise Intelligence</h2>
          <p className="mt-2 text-sm text-gray-600">
            Recommendations, risks, predictions, forecasts, and insights from one shared engine.
          </p>
        </div>
        <div className={`rounded-full border px-4 py-2 text-sm font-bold ${statusClasses(snapshot.status)}`}>
          {loading ? "Loading" : `${snapshot.status.toUpperCase()} · ${snapshot.confidence}%`}
        </div>
      </div>

      {primaryRecommendation && (
        <div className="mt-4 rounded-2xl border border-blue-100 bg-blue-50 p-4">
          <p className="text-xs font-bold uppercase text-blue-700">Top Recommendation</p>
          <h3 className="mt-2 text-xl font-black text-[#061B33]">{primaryRecommendation.title}</h3>
          <div className="mt-3 grid gap-3 md:grid-cols-3">
            <p className="text-sm font-semibold text-gray-700">Priority: {primaryRecommendation.priority}</p>
            <p className="text-sm font-semibold text-gray-700">Confidence: {primaryRecommendation.confidence}%</p>
            <p className="text-sm font-semibold text-gray-700">Action: {primaryRecommendation.action}</p>
          </div>
          <ul className="mt-3 space-y-1 text-sm text-gray-700">
            {primaryRecommendation.explanation.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
          <p className="text-xs font-bold uppercase text-gray-500">Recommendations</p>
          <p className="mt-2 text-2xl font-black text-[#061B33]">{snapshot.recommendations.length}</p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
          <p className="text-xs font-bold uppercase text-gray-500">Risks</p>
          <p className="mt-2 text-2xl font-black text-[#061B33]">{snapshot.risks.length}</p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
          <p className="text-xs font-bold uppercase text-gray-500">Predictions</p>
          <p className="mt-2 text-2xl font-black text-[#061B33]">{snapshot.predictions.length}</p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
          <p className="text-xs font-bold uppercase text-gray-500">Forecasts</p>
          <p className="mt-2 text-2xl font-black text-[#061B33]">
            {snapshot.predictions.filter((item) => item.id.includes("forecast") || item.id.includes("requirement")).length}
          </p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
          <p className="text-xs font-bold uppercase text-gray-500">Insights</p>
          <p className="mt-2 text-2xl font-black text-[#061B33]">{snapshot.insights.length}</p>
        </div>
      </div>
    </section>
  );
}
