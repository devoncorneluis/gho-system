"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import AdminLayout from "../../../../components/AdminLayout";
import { supabase } from "../../../../lib/supabase";

type Trip = {
  id: string;
  trip_code: string | null;
  trip_date: string | null;
  shift: string | null;
  area: string | null;
  status: string | null;
  driver_name: string | null;
  vehicle_name: string | null;
  passenger_count: number | null;
};

type Passenger = {
  id: string;
  full_name: string | null;
  pickup_address: string | null;
  pickup_status: string | null;
};

export default function ClientTripDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const [trip, setTrip] = useState<Trip | null>(null);
  const [passengers, setPassengers] = useState<Passenger[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTrip() {
      const { data: tripData } = await supabase
        .from("trips")
        .select("*")
        .eq("id", id)
        .single();

      const { data: passengerData } = await supabase
        .from("trip_passengers")
        .select(`
          id,
          full_name,
          pickup_address,
          pickup_status
        `)
        .eq("trip_id", id)
        .order("pickup_order");

      setTrip(tripData);
      setPassengers(passengerData ?? []);
      setLoading(false);
    }

    loadTrip();
  }, [id]);

  if (loading) {
    return (
      <AdminLayout>
        <main className="min-h-screen bg-gray-100 p-6">
          Loading trip...
        </main>
      </AdminLayout>
    );
  }

  if (!trip) {
    return (
      <AdminLayout>
        <main className="min-h-screen bg-gray-100 p-6">
          Trip not found.
        </main>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <main className="min-h-screen bg-gray-100 p-6">

        <Link
          href="/client-portal/live-trips"
          className="text-blue-600 font-semibold"
        >
          ← Back to Live Trips
        </Link>

        <div className="mt-6 rounded-3xl bg-white p-8 shadow">

          <h1 className="text-4xl font-black text-[#061B33]">
            {trip.trip_code}
          </h1>

          <p className="mt-2 text-gray-600">
            {trip.trip_date}
          </p>

        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-2">

          <div className="rounded-2xl bg-white p-6 shadow">

            <h2 className="text-2xl font-black text-[#061B33]">
              Trip Details
            </h2>

            <div className="mt-6 space-y-3">

              <div className="flex justify-between">
                <span>Status</span>
                <strong>{trip.status}</strong>
              </div>

              <div className="flex justify-between">
                <span>Driver</span>
                <strong>{trip.driver_name ?? "-"}</strong>
              </div>

              <div className="flex justify-between">
                <span>Vehicle</span>
                <strong>{trip.vehicle_name ?? "-"}</strong>
              </div>

              <div className="flex justify-between">
                <span>Shift</span>
                <strong>{trip.shift ?? "-"}</strong>
              </div>

              <div className="flex justify-between">
                <span>Area</span>
                <strong>{trip.area ?? "-"}</strong>
              </div>

            </div>

          </div>

          <div className="rounded-2xl bg-white p-6 shadow">

            <h2 className="text-2xl font-black text-[#061B33]">
              Passenger Manifest
            </h2>

            <div className="mt-6 space-y-4">

              {passengers.length === 0 ? (
                <div className="text-gray-500">
                  No passengers assigned.
                </div>
              ) : (
                passengers.map((passenger) => (
                  <div
                    key={passenger.id}
                    className="rounded-xl border p-4"
                  >
                    <p className="font-bold">
                      {passenger.full_name}
                    </p>

                    <p className="text-sm text-gray-500">
                      {passenger.pickup_address}
                    </p>

                    <p className="mt-2 text-sm">
                      Status: {passenger.pickup_status ?? "Pending"}
                    </p>
                  </div>
                ))
              )}

            </div>

          </div>

        </div>

      </main>
    </AdminLayout>
  );
}