"use client";

import React, { useCallback, useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { getUserPlatform } from "../../lib/getUserPlatform";
import { acceptDriverDispatch, rejectDriverDispatch } from "../../lib/dispatchService";
import { TRIP_STATUS, TRIP_STATUS_COLORS, getStatusLabel } from "../../lib/tripStatus";
import type { TripStatus } from "../../lib/tripStatus";

type TripRow = {
  id: string;
  trip_code: string;
  trip_date: string | null;
  shift?: string | null;
  area?: string | null;
  driver_name?: string | null;
  vehicle_name?: string | null;
  status?: string | null;
  driver_response?: string | null;
  passenger_count?: number | null;
  platform_id?: string | null;
};

type RealtimePayload = {
  eventType?: "INSERT" | "UPDATE" | "DELETE";
  type?: "INSERT" | "UPDATE" | "DELETE";
  event?: "INSERT" | "UPDATE" | "DELETE";
  new?: TripRow | null;
  old?: TripRow | null;
};

const ACTIVE_STATUSES: string[] = [
  TRIP_STATUS.PLANNED,
  TRIP_STATUS.APPROVED,
  TRIP_STATUS.ASSIGNED,
  TRIP_STATUS.DISPATCHED,
  TRIP_STATUS.ACCEPTED,
  TRIP_STATUS.EN_ROUTE,
  TRIP_STATUS.PICKING_UP,
  TRIP_STATUS.IN_TRANSIT,
];

function isActiveStatus(status?: string | null): boolean {
  return typeof status === "string" && ACTIVE_STATUSES.includes(status);
}

export default function DispatchQueuePanel() {
  const [trips, setTrips] = useState<TripRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState<string[]>([]);

  const applyInsert = useCallback((newRec: TripRow | null, platformId: string) => {
    if (!newRec) return;
    if (newRec.platform_id && newRec.platform_id !== platformId) return;
    if (!isActiveStatus(newRec.status)) return;

    setTrips((prev) => {
      // avoid duplicates
      if (prev.find((p) => p.id === newRec.id)) return prev;
      const row: TripRow = {
        id: newRec.id,
        trip_code: newRec.trip_code,
        trip_date: newRec.trip_date,
        shift: newRec.shift,
        area: newRec.area,
        driver_name: newRec.driver_name,
        vehicle_name: newRec.vehicle_name,
        status: newRec.status,
        driver_response: newRec.driver_response,
        passenger_count: newRec.passenger_count,
      };
      const next = [...prev, row];
      next.sort((a, b) => (a.trip_date || "").localeCompare(b.trip_date || ""));
      return next;
    });
  }, []);

  const applyDelete = useCallback((oldRec: TripRow | null) => {
    if (!oldRec) return;
    setTrips((prev) => prev.filter((p) => p.id !== oldRec.id));
  }, []);

  function markProcessing(id: string) {
    setProcessing((s) => (s.includes(id) ? s : [...s, id]));
  }

  function unmarkProcessing(id: string) {
    setProcessing((s) => s.filter((x) => x !== id));
  }

  async function handleAccept(trip: TripRow) {
    const userPlatform = await getUserPlatform();
    if (!userPlatform) {
      window.location.href = "/login";
      return;
    }
    const platformId = userPlatform.platformId;
    const userId = userPlatform.userId;

    // optimistic update
    const prev = trips.find((t) => t.id === trip.id) || null;
    setTrips((prevList) =>
      prevList.map((t) => (t.id === trip.id ? { ...t, driver_response: "accepted" } : t))
    );
    markProcessing(trip.id);

    try {
      await acceptDriverDispatch(trip.id, platformId, userId);
    } catch (e: unknown) {
      // revert
      if (prev) {
        setTrips((prevList) => prevList.map((t) => (t.id === trip.id ? prev : t)));
      }
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      unmarkProcessing(trip.id);
    }
  }

  async function handleReject(trip: TripRow) {
    const userPlatform = await getUserPlatform();
    if (!userPlatform) {
      window.location.href = "/login";
      return;
    }
    const platformId = userPlatform.platformId;
    const userId = userPlatform.userId;

    const prev = trips.find((t) => t.id === trip.id) || null;
    setTrips((prevList) => prevList.map((t) => (t.id === trip.id ? { ...t, driver_response: "rejected" } : t)));
    markProcessing(trip.id);

    try {
      await rejectDriverDispatch(trip.id, platformId, userId);
    } catch (e: unknown) {
      if (prev) {
        setTrips((prevList) => prevList.map((t) => (t.id === trip.id ? prev : t)));
      }
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      unmarkProcessing(trip.id);
    }
  }

  const applyUpdate = useCallback((oldRec: TripRow | null, newRec: TripRow | null, platformId: string) => {
    if (newRec && newRec.platform_id && newRec.platform_id !== platformId) return;

    setTrips((prev) => {
      const idx = prev.findIndex((p) => p.id === (newRec?.id || oldRec?.id));

      const wasPresent = idx !== -1;
      const nowActive = isActiveStatus(newRec?.status);

      // If status moved out of active set, remove
      if (wasPresent && !nowActive) {
        return prev.filter((p) => p.id !== (newRec?.id || oldRec?.id));
      }

      // If it was not present but now active, insert
      if (!wasPresent && nowActive && newRec) {
        const row: TripRow = {
          id: newRec.id,
          trip_code: newRec.trip_code,
          trip_date: newRec.trip_date,
          shift: newRec.shift,
          area: newRec.area,
          driver_name: newRec.driver_name,
          vehicle_name: newRec.vehicle_name,
          status: newRec.status,
          driver_response: newRec.driver_response,
          passenger_count: newRec.passenger_count,
        };
        const next = [...prev, row];
        next.sort((a, b) => (a.trip_date || "").localeCompare(b.trip_date || ""));
        return next;
      }

      // Otherwise update in-place
      if (wasPresent && nowActive && newRec) {
        const updated = { ...(prev[idx] as TripRow) };
        if (newRec.trip_code !== undefined) updated.trip_code = newRec.trip_code;
        if (newRec.trip_date !== undefined) updated.trip_date = newRec.trip_date;
        if (newRec.shift !== undefined) updated.shift = newRec.shift;
        if (newRec.area !== undefined) updated.area = newRec.area;
        if (newRec.driver_name !== undefined) updated.driver_name = newRec.driver_name;
        if (newRec.vehicle_name !== undefined) updated.vehicle_name = newRec.vehicle_name;
        if (newRec.status !== undefined) updated.status = newRec.status;
        if (newRec.driver_response !== undefined) updated.driver_response = newRec.driver_response;
        if (newRec.passenger_count !== undefined) updated.passenger_count = newRec.passenger_count;

        const next = [...prev];
        next[idx] = updated;
        next.sort((a, b) => (a.trip_date || "").localeCompare(b.trip_date || ""));
        return next;
      }

      return prev;
    });
  }, []);

  const loadTrips = useCallback(async () => {
    setLoading(true);
    setError(null);

    const userPlatform = await getUserPlatform();
    if (!userPlatform) {
      window.location.href = "/login";
      return;
    }

    const platformId = userPlatform.platformId;

    try {
      const { data, error } = await supabase
        .from("trips")
        .select(
          "id, trip_code, trip_date, shift, area, driver_name, vehicle_name, status, driver_response, passenger_count"
        )
        .in("status", ACTIVE_STATUSES)
        .eq("platform_id", platformId)
        .order("trip_date", { ascending: true });

      if (error) {
        setError(error.message);
        setTrips([]);
      } else {
        setTrips((data as TripRow[]) || []);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
      setTrips([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let channel: {
      subscribe?: () => unknown;
      unsubscribe?: () => void;
    } | null = null;
    let isMounted = true;

    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadTrips();
    const timer = setInterval(() => {
      if (isMounted) loadTrips();
    }, 10000);

    (async () => {
      try {
        const userPlatform = await getUserPlatform();
        if (!userPlatform) return;
        const platformId = userPlatform.platformId;

        channel = supabase
          .channel("trips-listener")
          .on(
            "postgres_changes",
            { event: "*", schema: "public", table: "trips" },
            (payload) => {
              try {
                const typedPayload = payload as unknown as RealtimePayload;
                const evType = typedPayload.eventType || typedPayload.type || typedPayload.event || null;
                const newRec = typedPayload.new || null;
                const oldRec = typedPayload.old || null;
                const record = newRec || oldRec;
                if (!record) return;
                if (record.platform_id && record.platform_id !== platformId) return;

                if (evType === "INSERT" || (!evType && newRec && !oldRec)) {
                  applyInsert(newRec, platformId);
                } else if (evType === "DELETE" || (!evType && oldRec && !newRec)) {
                  applyDelete(oldRec);
                } else {
                  applyUpdate(oldRec, newRec, platformId);
                }
              } catch (e) {
                console.warn("DispatchQueue delta apply error:", e);
                if (isMounted) loadTrips();
              }
            }
          );

        try {
          channel.subscribe?.();
        } catch (subErr) {
          // subscription may fail in local dev without real-time enabled — fall back to polling
          console.warn("Supabase realtime subscription failed:", subErr);
        }
      } catch (err) {
        console.warn("DispatchQueue subscription setup error:", err);
      }
    })();

    return () => {
      isMounted = false;
      clearInterval(timer);
      try {
        if (channel) {
          const maybeChannel = channel as { unsubscribe?: () => void };
          maybeChannel.unsubscribe?.();
          try {
            const maybeClient = supabase as { removeChannel?: (value: unknown) => void };
            maybeClient.removeChannel?.(channel);
          } catch {
            // ignore cleanup errors
          }
        }
      } catch {
        // ignore cleanup errors
      }
    };
  }, [applyDelete, applyInsert, applyUpdate, loadTrips]);

  if (loading) {
    return (
      <div className="p-6 bg-white rounded-3xl shadow-sm border border-gray-100">
        <p className="text-sm text-gray-500">Loading dispatch queue…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-white rounded-3xl shadow-sm border border-gray-100">
        <p className="text-sm text-red-600">Error: {error}</p>
      </div>
    );
  }
  return (
    <div className="p-6 bg-white rounded-3xl shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-[#061B33]">Dispatch Queue</h3>
        <p className="text-sm text-gray-500">Active trips only • Refreshes every 10s</p>
      </div>

      {trips.length === 0 ? (
        <p className="text-sm text-gray-500">No active trips.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b text-gray-500">
                <th className="py-3">Trip</th>
                <th>Date</th>
                <th>Shift</th>
                <th>Area</th>
                <th>Driver</th>
                <th>Vehicle</th>
                <th>Status</th>
                <th>Response</th>
                <th className="text-right">Pax</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {trips.map((t) => (
                <tr key={t.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 font-medium">{t.trip_code}</td>
                  <td className="text-gray-600">{t.trip_date ? new Date(t.trip_date).toLocaleDateString() : "-"}</td>
                  <td>{t.shift || "-"}</td>
                  <td className="text-gray-600">{t.area || "-"}</td>
                  <td>{t.driver_name || "-"}</td>
                  <td>{t.vehicle_name || "-"}</td>
                  <td>
                    <span
                      className={`px-2 py-1 rounded-xl text-xs font-semibold ${
                        t.status && typeof t.status === "string"
                          ? ((TRIP_STATUS_COLORS as Record<string, string>)[t.status] ?? "text-gray-700 bg-gray-100")
                          : "text-gray-700 bg-gray-100"
                      }`}
                    >
                      {t.status ? getStatusLabel(t.status as TripStatus) : "Unknown"}
                    </span>
                  </td>
                  <td>
                    <span className={`px-2 py-1 rounded-xl text-xs font-semibold ${responseBadgeClass(t.driver_response)}`}>
                      {t.driver_response || "pending"}
                    </span>
                  </td>
                  <td className="text-right">{t.passenger_count ?? 0}</td>
                  <td>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => (window.location.href = `/trips/${t.id}`)}
                        className="text-blue-600 hover:underline"
                      >
                        Open
                      </button>

                      {(t.driver_response === null || t.driver_response === "" || t.driver_response === "pending") && (
                        <>
                          <button
                            onClick={() => handleAccept(t)}
                            disabled={processing.includes(t.id)}
                            className={`text-sm px-2 py-1 rounded-full font-semibold ${processing.includes(t.id) ? "bg-gray-100 text-gray-400" : "bg-green-50 text-green-700 hover:bg-green-100"}`}
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => handleReject(t)}
                            disabled={processing.includes(t.id)}
                            className={`text-sm px-2 py-1 rounded-full font-semibold ${processing.includes(t.id) ? "bg-gray-100 text-gray-400" : "bg-red-50 text-red-700 hover:bg-red-100"}`}
                          >
                            Reject
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function responseBadgeClass(resp?: string | null) {
  if (!resp || resp === "pending") return "bg-gray-100 text-gray-700";
  if (resp === "accepted") return "bg-green-100 text-green-700";
  if (resp === "rejected") return "bg-red-100 text-red-700";
  return "bg-gray-100 text-gray-700";
}
