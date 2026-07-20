"use client";

import { useEffect, useState } from "react";
import { getUserPlatform } from "../../lib/getUserPlatform";
import { supabase } from "../../lib/supabase";

type FeedItem = {
  time: string;
  title: string;
  detail: string;
};

const fallbackFeed: FeedItem[] = [
  { time: "2m ago", title: "Vehicle assigned", detail: "V-204 moved to TRIP-112" },
  { time: "6m ago", title: "Driver acknowledged", detail: "Maya accepted dispatch" },
  { time: "11m ago", title: "SLA warning", detail: "One trip is trending late" },
];

export default function ActivityFeedPanel() {
  const [feed, setFeed] = useState<FeedItem[]>(fallbackFeed);

  useEffect(() => {
    let mounted = true;

    async function loadFeed() {
      try {
        const userPlatform = await getUserPlatform();
        if (!userPlatform) return;

        const { data, error } = await supabase
          .from("trips")
          .select("id, trip_code, status")
          .eq("platform_id", userPlatform.platformId)
          .order("id", { ascending: false })
          .limit(4);

        if (!mounted) return;
        if (error || !data?.length) {
          setFeed(fallbackFeed);
          return;
        }

        const mapped = data.map((trip: any, index: number) => ({
          time: `${index + 1}m ago`,
          title: trip.trip_code || `Trip ${trip.id}`,
          detail: trip.status || "Updated",
        }));

        setFeed(mapped);
      } catch (error) {
        console.warn("ActivityFeedPanel load failed", error);
        if (mounted) setFeed(fallbackFeed);
      }
    }

    loadFeed();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-gray-500">Activity Feed</p>
          <h3 className="mt-1 text-xl font-black text-[#061B33]">Recent operations events</h3>
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-600">Live</span>
      </div>

      <div className="mt-6 space-y-3">
        {feed.map((item) => (
          <div key={`${item.time}-${item.title}`} className="rounded-2xl border border-gray-100 bg-slate-50 px-4 py-3">
            <div className="flex items-center justify-between">
              <p className="font-semibold text-[#061B33]">{item.title}</p>
              <span className="text-sm text-gray-500">{item.time}</span>
            </div>
            <p className="mt-1 text-sm text-gray-500">{item.detail}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
