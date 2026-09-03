"use client";
import { Suspense, useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

import { APIProvider, Map, Marker, Polyline } from "@vis.gl/react-google-maps";
import AdminLayout from "../../components/AdminLayout";
import { supabase } from "../../lib/supabase";

import { getUserPlatform } from "../../lib/getUserPlatform";

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
type TripDetails = {
  id: string;
  trip_code: string | null;
  trip_date: string | null;
  shift: string | null;
  status: string | null;
  driver_name: string | null;
  vehicle_name: string | null;
  passenger_count: number | null;
  distance_km: number | null;
};

async function loadTripDetails(
  tripId: string,
  setTripDetails: (data: TripDetails | null) => void
) {
  const { data } = await supabase
    .from("trips")
    .select("*")
    .eq("id", tripId)
    .single();

  setTripDetails((data as TripDetails | null) ?? null);
}
function RoutePlaybackContent() {
  const [platformId, setPlatformId] = useState<string | null>(null);
  const [history, setHistory] = useState<LocationHistory[]>([]);
const [selectedTrip, setSelectedTrip] = useState("");
  const [tripDetails, setTripDetails] = useState<TripDetails | null>(null);
  const [playIndex, setPlayIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
const searchParams = useSearchParams();
const selectedDriver = searchParams.get("driver");




useEffect(() => {
  async function loadPlatform() {
    const userPlatform = await getUserPlatform();

    if (!userPlatform) {
      window.location.href = "/login";
      return;
    }

    setPlatformId(userPlatform.platformId);
  }

  loadPlatform();
}, []);


const loadHistory = useCallback(async () => {
  if (!platformId) return;

let query = supabase
  .from("driver_location_history")
  .select("*")
  .eq("platform_id", platformId);

if (selectedDriver) {
  query = query.eq("driver_id", selectedDriver);
}

const { data, error } = await query
  .order("recorded_at", { ascending: false })
  .limit(50);

  if (error) {
    alert(error.message);
    return;
  }

  setHistory((data || []).reverse());
}, [platformId, selectedDriver]);

useEffect(() => {
  // eslint-disable-next-line react-hooks/set-state-in-effect
  void loadHistory();
}, [loadHistory]);

const trips = Array.from(
  new Set(history.map((item) => item.trip_id).filter(Boolean))
) as string[];

const filteredHistory = history.filter((item) => {
  if (!selectedTrip) return true;
  return item.trip_id === selectedTrip;
});

  const validPoints = filteredHistory.filter(
    (item) => item.latitude !== null && item.longitude !== null
  );

  const routePath = validPoints.map((item) => ({
    lat: Number(item.latitude),
    lng: Number(item.longitude),
  }));

  const currentPoint = validPoints[playIndex];
const selectedTripData = filteredHistory[0];

const averageSpeed =
  validPoints.length > 0
    ? (
        validPoints.reduce((sum, point) => sum + (point.speed ?? 0), 0) /
        validPoints.length
      ).toFixed(1)
    : "0";

const maxSpeed =
  validPoints.length > 0
    ? Math.max(...validPoints.map((point) => point.speed ?? 0))
    : 0;
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
  <div className="h-[600px] rounded-2xl overflow-hidden">
    <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ""}>
<Map defaultCenter={center}>
        {routePath.length > 1 && (
          <Polyline
            path={routePath}
            strokeColor="#f97316"
            strokeOpacity={0.9}
            strokeWeight={5}
          />
        )}

        {routePath[0] && (
          <Marker position={routePath[0]} label="S" />
        )}

        {currentPoint && (
          <Marker
            position={{
              lat: Number(currentPoint.latitude),
              lng: Number(currentPoint.longitude),
            }}
            label="🚐"
          />
        )}

        {routePath.length > 1 && (
          <Marker
            position={routePath[routePath.length - 1]}
            label="E"
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

  {validPoints.length === 0 ? (
    <p className="text-gray-500 mt-4">
      No GPS history found for this trip.
    </p>
  ) : (
    <div className="mt-4 max-h-[400px] overflow-y-auto space-y-3">
      {validPoints.map((point, index) => (
        <div
          key={point.id}
          className={`rounded-xl border p-4 ${
            index === playIndex
              ? "border-orange-400 bg-orange-50"
              : "border-gray-200"
          }`}
        >
          <div className="flex justify-between">
            <span className="font-bold">
              Point #{index + 1}
            </span>

            <span className="text-sm text-gray-500">
              {point.recorded_at}
            </span>
          </div>

          <div className="mt-2 text-sm text-gray-700">
            <p>Latitude: {point.latitude}</p>
            <p>Longitude: {point.longitude}</p>
            <p>Speed: {point.speed ?? 0} km/h</p>
          </div>
        </div>
      ))}
    </div>
  )}
</section>
{tripDetails && (
  <section className="bg-white rounded-3xl shadow p-6 mt-6">
    <h2 className="text-2xl font-black text-[#061B33] mb-6">
      Trip Information
    </h2>

    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">

      <div>
        <p className="text-gray-500 text-sm">Trip Code</p>
        <p className="font-bold">{tripDetails.trip_code}</p>
      </div>

      <div>
        <p className="text-gray-500 text-sm">Date</p>
        <p className="font-bold">{tripDetails.trip_date}</p>
      </div>

      <div>
        <p className="text-gray-500 text-sm">Shift</p>
        <p className="font-bold">{tripDetails.shift}</p>
      </div>

      <div>
        <p className="text-gray-500 text-sm">Status</p>
        <p className="font-bold">{tripDetails.status}</p>
      </div>

      <div>
        <p className="text-gray-500 text-sm">Driver</p>
        <p className="font-bold">{tripDetails.driver_name}</p>
      </div>

      <div>
        <p className="text-gray-500 text-sm">Vehicle</p>
        <p className="font-bold">{tripDetails.vehicle_name}</p>
      </div>

      <div>
        <p className="text-gray-500 text-sm">Passengers</p>
        <p className="font-bold">{tripDetails.passenger_count}</p>
      </div>

      <div>
        <p className="text-gray-500 text-sm">Distance</p>
        <p className="font-bold">
          {tripDetails.distance_km ?? "--"} km
        </p>
      </div>

    </div>
  </section>
)}
        <section className="bg-white rounded-3xl shadow p-6 mt-6">
  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
    <div className="bg-gray-50 rounded-2xl p-4">
      <p className="text-sm text-gray-500">Trip</p>
      <p className="font-bold">
        {selectedTrip || "No trip selected"}
      </p>
    </div>

    <div className="bg-gray-50 rounded-2xl p-4">
      <p className="text-sm text-gray-500">Driver</p>
      <p className="font-bold">
        {selectedTripData?.driver_name || "Unknown"}
      </p>
    </div>

    <div className="bg-gray-50 rounded-2xl p-4">
      <p className="text-sm text-gray-500">Average Speed</p>
      <p className="font-bold">
        {averageSpeed} km/h
      </p>
    </div>

    <div className="bg-gray-50 rounded-2xl p-4">
      <p className="text-sm text-gray-500">Maximum Speed</p>
      <p className="font-bold">
        {maxSpeed} km/h
      </p>
    </div>
  </div>
</section>

        <section className="bg-white rounded-3xl shadow p-6 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <select
              value={selectedTrip}
onChange={async (e) => {
  const value = e.target.value;

  setSelectedTrip(value);
  resetPlayback();

  if (value) {
    await loadTripDetails(value, setTripDetails);
  } else {
    setTripDetails(null);
  }
}}
              className="border p-3 rounded-xl"
            >
<option value="">All Trips</option>
{trips.map((trip) => (
  <option key={trip} value={trip}>
    {trip}
  </option>
))}
            </select>

            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="border p-3 rounded-xl"
            >
              {isPlaying ? "Pause" : "Play"}
            </button>
            <input
  type="range"
  min={0}
  max={Math.max(validPoints.length - 1, 0)}
  value={playIndex}
  onChange={(e) => {
    setPlayIndex(Number(e.target.value));
    setIsPlaying(false);
  }}
  className="w-full mt-4"
/>
          </div>
        </section>
      </main>
    </AdminLayout>
  );
}
export default function RoutePlaybackPage() {
  return (
    <Suspense fallback={<div className="p-6">Loading route playback...</div>}>
      <RoutePlaybackContent />
    </Suspense>
  );
}


