"use client";

import { use, useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../../lib/supabase";
import {
  startTrip as dispatchStartTrip,
  completeTrip as dispatchCompleteTrip,
} from "../../../../lib/dispatchService";

type Passenger = {
  id: string;
  full_name: string | null;
  phone: string | null;
  pickup_area: string | null;
  pickup_address: string | null;
  destination_address: string | null;
  pickup_time: string | null;
  dropoff_time: string | null;
  pickup_status: string | null;
  pickup_order: number | null;
};
type Trip = {
  trip_date: string | null;
  pickup_time: string | null;
  dropoff_time: string | null;
  shift: string | null;
  status: string | null;
  platform_id: string | null;
  driver_id: string | null;
  vehicle_id: string | null;
};
export default function DriverTripPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
const router = useRouter();
const [tracking, setTracking] = useState(false);
  const [passengers, setPassengers] = useState<Passenger[]>([]);
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
const [tripStatus, setTripStatus] = useState<string>("");

  const loadTrip = useCallback(async () => {
    const { data, error } = await supabase
      .from("trips")
      .select(`
        trip_date,
        pickup_time,
        dropoff_time,
        shift,
        status,
        platform_id,
        driver_id,
        vehicle_id
      `)
      .eq("id", id)
      .maybeSingle();

    if (error) {
      console.error(error);
      return;
    }

    setTrip(data as Trip | null);
  }, [id]);

  const loadPassengers = useCallback(async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("trip_passengers")
      .select(`
        id,
        full_name,
        phone,
        pickup_area,
        pickup_address,
        destination_address,
        pickup_time,
        dropoff_time,
        pickup_status,
        pickup_order
      `)
      .eq("trip_id", id)
      .order("pickup_order");

    if (error) {
      console.error(error);
      setLoading(false);
      return;
    }

    const list = data ?? [];

    const nextIndex = list.findIndex(
      (p) => p.pickup_status !== "Picked Up"
    );

    const updated = list.map((p, index) => ({
      ...p,
      pickup_status:
        p.pickup_status === "Picked Up"
          ? "Picked Up"
          : index === nextIndex
          ? "Next"
          : "Waiting",
    }));

    setPassengers(updated);
    setLoading(false);
  }, [id]);

  const loadTripStatus = useCallback(async () => {
    const { data } = await supabase
      .from("trips")
      .select("status")
      .eq("id", id)
      .maybeSingle();

    if (data?.status) {
      setTripStatus(String(data.status).toLowerCase());
    }
  }, [id]);

useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadTrip();
    void loadPassengers();
    void loadTripStatus();

    const interval = setInterval(() => {
      void loadTrip();
      void loadPassengers();
      void loadTripStatus();
    }, 10000);

    return () => clearInterval(interval);
  }, [id, loadTrip, loadPassengers, loadTripStatus]);
useEffect(() => {
  if (!tracking) return;

  if (!navigator.geolocation) {
    alert("GPS is not supported on this device.");
    return;
  }

  const watchId = navigator.geolocation.watchPosition(
    async (position) => {
const {
  data: { user },
} = await supabase.auth.getUser();

if (!user) return;

await supabase
  .from("driver_locations")
  .upsert({
    driver_id: user.id,
    latitude: position.coords.latitude,
    longitude: position.coords.longitude,
    updated_at: new Date().toISOString(),
  });
      console.log(
        "Driver location:",
        position.coords.latitude,
        position.coords.longitude
      );
    },
    (error) => {
      console.error(error);
    },
    {
      enableHighAccuracy: true,
      maximumAge: 5000,
    }
  );

  return () => navigator.geolocation.clearWatch(watchId);
}, [tracking]);
  async function markPassengerPickedUp(passengerId: string) {
    const { error } = await supabase
      .from("trip_passengers")
      .update({
        pickup_status: "Picked Up",
      })
      .eq("id", passengerId);

    if (error) {
      alert(error.message);
      return;
    }

    await loadPassengers();
  }
async function startTrip() {
  if (!trip?.platform_id || !trip.driver_id || !trip.vehicle_id) {
    alert("Trip driver, vehicle, or platform information is missing.");
    return;
  }

  try {
    await dispatchStartTrip(
      supabase,
      id,
      trip.platform_id,
      trip.driver_id,
      trip.vehicle_id
    );

    alert("Trip started.");
    setTripStatus("en_route");
    setTracking(true);
    await loadTrip();
    await loadTripStatus();
  } catch (error) {
    console.error(error);
    alert(
      error instanceof Error
        ? error.message
        : "Unable to start trip."
    );
  }
}

async function completeTrip() {
  if (!trip?.platform_id || !trip.driver_id || !trip.vehicle_id) {
    alert("Trip driver, vehicle, or platform information is missing.");
    return;
  }

  try {
    await dispatchCompleteTrip(
      supabase,
      id,
      trip.platform_id,
      trip.driver_id,
      trip.vehicle_id
    );

    alert("Trip completed.");
    setTripStatus("completed");
    setTracking(false);

    router.push("/driver");
  } catch (error) {
    console.error(error);
    alert(
      error instanceof Error
        ? error.message
        : "Unable to complete trip."
    );
  }
}

return (
  <main className="min-h-screen bg-gray-100 p-6">
      <h1 className="mb-6 text-3xl font-bold text-[#0B3A82]">
        Driver Trip
      </h1>

            {trip && (
        <div className="mb-6 rounded-lg border bg-white p-4 shadow">
          <h2 className="mb-4 text-lg font-bold text-[#0B3A82]">
            Trip Information
          </h2>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <div>
              <p className="text-xs font-semibold uppercase text-gray-500">
                Trip Date
              </p>
              <p className="font-bold text-gray-900">
                {trip.trip_date || "—"}
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase text-gray-500">
                Pickup Time
              </p>
              <p className="font-bold text-gray-900">
                {trip.pickup_time || "—"}
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase text-gray-500">
                Drop-off Time
              </p>
              <p className="font-bold text-gray-900">
                {trip.dropoff_time || "—"}
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase text-gray-500">
                Direction
              </p>
              <p className="font-bold text-gray-900">
                {trip.shift || "—"}
              </p>
            </div>
          </div>
        </div>
      )}

<div className="mb-6">
{tripStatus === "scheduled" || tripStatus === "assigned" ? (
  <button
    onClick={startTrip}
    className="rounded-lg bg-green-600 px-6 py-3 font-semibold text-white hover:bg-green-700"
  >
    Start Trip
  </button>
) : tripStatus === "started" ? (
  <button
    onClick={completeTrip}
    className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700"
  >
    Complete Trip
  </button>
) : (
  <span className="rounded-lg bg-gray-200 px-6 py-3 font-semibold text-gray-600">
    Trip Completed
  </span>
)}
</div>

<div className="mb-6 rounded-lg border bg-white p-4 shadow">
        <h2 className="mb-3 text-lg font-bold text-[#0B3A82]">
          Trip Progress
        </h2>

        <div className="flex justify-between text-center">
          <div>
            <p className="text-2xl font-bold text-green-600">
              {passengers.filter(p => p.pickup_status === "Picked Up").length}
            </p>
            <p className="text-sm text-gray-500">Completed</p>
          </div>

          <div>
            <p className="text-2xl font-bold text-yellow-500">
              {passengers.filter(p => p.pickup_status === "Next").length}
            </p>
            <p className="text-sm text-gray-500">Current</p>
          </div>

          <div>
            <p className="text-2xl font-bold text-gray-500">
              {passengers.filter(p => p.pickup_status === "Waiting").length}
            </p>
            <p className="text-sm text-gray-500">Waiting</p>
          </div>
        </div>
      </div>

      {loading ? (
        <p>Loading passengers...</p>
      ) : (
        <div className="space-y-4">
          {passengers.map((passenger) => (
            <div
              key={passenger.id}
              className="rounded-lg border bg-white p-4 shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-semibold text-lg">
                    {passenger.pickup_order}. {passenger.full_name}
                  </h2>

                  <p className="text-sm text-gray-500">
                    {passenger.phone}
                  </p>
                </div>

                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    passenger.pickup_status === "Picked Up"
                      ? "bg-green-100 text-green-700"
                      : passenger.pickup_status === "Next"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {passenger.pickup_status}
                </span>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
                <div className="rounded-lg bg-gray-50 p-3">
                  <p className="text-xs font-semibold uppercase text-gray-500">
                    Pickup Time
                  </p>
                  <p className="font-bold text-gray-900">
                    {passenger.pickup_time || "—"}
                  </p>
                </div>

                <div className="rounded-lg bg-gray-50 p-3">
                  <p className="text-xs font-semibold uppercase text-gray-500">
                    Drop-off Time
                  </p>
                  <p className="font-bold text-gray-900">
                    {passenger.dropoff_time || "—"}
                  </p>
                </div>
              </div>

              <div className="mt-3 rounded-lg border-l-4 border-green-500 bg-green-50 p-3">
                <p className="text-xs font-semibold uppercase text-gray-500">
                  Pickup Address
                </p>
                <p className="font-medium text-gray-900">
                  {passenger.pickup_address || "No pickup address"}
                </p>
              </div>

              <div className="mt-3 rounded-lg border-l-4 border-blue-500 bg-blue-50 p-3">
                <p className="text-xs font-semibold uppercase text-gray-500">
                  Destination Address
                </p>
                <p className="font-medium text-gray-900">
                  {passenger.destination_address || "No destination address"}
                </p>
              </div>

              <div className="mt-3">
                <p className="text-sm text-gray-500">
                  Area:{" "}
                  <span className="font-medium text-gray-900">
                    {passenger.pickup_area || "—"}
                  </span>
                </p>
              </div>

              <div className="mt-4">
                {passenger.pickup_status === "Picked Up" ? (
                  <button
                    disabled
                    className="w-full rounded-lg bg-gray-300 px-3 py-2 text-sm font-medium text-gray-600 cursor-not-allowed"
                  >
                    Completed
                  </button>
                ) : (
                  <button
                    onClick={() => markPassengerPickedUp(passenger.id)}
                    className="w-full rounded-lg bg-green-600 px-3 py-2 text-sm font-medium text-white hover:bg-green-700"
                  >
                    Picked Up
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}