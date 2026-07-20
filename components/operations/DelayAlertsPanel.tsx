"use client";

import { useEffect, useState } from "react";
import { getUserPlatform } from "../../lib/getUserPlatform";
import { supabase } from "../../lib/supabase";
import { detectDelay } from "../../lib/intelligence/delayDetector";
import type { AlertSeverity, DelayAlert } from "../../lib/intelligence/intelligenceTypes";

type DelayRow = DelayAlert & {
  tripCode: string;
};

type TripDelayRecord = {
  id: string;
  trip_code: string | null;
  trip_date: string | null;
  pickup_time: string | null;
  dropoff_time: string | null;
  status: string | null;
  updated_at: string | null;
};

const severityTone: Record<AlertSeverity, string> = {
  low: "bg-gray-100 text-gray-700",
  medium: "bg-amber-100 text-amber-700",
  high: "bg-orange-100 text-orange-700",
  critical: "bg-rose-100 text-rose-700",
};

function toDateTime(dateValue?: string | null, timeValue?: string | null): string | null {
  if (!dateValue || !timeValue) return null;
  const datePart = String(dateValue).split("T")[0];
  const timePart = String(timeValue).slice(0, 8);
  const merged = new Date(`${datePart}T${timePart}`);
  return Number.isNaN(merged.getTime()) ? null : merged.toISOString();
}

function severityRank(severity: AlertSeverity) {
  if (severity === "critical") return 4;
  if (severity === "high") return 3;
  if (severity === "medium") return 2;
  return 1;
}

export default function DelayAlertsPanel() {
  const [alerts, setAlerts] = useState<DelayRow[]>([]);

  useEffect(() => {
    let mounted = true;

    async function loadDelayAlerts() {
      try {
        const userPlatform = await getUserPlatform();
        if (!userPlatform) return;

        const { data, error } = await supabase
          .from("trips")
          .select("id, trip_code, trip_date, pickup_time, dropoff_time, status, updated_at")
          .eq("platform_id", userPlatform.platformId)
          .in("status", ["Assigned", "In Progress", "Accepted", "Dispatched"])
          .limit(40);

        if (!mounted) return;
        if (error || !data?.length) {
          setAlerts([]);
          return;
        }

        const derived = (data as TripDelayRecord[])
          .map((trip) => {
            const updatedAt = trip.updated_at ? new Date(trip.updated_at) : null;
            const freshnessMinutes = updatedAt
              ? Math.max(0, Math.round((Date.now() - updatedAt.getTime()) / 60000))
              : 0;

            const alert = detectDelay({
              tripId: trip.id,
              pickupDueAt: toDateTime(trip.trip_date, trip.pickup_time),
              dropoffDueAt: toDateTime(trip.trip_date, trip.dropoff_time),
              currentStatus: freshnessMinutes > 8 ? "stalled" : trip.status,
              dwellMinutes: freshnessMinutes,
            });

            if (!alert) return null;

            return {
              ...alert,
              tripCode: trip.trip_code || trip.id,
            } as DelayRow;
          })
          .filter(Boolean) as DelayRow[];

        derived.sort((a, b) => {
          const bySeverity = severityRank(b.severity) - severityRank(a.severity);
          if (bySeverity !== 0) return bySeverity;
          return b.minutesLate - a.minutesLate;
        });

        setAlerts(derived.slice(0, 6));
      } catch (error) {
        console.warn("DelayAlertsPanel load failed", error);
        if (mounted) setAlerts([]);
      }
    }

    loadDelayAlerts();
    const timer = setInterval(loadDelayAlerts, 10000);

    return () => {
      mounted = false;
      clearInterval(timer);
    };
  }, []);

  return (
    <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-gray-500">Delay Intelligence</p>
          <h3 className="mt-1 text-xl font-black text-[#061B33]">Live delay alerts</h3>
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-600">{alerts.length} open</span>
      </div>

      <div className="mt-6 space-y-3">
        {alerts.length === 0 ? (
          <p className="text-sm text-gray-500">No delay alerts detected.</p>
        ) : (
          alerts.map((alert) => (
            <div key={`${alert.tripId}-${alert.reason}`} className="rounded-2xl border border-gray-100 bg-slate-50 px-4 py-3">
              <div className="flex items-center justify-between gap-3">
                <p className="font-semibold text-[#061B33]">{alert.tripCode}</p>
                <span className={`rounded-full px-3 py-1 text-sm font-semibold ${severityTone[alert.severity]}`}>{alert.severity}</span>
              </div>
              <p className="mt-1 text-sm text-gray-600">{alert.reason}</p>
              <p className="mt-1 text-sm text-gray-500">{alert.minutesLate} minutes over threshold</p>
            </div>
          ))
        )}
      </div>
    </section>
  );
}