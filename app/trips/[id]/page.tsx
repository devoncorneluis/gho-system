"use client";

import { use, useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase";

type Trip = {
  id: string;
  trip_code: string | null;
  trip_date: string | null;
  shift: string | null;
  area: string | null;
  pickup_time: string | null;
  dropoff_time: string | null;
  driver_name: string | null;
  status: string | null;
  vehicle_name: string | null;
  vehicle_registration: string | null;
  estimated_km: number | null;
  trip_distance_km: number | null;
  estimated_duration_minutes: number | null;
};

type Passenger = {
  id: string;
  full_name: string | null;
  phone: string | null;
  pickup_address: string | null;
  pickup_area: string | null;
  pickup_time: string | null;
};
export default function TripDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const [trip, setTrip] = useState<Trip | null>(null);
  const [passengers, setPassengers] = useState<Passenger[]>([]);

  async function loadTrip() {
const { data } = await supabase
  .from("trips")
  .select("*")
  .eq("id", id)
  .single();

if (data) {
  setTrip(data);
}

const { data: passengerData } = await supabase
  .from("trip_passengers")
  .select("*")
  .eq("trip_id", id)
  .order("pickup_time");

    setPassengers(passengerData || []);
  }

  useEffect(() => {
    loadTrip();
  }, []);

  if (!trip) {
    return (
      <main className="min-h-screen p-6">
        Loading trip...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <button
        onClick={() => window.history.back()}
        className="mb-4 bg-gray-200 px-4 py-2 rounded-xl font-bold"
      >
        ← Back
      </button>

      <div className="bg-white rounded-xl shadow p-6">
        <h1 className="text-3xl font-bold text-[#061B33]">
          {trip.trip_code}
        </h1>

        <div className="grid md:grid-cols-2 gap-4 mt-4">
          <p><strong>Date:</strong> {trip.trip_date}</p>
          <p><strong>Shift:</strong> {trip.shift}</p>
          <p><strong>Area:</strong> {trip.area}</p>
          <p><strong>Status:</strong> {trip.status}</p>
          <p><strong>Driver:</strong> {trip.driver_name}</p>
          <p><strong>Vehicle:</strong> {trip.vehicle_name}</p>
          <p><strong>Registration:</strong> {trip.vehicle_registration}</p>
          <p><strong>Distance:</strong> {trip.trip_distance_km || trip.estimated_km} km</p>
          <p><strong>Duration:</strong> {trip.estimated_duration_minutes} min</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow p-6 mt-6">
        <h2 className="text-2xl font-bold text-[#061B33]">
          Passengers
        </h2>

        {passengers.length === 0 && (
          <p className="text-gray-500 mt-4">
            No passengers assigned.
          </p>
        )}

        <div className="space-y-3 mt-4">
          {passengers.map((passenger) => (
            <div
              key={passenger.id}
              className="border rounded-xl p-4"
            >
              <p className="font-bold">
                {passenger.full_name}
              </p>

              <p>{passenger.phone}</p>
              <p>{passenger.pickup_address}</p>
              <p>{passenger.pickup_area}</p>
              <p>{passenger.pickup_time}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}