"use client";

import { VehicleCandidate } from "../../lib/dispatch/recommendationEngine";

type Props = {
  vehicle: VehicleCandidate;
  score: number;
};

export default function VehicleRecommendationCard({
  vehicle,
  score,
}: Props) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5">

      <h3 className="text-xl font-black text-[#061B33]">
        Recommended Vehicle
      </h3>

      <div className="mt-4 space-y-2">

        <div className="flex justify-between">
          <span>Vehicle</span>
          <strong>{vehicle.name}</strong>
        </div>

        <div className="flex justify-between">
          <span>Capacity</span>
          <strong>{vehicle.capacity}</strong>
        </div>

        <div className="flex justify-between">
          <span>Available</span>
          <strong>
            {vehicle.available ? "Yes" : "No"}
          </strong>
        </div>

        <div className="flex justify-between">
          <span>Assigned</span>
          <strong>
            {vehicle.assigned ? "Yes" : "No"}
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