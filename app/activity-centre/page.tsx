"use client";

import { useEffect, useState } from "react";
import AdminLayout from "../../components/AdminLayout";
import { supabase } from "../../lib/supabase";
import { getUserPlatform } from "../../lib/getUserPlatform";

type Activity = {
  id: string;
  activity_type: string;
  entity_type: string;
  entity_name: string | null;
  description: string;
  created_by_name: string | null;
  created_at: string;
};

export default function ActivityCentrePage() {
  const [activities, setActivities] = useState<Activity[]>([]);

useEffect(() => {
  let channel: ReturnType<typeof supabase.channel> | undefined;

  async function loadActivities() {
    const userPlatform = await getUserPlatform();

    if (!userPlatform) return;

    const load = async () => {
      const { data } = await supabase
        .from("activity_logs")
        .select("*")
        .eq("platform_id", userPlatform.platformId)
        .order("created_at", {
          ascending: false,
        });

      setActivities(data ?? []);
    };

    await load();

    channel = supabase
      .channel(`activity-${userPlatform.platformId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "activity_logs",
        },
        load
      )
      .subscribe();
  }

  loadActivities();

  return () => {
    if (channel) {
      supabase.removeChannel(channel);
    }
  };
}, []);

return (
  <AdminLayout>
    <main className="min-h-screen bg-gray-100 p-6">

        <h1 className="text-4xl font-black text-[#061B33]">
          Activity Centre
        </h1>

        <p className="mt-2 text-gray-600">
          Live operational audit history.
        </p>

        <div className="mt-8 rounded-2xl bg-white shadow">

          {activities.length === 0 ? (
            <div className="p-10 text-center text-gray-500">
              No activity recorded.
            </div>
          ) : (
            activities.map((activity) => (
              <div
                key={activity.id}
                className="border-b p-5 last:border-b-0"
              >
                <div className="flex items-center justify-between">

                  <div>

                    <p className="font-bold text-[#061B33]">
                      {activity.description}
                    </p>

                    <p className="mt-1 text-sm text-gray-500">
                      {activity.entity_type} •{" "}
                      {activity.entity_name ?? "-"}
                    </p>

                  </div>

                  <div className="text-right">

                    <p className="text-sm font-semibold">
                      {activity.created_by_name ?? "System"}
                    </p>

                    <p className="text-xs text-gray-500">
                      {new Date(
                        activity.created_at
                      ).toLocaleString()}
                    </p>

                  </div>

                </div>
              </div>
            ))
          )}

        </div>

      </main>
    </AdminLayout>
  );
}