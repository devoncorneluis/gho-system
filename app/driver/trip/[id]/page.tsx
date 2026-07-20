"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../../lib/supabase";

type Passenger = {
  id: string;
  full_name: string | null;
  phone: string |null;
  pickup_area: string | null;
  pickup_address: string | null;
  pickup_status: string | null;
  pickup_order: number | null;
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
  const [loading, setLoading] = useState(true);
const [tripStatus, setTripStatus] = useState<string>("");
  useEffect(() => {
    loadPassengers();

    const interval = setInterval(loadPassengers, 10000);

    return () => clearInterval(interval);
  }, [id]);
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
  async function loadPassengers() {
    setLoading(true);

    const { data, error } = await supabase
      .from("trip_passengers")
      .select(`
        id,
        full_name,
        phone,
        pickup_area,
        pickup_address,
        pickup_status,
        pickup_order,
        trip_status
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
  }

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
  const { error } = await supabase
    .from("trips")
.update({
  trip_status: "started",
  started_at: new Date().toISOString(),
})
    .eq("id", id);

  if (error) {
    alert(error.message);
    return;
  }

  alert("Trip started.");
  setTracking(true);
}

async function completeTrip() {
  const { error } = await supabase
    .from("trips")
.update({
  trip_status: "completed",
  completed_at: new Date().toISOString(),
})
    .eq("id", id);

  if (error) {
    alert(error.message);
    return;
  }

alert("Trip completed.");

router.push("/driver");
}

return (
  <main className="min-h-screen bg-gray-100 p-6">
      <h1 className="mb-6 text-3xl font-bold text-[#0B3A82]">
        Driver Trip
      </h1>

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
                  <h2 className="font-semibold">
                    {passenger.pickup_order}. {passenger.full_name}
                  </h2>

                  <p className="text-sm text-gray-500">
                    {passenger.pickup_area}
                  </p>

                  <p className="text-sm text-gray-500">
                    {passenger.phone}
                  </p>
                </div>

                <div className="flex items-center gap-3">
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

                  {passenger.pickup_status === "Picked Up" ? (
                    <button
                      disabled
                      className="rounded bg-gray-300 px-3 py-1 text-xs font-medium text-gray-600 cursor-not-allowed"
                    >
                      Completed
                    </button>
                  ) : (
                    <button
                      onClick={() => markPassengerPickedUp(passenger.id)}
                      className="rounded bg-green-600 px-3 py-1 text-xs font-medium text-white hover:bg-green-700"
                    >
                      Picked Up
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}