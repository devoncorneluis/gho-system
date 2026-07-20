"use client";

import { use, useCallback, useEffect, useState } from "react";
import AdminLayout from "../../../components/AdminLayout";
import DriverTimeline from "../../../components/fleet/DriverTimeline";
import { supabase } from "../../../lib/supabase";

type Driver = {
  id: string;
  full_name: string | null;
  phone: string | null;
  email: string | null;
  assigned_vehicle: string | null;
  availability_status: string | null;
  photo_url: string | null;
};

type Trip = {
  id: string;
  trip_code: string | null;
  trip_date: string | null;
  area: string | null;
  shift: string | null;
  pickup_time: string | null;
  dropoff_time: string | null;
  status: string | null;
  passenger_count: number | null;
  vehicle_name: string | null;
};

type Passenger = {
  id: string;
  full_name: string | null;
  pickup_status: string | null;
  pickup_area: string | null;
  pickup_time: string | null;
};

type Props = {
  params: Promise<{
    driverId: string;
  }>;
};

export default function DriverCommandPage({ params }: Props) {
  const { driverId } = use(params);
  const [driver, setDriver] = useState<Driver | null>(null);
  const [trip, setTrip] = useState<Trip | null>(null);
  const [passengers, setPassengers] = useState<Passenger[]>([]);

  const demoTimeline = [
    { id: "1", title: "🟢 Driver Logged In", time: "08:00" },
    { id: "2", title: "🚐 Trip Started", time: "08:06" },
    { id: "3", title: "👤 Passenger Picked Up", time: "08:18" },
  ];

  const loadDriver = useCallback(async () => {
    const { data, error } = await supabase.from("drivers").select("*").eq("id", driverId).single();

    if (error) {
      console.error(error.message);
      return;
    }

    setDriver(data);
  }, [driverId]);

  const loadCurrentTrip = useCallback(async () => {
    if (!driver?.full_name) return;

    const { data, error } = await supabase
      .from("trips")
      .select("*")
      .eq("driver_name", driver?.full_name)
      .in("status", ["Assigned", "In Progress"])
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error(error.message);
      return;
    }

    setTrip(data);
  }, [driver?.full_name]);

  const loadPassengers = useCallback(async () => {
    if (!trip?.id) return;

    const { data, error } = await supabase
      .from("trip_passengers")
      .select("id, full_name, pickup_status, pickup_area, pickup_time")
      .eq("trip_id", trip.id)
      .order("pickup_time");

    if (error) {
      console.error(error.message);
      return;
    }

    setPassengers(data || []);
  }, [trip?.id]);

  useEffect(() => {
    loadDriver();
  }, [loadDriver]);

  useEffect(() => {
    loadCurrentTrip();
  }, [loadCurrentTrip]);

  useEffect(() => {
    loadPassengers();
  }, [loadPassengers]);

  useEffect(() => {
    const interval = setInterval(() => {
      loadCurrentTrip();
      loadPassengers();
    }, 10000);

    return () => clearInterval(interval);
  }, [loadCurrentTrip, loadPassengers]);

  return (
    <AdminLayout>
      <main className="min-h-screen bg-gray-100 p-6">
        <h1 className="text-4xl font-bold text-[#061B33]">🚐 Fleet Command Centre</h1>
        <p className="mt-2 text-gray-600">Driver ID: {driverId}</p>

        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          <div className="rounded-xl bg-white p-6 shadow">
            <h2 className="text-2xl font-bold">👤 Driver</h2>
            <div className="mt-4 space-y-3">
              <p>
                <strong>Name:</strong> {driver?.full_name || "-"}
              </p>
              <p>
                <strong>Phone:</strong> {driver?.phone || "-"}
              </p>
              <p>
                <strong>Email:</strong> {driver?.email || "-"}
              </p>
              <p>
                <strong>Vehicle:</strong> {driver?.assigned_vehicle || "-"}
              </p>
              <p>
                <strong>Status:</strong> {driver?.availability_status || "-"}
              </p>
            </div>
          </div>

          <div className="rounded-xl bg-white p-6 shadow">
            <h2 className="text-2xl font-bold">🚐 Current Trip</h2>
            <div className="mt-4 space-y-3">
              <p>
                <strong>Trip:</strong> {trip?.trip_code || "-"}
              </p>
              <p>
                <strong>Date:</strong> {trip?.trip_date || "-"}
              </p>
              <p>
                <strong>Area:</strong> {trip?.area || "-"}
              </p>
              <p>
                <strong>Shift:</strong> {trip?.shift || "-"}
              </p>
              <p>
                <strong>Vehicle:</strong> {trip?.vehicle_name || "-"}
              </p>
              <p>
                <strong>Passengers:</strong> {trip?.passenger_count ?? 0}
              </p>
              <p>
                <strong>Status:</strong> {trip?.status || "-"}
              </p>
            </div>
          </div>

          <div className="rounded-xl bg-white p-6 shadow">
            <h2 className="text-2xl font-bold">📍 Live Status</h2>
            <p className="mt-4">Loading...</p>
          </div>
        </div>

        <div className="mt-6 rounded-xl bg-white p-6 shadow">
          <h2 className="text-2xl font-bold text-[#061B33]">👥 Passenger Board</h2>
          <div className="mt-6 space-y-3">
            {passengers.length === 0 ? (
              <p>No passengers assigned.</p>
            ) : (
              passengers.map((passenger) => (
                <div key={passenger.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <p className="font-bold">{passenger.full_name}</p>
                    <p className="text-sm text-gray-500">{passenger.pickup_area}</p>
                  </div>
                  <div>
                    {passenger.pickup_status === "Picked Up" ? (
                      <span className="font-bold text-green-600">✔ Picked Up</span>
                    ) : passenger.pickup_status === "No Show" ? (
                      <span className="font-bold text-red-600">✖ No Show</span>
                    ) : (
                      <span className="font-bold text-yellow-600">⏳ Waiting</span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

<DriverTimeline
  events={[]}
/>

        <div className="mt-6 rounded-xl bg-white p-6 shadow">
          <h2 className="text-2xl font-bold text-[#061B33]">⚡ Quick Actions</h2>
          <div className="mt-6 flex flex-wrap gap-4">
            <button
              className="rounded-lg bg-[#061B33] px-5 py-3 font-bold text-white"
              onClick={() => trip && (window.location.href = `/route-playback/${trip.id}`)}
            >
              ▶ Replay Route
            </button>
            <button className="rounded-lg bg-green-600 px-5 py-3 font-bold text-white">📞 Call Driver</button>
            <button className="rounded-lg bg-red-600 px-5 py-3 font-bold text-white">🚨 Emergency</button>
          </div>
        </div>
      </main>
    </AdminLayout>
  );
}
