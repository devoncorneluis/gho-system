"use client";

import { useEffect, useState } from "react";
import { APIProvider, Map, Marker, Polyline } from "@vis.gl/react-google-maps";
import AdminLayout from "../../components/AdminLayout";
import { supabase } from "../../lib/supabase";

const PLATFORM_ID = "713c411b-847e-4379-8e38-c142e06ff5fd";

type LocationHistory = {
  id: string;
  driver_id: string | null;
  driver_name: string | null;
  latitude: number | null;
  longitude: number | null;
  speed: number | null;
  trip_id: string | null;
  recorded_at: string | null;
};

export default function RoutePlaybackPage() {
  const [history, setHistory] = useState<LocationHistory[]>([]);
  const [selectedDriver, setSelectedDriver] = useState("");
  const [playIndex, setPlayIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  async function loadHistory() {
    const { data, error } = await supabase
      .from("driver_location_history")
      .select("*")
      .eq("platform_id", PLATFORM_ID)
      .order("recorded_at", { ascending: false })
      .limit(50);

    if (error) {
      alert(error.message);
      return;
    }

    setHistory((data || []).reverse());
  }

  useEffect(() => {
    loadHistory();
  }, []);

  const drivers = Array.from(
    new Set(history.map((item) => item.driver_name).filter(Boolean))
  ) as string[];

  const filteredHistory = history.filter((item) => {
    if (!selectedDriver) return true;
    return item.driver_name === selectedDriver;
  });

  const validPoints = filteredHistory.filter(
    (item) => item.latitude !== null && item.longitude !== null
  );

  const routePath = validPoints.map((item) => ({
    lat: Number(item.latitude),
    lng: Number(item.longitude),
  }));

  const currentPoint = validPoints[playIndex];

  const center =
    currentPoint?.latitude && currentPoint?.longitude
      ? { lat: Number(currentPoint.latitude), lng: Number(currentPoint.longitude) }
      : routePath[0] || { lat: -33.918861, lng: 18.4233 };

  useEffect(() => {
    if (!isPlaying || validPoints.length === 0) return;

    const timer = setInterval(() => {
      setPlayIndex((current) => {
        if (current >= validPoints.length - 1) {
          setIsPlaying(false);
          return current;
        }

        return current + 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isPlaying, validPoints.length]);

  function resetPlayback() {
    setPlayIndex(0);
    setIsPlaying(false);
  }

  return (
    <AdminLayout>
      <main className="min-h-screen bg-[#F3F6FA] p-6">
        <section className="rounded-3xl bg-[#061B33] text-white p-8 shadow-xl">
          <p className="text-orange-400 font-bold tracking-wide uppercase">
            Corneluis Group Pty Ltd
          </p>

          <h1 className="text-4xl md:text-5xl font-black mt-2">
            GHO Route Playback
          </h1>

          <p className="text-gray-300 mt-3">
            Replay driver GPS history and review completed route movement.
          </p>
        </section>

        <section className="bg-white rounded-3xl shadow p-6 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <select
              value={selectedDriver}
              onChange={(e) => {
                setSelectedDriver(e.target.value);
                resetPlayback();
              }}
              className="border p-3 rounded-xl"
            >
              <option value="">All Drivers</option>
              {drivers.map((driver) => (
                <option key={driver} value={driver}>
                  {driver}
                </option>
              ))}
            </select>

            <button
              onClick={() => setIsPlaying(true)}
              className="bg-green-600 text-white px-5 py-3 rounded-xl font-bold"
            >
              ▶ Play
            </button>

            <button
              onClick={() => setIsPlaying(false)}
              className="bg-orange-500 text-white px-5 py-3 rounded-xl font-bold"
            >
              ⏸ Pause
            </button>

            <button
              onClick={resetPlayback}
              className="bg-gray-700 text-white px-5 py-3 rounded-xl font-bold"
            >
              Reset
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-gray-50 rounded-2xl p-4">
              <p className="font-bold text-gray-600">GPS Points</p>
              <p className="text-3xl font-black text-[#061B33]">{validPoints.length}</p>
            </div>

            <div className="bg-gray-50 rounded-2xl p-4">
              <p className="font-bold text-gray-600">Current Point</p>
              <p className="text-3xl font-black text-orange-500">
                {validPoints.length ? playIndex + 1 : 0}
              </p>
            </div>

            <div className="bg-gray-50 rounded-2xl p-4">
              <p className="font-bold text-gray-600">Driver</p>
              <p className="text-xl font-black text-[#061B33]">
                {currentPoint?.driver_name || selectedDriver || "All Drivers"}
              </p>
            </div>

            <div className="bg-gray-50 rounded-2xl p-4">
              <p className="font-bold text-gray-600">Recorded</p>
              <p className="text-sm font-bold text-[#061B33]">
                {currentPoint?.recorded_at || "No point selected"}
              </p>
            </div>
          </div>
        </section>

        <section className="bg-white rounded-3xl shadow p-6 mt-6">
          <div className="h-[600px] rounded-2xl overflow-hidden">
            <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ""}>
              <Map defaultCenter={center} defaultZoom={12}>
                {routePath.length > 1 && (
                  <Polyline
                    path={routePath}
                    strokeColor="#f97316"
                    strokeOpacity={0.9}
                    strokeWeight={5}
                  />
                )}

                {routePath[0] && (
                  <Marker position={routePath[0]} label="START" />
                )}

                {currentPoint?.latitude && currentPoint?.longitude && (
                  <Marker
                    position={{
                      lat: Number(currentPoint.latitude),
                      lng: Number(currentPoint.longitude),
                    }}
                    label="🚐"
                    title={currentPoint.driver_name || "Driver"}
                  />
                )}

                {routePath.length > 1 && (
                  <Marker
                    position={routePath[routePath.length - 1]}
                    label="END"
                  />
                )}
              </Map>
            </APIProvider>
          </div>
        </section>

        <section className="bg-white rounded-3xl shadow p-6 mt-6">
          <h2 className="text-2xl font-black text-[#061B33]">
            Route Timeline
          </h2>

          {validPoints.length === 0 && (
            <p className="text-gray-500 mt-4">
              No GPS history found yet.
            </p>
          )}

          <div className="mt-4 space-y-3 max-h-[400px] overflow-y-auto">
            {validPoints.map((point, index) => (
              <div
                key={point.id}
                className={`border rounded-xl p-4 ${
                  index === playIndex ? "bg-orange-50 border-orange-300" : "bg-white"
                }`}
              >
                <p className="font-bold">
                  {index + 1}. {point.driver_name || "Unknown Driver"}
                </p>
                <p><strong>Latitude:</strong> {point.latitude}</p>
                <p><strong>Longitude:</strong> {point.longitude}</p>
                <p><strong>Speed:</strong> {point.speed || 0}</p>
                <p><strong>Recorded:</strong> {point.recorded_at}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </AdminLayout>
  );
}
