"use client";

import { DriverCandidate } from "../../lib/dispatch/recommendationEngine";

type Props = {
  driver: DriverCandidate;
  score: number;
};

export default function DriverRecommendationCard({
  driver,
  score,
}: Props) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5">

      <h3 className="text-xl font-black text-[#061B33]">
        Recommended Driver
      </h3>

      <div className="mt-4 space-y-2">

        <div className="flex justify-between">
          <span>Name</span>
          <strong>{driver.name}</strong>
        </div>

        <div className="flex justify-between">
          <span>Available</span>
          <strong>
            {driver.available ? "Yes" : "No"}
          </strong>
        </div>

        <div className="flex justify-between">
          <span>On Duty</span>
          <strong>
            {driver.onDuty ? "Yes" : "No"}
          </strong>
        </div>

        <div className="flex justify-between">
          <span>GPS Fresh</span>
          <strong>
            {driver.gpsFresh ? "Yes" : "No"}
          </strong>
        </div>

        <div className="flex justify-between">
          <span>Score</span>
          <strong className="text-green-600">
            {score}
          </strong>
        </div>

      </div>

    </div>
  );
}