"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "../../lib/supabase";

type Trip = {
  id: string;
  trip_code: string | null;
  driver_name: string | null;
  vehicle_name: string | null;
  shift: string | null;
  area: string | null;
};
type Passenger = {
  id: string;
  full_name: string | null;
  phone: string | null;
  pickup_address: string | null;
  pickup_status: string | null;
  pickup_order: number | null;
};
function ManifestContent() {
  const searchParams = useSearchParams();
  const driverId = searchParams.get("driver");

  const [trip, setTrip] = useState<Trip | null>(null);
const [passengers, setPassengers] = useState<Passenger[]>([]);
  useEffect(() => {
    async function loadTrip() {
      if (!driverId) return;
      const { data } = await supabase
        .from("trips")
        .select(
          "id,trip_code,driver_name,vehicle_name,shift,area"
        )
        .eq("driver_id", driverId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

if (data) {
  setTrip(data);

  const { data: passengerData } = await supabase
    .from("trip_passengers")
    .select(
      "id,full_name,phone,pickup_address,pickup_status,pickup_order"
    )
    .eq("trip_id", data.id)
    .order("pickup_order", {
      ascending: true,
    });

  if (passengerData) {
    setPassengers(passengerData);
  }
}

    }

    loadTrip();
  }, [driverId]);

  return (
    <main className="min-h-screen bg-gray-100 p-6">
<div className="mb-6 flex items-center justify-between">
  <h1 className="text-3xl font-bold">
    Passenger Manifest
  </h1>

  <button
    onClick={() => window.print()}
    className="rounded bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700"
  >
    Print Manifest
  </button>
</div>

      <div className="rounded-lg bg-white p-6 shadow">
        <h2 className="mb-4 text-xl font-semibold">
          Trip Information
        </h2>
<div className="mt-6 rounded-lg bg-white p-6 shadow">
  <h2 className="mb-4 text-xl font-semibold">
    Passenger Manifest
  </h2>

  <table className="min-w-full border-collapse">
    <thead>
      <tr className="border-b bg-gray-100">
        <th className="px-3 py-2 text-left">#</th>
        <th className="px-3 py-2 text-left">
          Passenger
        </th>
        <th className="px-3 py-2 text-left">
          Phone
        </th>
        <th className="px-3 py-2 text-left">
          Pickup Address
        </th>
        <th className="px-3 py-2 text-left">
          Status
        </th>
      </tr>
    </thead>

    <tbody>
      {passengers.map((passenger) => (
        <tr
          key={passenger.id}
          className="border-b"
        >
          <td className="px-3 py-2">
            {passenger.pickup_order}
          </td>

          <td className="px-3 py-2">
            {passenger.full_name}
          </td>

          <td className="px-3 py-2">
            {passenger.phone}
          </td>

          <td className="px-3 py-2">
            {passenger.pickup_address}
          </td>

          <td className="px-3 py-2">
            {passenger.pickup_status}
          </td>
        </tr>
      ))}

      {passengers.length === 0 && (
        <tr>
          <td
            colSpan={5}
            className="py-6 text-center text-gray-500"
          >
            No passengers assigned.
          </td>
        </tr>
      )}
    </tbody>
  </table>
</div>
        <div className="space-y-2">
          <p>
            <strong>Trip:</strong> {trip?.trip_code ?? "-"}
          </p>

          <p>
            <strong>Driver:</strong> {trip?.driver_name ?? "-"}
          </p>

          <p>
            <strong>Vehicle:</strong> {trip?.vehicle_name ?? "-"}
          </p>

          <p>
            <strong>Shift:</strong> {trip?.shift ?? "-"}
          </p>

          <p>
            <strong>Area:</strong> {trip?.area ?? "-"}
          </p>
        </div>
      </div>
    </main>
  );
}

export default function ManifestPage() {
  return (
    <Suspense fallback={<div className="p-6">Loading manifest...</div>}>
      <ManifestContent />
    </Suspense>
  );
}