"use client";

import { useEffect, useState } from "react";
import { getUserPlatform } from "../../lib/getUserPlatform";
import { supabase } from "../../lib/supabase";
import { detectDelay } from "../../lib/intelligence/delayDetector";
import { assessTripRisk } from "../../lib/intelligence/riskEngine";

type RiskItem = {
  tripId: string;
  tripCode: string;
  score: number;
  reasons: string[];
};

type TripRiskRecord = {
  id: string;
  trip_code: string | null;
  trip_date: string | null;
  pickup_time: string | null;
  dropoff_time: string | null;
  status: string | null;
  passenger_count: number | null;
  driver_response: string | null;
  updated_at: string | null;
};

function toDateTime(dateValue?: string | null, timeValue?: string | null): string | null {
  if (!dateValue || !timeValue) return null;
  const datePart = String(dateValue).split("T")[0];
  const timePart = String(timeValue).slice(0, 8);
  const merged = new Date(`${datePart}T${timePart}`);
  return Number.isNaN(merged.getTime()) ? null : merged.toISOString();
}

function scoreTone(score: number) {
  if (score >= 70) return "bg-rose-100 text-rose-700";
  if (score >= 45) return "bg-amber-100 text-amber-700";
  return "bg-emerald-100 text-emerald-700";
}

export default function RiskAssessmentPanel() {
  const [risks, setRisks] = useState<RiskItem[]>([]);

  useEffect(() => {
    let mounted = true;

    async function loadRisks() {
      try {
        const userPlatform = await getUserPlatform();
        if (!userPlatform) return;

        const { data, error } = await supabase
          .from("trips")
          .select("id, trip_code, trip_date, pickup_time, dropoff_time, status, passenger_count, driver_response, updated_at")
          .eq("platform_id", userPlatform.platformId)
          .in("status", ["Assigned", "In Progress", "Accepted", "Dispatched", "In Transit"])
          .limit(40);

        if (!mounted) return;
        if (error || !data?.length) {
          setRisks([]);
          return;
        }

        const derived = (data as TripRiskRecord[])
          .map((trip) => {
            const updatedAt = trip.updated_at ? new Date(trip.updated_at) : null;
            const freshnessMinutes = updatedAt
              ? Math.max(0, Math.round((Date.now() - updatedAt.getTime()) / 60000))
              : 0;

            const delay = detectDelay({
              tripId: trip.id,
              pickupDueAt: toDateTime(trip.trip_date, trip.pickup_time),
              dropoffDueAt: toDateTime(trip.trip_date, trip.dropoff_time),
              currentStatus: freshnessMinutes > 8 ? "stalled" : trip.status,
              dwellMinutes: freshnessMinutes,
            });

            const assessment = assessTripRisk({
              tripId: trip.id,
              delayMinutes: delay?.minutesLate ?? 0,
              driverResponse: trip.driver_response,
              passengerCount: trip.passenger_count ?? 0,
              trackingFreshnessMinutes: freshnessMinutes,
              currentStatus: trip.status,
            });

            return {
              tripId: trip.id,
              tripCode: trip.trip_code || trip.id,
              score: assessment.score,
              reasons: assessment.reasons,
            } as RiskItem;
          })
          .filter((item) => item.score >= 20)
          .sort((a, b) => b.score - a.score)
          .slice(0, 6);

        setRisks(derived);
      } catch (error) {
        console.warn("RiskAssessmentPanel load failed", error);
        if (mounted) setRisks([]);
      }
    }

    loadRisks();
    const timer = setInterval(loadRisks, 10000);

    return () => {
      mounted = false;
      clearInterval(timer);
    };
  }, []);

  return (
    <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-gray-500">Risk Engine</p>
          <h3 className="mt-1 text-xl font-black text-[#061B33]">Trip risk ranking</h3>
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-600">{risks.length} flagged</span>
      </div>

      <div className="mt-6 space-y-3">
        {risks.length === 0 ? (
          <p className="text-sm text-gray-500">No elevated trip risks.</p>
        ) : (
          risks.map((risk) => (
            <div key={risk.tripId} className="rounded-2xl border border-gray-100 bg-slate-50 px-4 py-3">
              <div className="flex items-center justify-between gap-3">
                <p className="font-semibold text-[#061B33]">{risk.tripCode}</p>
                <span className={`rounded-full px-3 py-1 text-sm font-semibold ${scoreTone(risk.score)}`}>Risk {risk.score}</span>
              </div>
              <p className="mt-1 text-sm text-gray-600">{risk.reasons[0] || "No risk factors available."}</p>
            </div>
          ))
        )}
      </div>
    </section>
  );
}