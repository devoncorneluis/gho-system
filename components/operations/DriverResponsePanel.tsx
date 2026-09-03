"use client";

import { useEffect, useState } from "react";
import { getUserPlatform } from "../../lib/getUserPlatform";
import { supabase } from "../../lib/supabase";

type ResponseItem = {
  driver: string;
  trip: string;
  status: "Pending" | "Accepted" | "Rejected";
  eta: string;
};

const fallbackResponses: ResponseItem[] = [
  { driver: "Maya Hassan", trip: "TRIP-104", status: "Pending", eta: "2 min" },
  { driver: "Omar Noor", trip: "TRIP-112", status: "Accepted", eta: "confirmed" },
  { driver: "Nadia Cole", trip: "TRIP-117", status: "Rejected", eta: "declined" },
];

const toneMap: Record<string, string> = {
  Pending: "bg-amber-100 text-amber-700",
  Accepted: "bg-emerald-100 text-emerald-700",
  Rejected: "bg-rose-100 text-rose-700",
};

type ResponseTripRow = {
  id: string;
  trip_code: string | null;
  driver_name: string | null;
  driver_response: string | null;
};

export default function DriverResponsePanel() {
  const [responses, setResponses] = useState<ResponseItem[]>(fallbackResponses);

  useEffect(() => {
    let mounted = true;

    async function loadResponses() {
      try {
        const userPlatform = await getUserPlatform();
        if (!userPlatform) return;

        const { data, error } = await supabase
          .from("trips")
          .select("id, trip_code, driver_name, driver_response")
          .eq("platform_id", userPlatform.platformId)
          .not("driver_response", "is", null)
          .order("id", { ascending: false })
          .limit(5);

        if (!mounted) return;
        if (error || !data?.length) {
          setResponses(fallbackResponses);
          return;
        }

        const mapped = ((data as ResponseTripRow[] | null) ?? []).map((trip) => ({
          driver: trip.driver_name || "Unassigned",
          trip: trip.trip_code || trip.id,
          status: (trip.driver_response || "pending").charAt(0).toUpperCase() + (trip.driver_response || "pending").slice(1),
          eta: trip.driver_response === "accepted" ? "confirmed" : trip.driver_response === "rejected" ? "declined" : "awaiting",
        })) as ResponseItem[];

        setResponses(mapped);
      } catch (error) {
        console.warn("DriverResponsePanel load failed", error);
        if (mounted) setResponses(fallbackResponses);
      }
    }

    loadResponses();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-gray-500">Driver Response</p>
          <h3 className="mt-1 text-xl font-black text-[#061B33]">Dispatch acknowledgements</h3>
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-600">{responses.length} live</span>
      </div>

      <div className="mt-6 space-y-3">
        {responses.map((item) => (
          <div key={`${item.driver}-${item.trip}`} className="flex items-center justify-between rounded-2xl border border-gray-100 bg-slate-50 px-4 py-3">
            <div>
              <p className="font-semibold text-[#061B33]">{item.driver}</p>
              <p className="text-sm text-gray-500">{item.trip}</p>
            </div>
            <div className="text-right">
              <span className={`rounded-full px-3 py-1 text-sm font-semibold ${toneMap[item.status]}`}>{item.status}</span>
              <p className="mt-2 text-sm text-gray-500">{item.eta}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
