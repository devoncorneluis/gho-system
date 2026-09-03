"use client";

import { Recommendation } from "../../lib/dispatch/recommendationEngine";
import DriverRecommendationCard from "../../lib/dispatch/DriverRecommendationCard";
import VehicleRecommendationCard from "../../lib/dispatch/VehicleRecommendationCard";
import DispatchConflicts from "../../lib/dispatch/DispatchConflicts";

type Props = {
  recommendation: Recommendation | null;
  onAssign: () => void;
};

export default function SmartDispatchPanel({
  recommendation,
  onAssign,
}: Props) {
  if (!recommendation) {
    return (
      <div className="rounded-2xl bg-white p-6 shadow">
        <p className="text-gray-500">
          No recommendation available.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      <div className="rounded-2xl bg-green-50 border border-green-200 p-5">

        <h2 className="text-2xl font-black text-green-700">
          ★ Smart Dispatch Recommendation
        </h2>

        <p className="mt-2 text-green-700">
          GHO has identified the highest scoring
          driver and vehicle combination.
        </p>

      </div>

      <div className="grid gap-6 lg:grid-cols-2">

        <DriverRecommendationCard
          driver={recommendation.driver}
          score={recommendation.driverScore}
        />

        <VehicleRecommendationCard
          vehicle={recommendation.vehicle}
          score={recommendation.vehicleScore}
        />

      </div>

      <DispatchConflicts
        conflicts={recommendation.conflicts}
      />

      <button
        onClick={onAssign}
        className="rounded-xl bg-[#061B33] px-8 py-4 font-bold text-white hover:bg-[#0B2B52]"
      >
        Approve Recommendation
      </button>

    </div>
  );
}
