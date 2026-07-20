"use client";

import { useEffect, useState } from "react";
import { getUserPlatform } from "../../lib/getUserPlatform";
import { supabase } from "../../lib/supabase";

type FleetUnit = {
  id: string;
  name: string;
  status: string;
  eta: string;
  location: string;
};

const fallbackFleet: FleetUnit[] = [
  { id: "fallback-1", name: "V-101", status: "Available", eta: "ready", location: "North Hub" },
  { id: "fallback-2", name: "V-204", status: "En Route", eta: "12 min", location: "Airport Rd" },
  { id: "fallback-3", name: "V-315", status: "Maintenance", eta: "45 min", location: "Depot" },
];

function statusTone(status: string) {
  switch (status) {
    case "Available":
      return "bg-emerald-100 text-emerald-700";
    case "En Route":
    case "On Trip":
      return "bg-sky-100 text-sky-700";
    default:
      return "bg-amber-100 text-amber-700";
  }
}

export default function FleetStatusPanel() {
  const [units, setUnits] = useState<FleetUnit[]>(fallbackFleet);

  useEffect(() => {
    let mounted = true;

    async function loadFleet() {
      try {
        const userPlatform = await getUserPlatform();
        if (!userPlatform) return;

        const { data, error } = await supabase
          .from("vehicles")
          .select("id, vehicle_name, status")
          .eq("platform_id", userPlatform.platformId)
          .order("vehicle_name")
          .limit(4);

        if (!mounted) return;
        if (error || !data?.length) {
          setUnits(fallbackFleet);
          return;
        }

        const mapped = data.map((vehicle: any) => ({
          id: vehicle.id,
          name: vehicle.vehicle_name || "Unnamed vehicle",
          status: vehicle.status || "Unknown",
          eta: vehicle.status === "Available" ? "ready" : "dispatching",
          location: "Platform",
        }));

        setUnits(mapped);
      } catch (error) {
        console.warn("FleetStatusPanel load failed", error);
        if (mounted) setUnits(fallbackFleet);
      }
    }

    loadFleet();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-gray-500">Fleet Status</p>
          <h3 className="mt-1 text-xl font-black text-[#061B33]">Live vehicle posture</h3>
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-600">{units.length} visible</span>
      </div>

      <div className="mt-6 space-y-3">
        {units.map((unit) => (
          <div key={unit.id} className="flex items-center justify-between rounded-2xl border border-gray-100 bg-slate-50 px-4 py-3">
            <div>
              <p className="font-semibold text-[#061B33]">{unit.name}</p>
              <p className="text-sm text-gray-500">{unit.location}</p>
            </div>
            <div className="text-right">
              <span className={`rounded-full px-3 py-1 text-sm font-semibold ${statusTone(unit.status)}`}>{unit.status}</span>
              <p className="mt-2 text-sm text-gray-500">ETA {unit.eta}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
