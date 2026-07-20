"use client";

import { useEffect, useState } from "react";
import type { AiOperationsSnapshot } from "../../lib/ai";

const EMPTY_SNAPSHOT: AiOperationsSnapshot = {
  schemaVersion: "1.0",
  generatedAt: new Date().toISOString(),
  recommendations: [],
  predictedDelays: [],
  highRiskTrips: [],
  driverWorkloadBalance: {
    averageWorkload: 0,
    maxWorkload: 0,
    status: "Balanced",
  },
  vehicleUtilization: {
    averageUtilization: 0,
    status: "Healthy",
  },
  suggestedReassignments: [],
};

export default function AiOperationsPanel() {
  const [snapshot, setSnapshot] = useState<AiOperationsSnapshot>(EMPTY_SNAPSHOT);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadRecommendations() {
      try {
        const response = await fetch("/api/ai/recommendations", { cache: "no-store" });
        if (!response.ok) {
          return;
        }

        const payload = (await response.json()) as AiOperationsSnapshot;
        if (mounted) {
          setSnapshot(payload);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadRecommendations();

    return () => {
      mounted = false;
    };
  }, []);

  const primaryRecommendation = snapshot.recommendations[0];

  return (
    <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-1 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-2xl font-black text-[#061B33]">AI Operations</h2>
          <p className="mt-2 text-sm text-gray-600">
            Deterministic dispatch intelligence for dispatcher decision support.
          </p>
        </div>
        <div className="rounded-full border border-gray-200 bg-gray-50 px-4 py-2 text-sm font-bold text-[#061B33]">
          {loading ? "Loading" : `${snapshot.recommendations.length} recommendation(s)`}
        </div>
      </div>

      {primaryRecommendation && (
        <div className="mt-4 rounded-2xl border border-blue-100 bg-blue-50 p-4">
          <p className="text-xs font-bold uppercase text-blue-700">AI Dispatch Recommendation</p>
          <h3 className="mt-2 text-xl font-black text-[#061B33]">{primaryRecommendation.tripCode}</h3>
          <div className="mt-3 grid gap-3 md:grid-cols-3">
            <div>
              <p className="text-xs font-semibold uppercase text-gray-500">Driver</p>
              <p className="mt-1 font-bold text-[#061B33]">{primaryRecommendation.bestDriver?.name || "Pending"}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase text-gray-500">Vehicle</p>
              <p className="mt-1 font-bold text-[#061B33]">{primaryRecommendation.bestVehicle?.name || "Pending"}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase text-gray-500">Route</p>
              <p className="mt-1 font-bold text-[#061B33]">{primaryRecommendation.bestRoute?.name || "Pending"}</p>
            </div>
          </div>
          <div className="mt-3 grid gap-3 md:grid-cols-3">
            <p className="text-sm font-semibold text-gray-700">Confidence: {primaryRecommendation.confidenceScore}%</p>
            <p className="text-sm font-semibold text-gray-700">Risk: {primaryRecommendation.riskLevel}</p>
            <p className="text-sm font-semibold text-gray-700">Action: {primaryRecommendation.recommendedAction}</p>
          </div>
          <ul className="mt-3 space-y-1 text-sm text-gray-700">
            {primaryRecommendation.explanation.map((reason) => (
              <li key={reason}>{reason}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
          <p className="text-xs font-bold uppercase text-gray-500">Predicted Delays</p>
          <p className="mt-2 text-2xl font-black text-[#061B33]">{snapshot.predictedDelays.length}</p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
          <p className="text-xs font-bold uppercase text-gray-500">High-Risk Trips</p>
          <p className="mt-2 text-2xl font-black text-[#061B33]">{snapshot.highRiskTrips.length}</p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
          <p className="text-xs font-bold uppercase text-gray-500">Workload Balance</p>
          <p className="mt-2 text-xl font-black text-[#061B33]">{snapshot.driverWorkloadBalance.status}</p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
          <p className="text-xs font-bold uppercase text-gray-500">Vehicle Utilization</p>
          <p className="mt-2 text-xl font-black text-[#061B33]">{snapshot.vehicleUtilization.status}</p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
          <p className="text-xs font-bold uppercase text-gray-500">Suggested Reassignments</p>
          <p className="mt-2 text-2xl font-black text-[#061B33]">{snapshot.suggestedReassignments.length}</p>
        </div>
      </div>
    </section>
  );
}
