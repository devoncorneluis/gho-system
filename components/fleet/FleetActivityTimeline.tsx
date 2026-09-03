"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

type Activity = {
  id: string;
  created_at: string | null;

  trip_code: string | null;

  event_type: string | null;
  event_title: string | null;
  event_description: string | null;

  driver_name: string | null;
  vehicle_name: string | null;

  severity: string | null;
};

export default function FleetActivityTimeline() {
  const [activities, setActivities] = useState<Activity[]>([]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/immutability
    loadActivities();

    const channel = supabase
      .channel("fleet-activity")

      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
table: "operations_history",
        },
        () => loadActivities()
      )

      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

async function loadActivities() {
  const { data } = await supabase
    .from("operations_history")
    .select(`
      id,
      created_at,
      trip_code,
      event_type,
      event_title,
      event_description,
      driver_name,
      vehicle_name,
      severity
    `)
    .order("created_at", { ascending: false })
    .limit(50);

  setActivities(data ?? []);
}
  return (
    <div className="rounded-xl bg-white shadow">
      <div className="border-b p-6">
        <h2 className="text-2xl font-bold text-[#0B3A82]">
          Operations Activity Timeline
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          Live operational events across the fleet.
        </p>
      </div>

      <div className="divide-y">
        {activities.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No recent activity.
          </div>
        ) : (
          activities.map((activity) => (
            <div
              key={activity.id}
              className="flex items-start gap-4 p-5"
            >
              <div
                className={`mt-2 h-3 w-3 rounded-full ${
                  activity.severity === "critical"
                    ? "bg-red-600"
                    : activity.severity === "warning"
                    ? "bg-orange-500"
                    : activity.severity === "success"
                    ? "bg-green-600"
                    : "bg-[#0B3A82]"
                }`}
              />

              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">
                    {activity.event_title ?? "Activity"}
                  </h3>

                  <span className="text-xs text-gray-400">
                    {activity.trip_code ?? "-"}
                  </span>
                </div>

                <p className="mt-1 text-sm text-gray-600">
                  {activity.event_description}
                </p>

                <div className="mt-2 flex flex-wrap gap-4 text-xs text-gray-500">
                  <span>Driver: {activity.driver_name ?? "-"}</span>
                  <span>Vehicle: {activity.vehicle_name ?? "-"}</span>
                </div>

                <p className="mt-2 text-xs text-gray-400">
                  {activity.created_at
                    ? new Date(activity.created_at).toLocaleString()
                    : "-"}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}