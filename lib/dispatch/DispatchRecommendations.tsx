"use client";

import { Recommendation } from "../../lib/dispatch/recommendationEngine";

type Props = {
  recommendations: Recommendation[];
  onSelect: (recommendation: Recommendation) => void;
};

export default function DispatchRecommendations({
  recommendations,
  onSelect,
}: Props) {
  if (recommendations.length === 0) {
    return (
      <div className="rounded-2xl bg-white p-6 shadow">
        <p className="text-gray-500">
          No recommendations available.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-white p-6 shadow">

      <h2 className="text-2xl font-black text-[#061B33] mb-6">
        Smart Dispatch Recommendations
      </h2>

      <div className="space-y-4">

        {recommendations.slice(0, 5).map((item, index) => {

          const totalScore =
            item.driverScore + item.vehicleScore;

          return (
            <div
              key={`${item.driver.id}-${item.vehicle.id}`}
              className="rounded-xl border border-gray-200 p-5"
            >

              <div className="flex justify-between items-start">

                <div>

                  <div className="flex items-center gap-3">

                    <span className="rounded-full bg-[#061B33] px-3 py-1 text-sm font-bold text-white">
                      #{index + 1}
                    </span>

                    <h3 className="text-xl font-bold text-[#061B33]">
                      {item.driver.name}
                    </h3>

                  </div>

                  <div className="mt-3 grid gap-2 text-sm">

                    <div>
                      <strong>Vehicle:</strong>{" "}
                      {item.vehicle.name}
                    </div>

                    <div>
                      <strong>Driver Score:</strong>{" "}
                      {item.driverScore}
                    </div>

                    <div>
                      <strong>Vehicle Score:</strong>{" "}
                      {item.vehicleScore}
                    </div>

                    <div>
                      <strong>Total Score:</strong>{" "}
                      {totalScore}
                    </div>

                  </div>

                </div>

                <button
                  onClick={() => onSelect(item)}
                  className="rounded-xl bg-green-600 px-5 py-3 font-semibold text-white hover:bg-green-700"
                >
                  Assign
                </button>

              </div>

              {item.conflicts.length > 0 && (

                <div className="mt-4 rounded-lg bg-red-50 border border-red-200 p-3">

                  <p className="font-semibold text-red-700">
                    Dispatch Warnings
                  </p>

                  <ul className="mt-2 list-disc pl-5 text-sm text-red-700">

                    {item.conflicts.map((conflict, i) => (
                      <li key={i}>
                        {conflict.message}
                      </li>
                    ))}

                  </ul>

                </div>

              )}

            </div>
          );

        })}

      </div>

    </div>
  );
}