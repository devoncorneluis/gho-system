"use client";

import { use, useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase";
import {
  APIProvider,
  Map,
  Marker,
} from "@vis.gl/react-google-maps";
type Trip = {
  id: string;
  trip_code: string | null;
  driver_id: string | null;
  driver_name: string | null;
  vehicle_name: string | null;
  status: string | null;
};

type Driver = {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  availability_status: string | null;
  vehicle_registration: string | null;
  vehicle_make: string | null;
};

type DriverLocation = {
  driver_id: string;
  trip_id: string | null;
  latitude: number;
  longitude: number;
  speed: number | null;
  heading: number | null;
  updated_at: string | null;
};
type Passenger = {
  id: string;
  full_name: string | null;
  phone: string | null;
  pickup_address: string | null;
  destination_address: string | null;
  pickup_status: string | null;
  pickup_order: number | null;
  pickup_latitude: number | null;
pickup_longitude: number |null;
destination_latitude: number | null;
destination_longitude: number | null;
};

export default function TripLiveMapPage({
  params,
}: {
  params: Promise<{ tripId: string }>;
}) {
  const { tripId } = use(params);

  const [trip, setTrip] = useState<Trip | null>(null);
  const [driver, setDriver] = useState<Driver | null>(null);
  const [driverLocation, setDriverLocation] =
    useState<DriverLocation | null>(null);
const [passengers, setPassengers] = useState<Passenger[]>([]);
  async function loadDriverLocation(driverId: string) {
    const { data, error } = await supabase
      .from("driver_locations")
      .select("*")
      .eq("driver_id", driverId)
      .order("updated_at", { ascending: false })
      .limit(1)
      .single();

    if (!error && data) {
      setDriverLocation(data);
    }
  }
async function loadPassengers(tripId: string) {
const { data, error } = await supabase
  .from("trip_passengers")
  .select(`
    *,
    agents (
      pickup_latitude,
      pickup_longitude,
      destination_latitude,
      destination_longitude
    )
  `)
    .eq("trip_id", tripId)
    .order("pickup_order", { ascending: true });

  if (error) {
    return;
  }

  setPassengers(data || []);
}
  async function loadDriver(driverId: string) {
    const { data, error } = await supabase
      .from("drivers")
      .select("*")
      .eq("id", driverId)
      .single();

    if (error) return;

    setDriver(data);

    await loadDriverLocation(driverId);
  }

  async function loadTrip() {
    const { data, error } = await supabase
      .from("trips")
      .select("*")
      .eq("id", tripId)
      .single();

    if (error) {
      alert(error.message);
      return;
    }

setTrip(data);

await loadPassengers(data.id);

if (data.driver_id) {
  await loadDriver(data.driver_id);
}
  }

useEffect(() => {
  loadTrip();

  const timer = setInterval(() => {
    loadTrip();
  }, 10000);

  return () => clearInterval(timer);
}, []);

  return (
        <main className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-4xl font-bold text-[#061B33]">
        Trip Live Tracking
      </h1>

      {/* Trip Information */}

      <div className="bg-white rounded-xl shadow p-6 mt-6">
        <h2 className="text-2xl font-bold text-[#061B33] mb-4">
          Trip Information
        </h2>

        {!trip ? (
          <p>Loading trip...</p>
        ) : (
          <div className="space-y-3">
            <p>
              <strong>Trip Code:</strong> {trip.trip_code}
            </p>

            <p>
              <strong>Driver:</strong> {trip.driver_name}
            </p>

            <p>
              <strong>Vehicle:</strong> {trip.vehicle_name}
            </p>

            <p>
              <strong>Status:</strong> {trip.status}
            </p>
          </div>
        )}
      </div>

      {/* Driver Information */}

      <div className="bg-white rounded-xl shadow p-6 mt-6">
        <h2 className="text-2xl font-bold text-[#061B33] mb-4">
          Driver Information
        </h2>

        {!driver ? (
          <p>Loading driver...</p>
        ) : (
          <div className="space-y-3">
            <p>
              <strong>Name:</strong> {driver.full_name}
            </p>

            <p>
              <strong>Email:</strong> {driver.email}
            </p>

            <p>
              <strong>Phone:</strong> {driver.phone}
            </p>

            <p>
              <strong>Availability:</strong>{" "}
              {driver.availability_status}
            </p>

            <p>
              <strong>Vehicle Registration:</strong>{" "}
              {driver.vehicle_registration}
            </p>

            <p>
              <strong>Vehicle Make:</strong>{" "}
              {driver.vehicle_make}
            </p>
          </div>
        )}
      </div>

      {/* Driver GPS */}

      <div className="bg-white rounded-xl shadow p-6 mt-6">
        <h2 className="text-2xl font-bold text-[#061B33] mb-4">
          Driver GPS
        </h2>

        {!driverLocation ? (
          <p>Waiting for GPS location...</p>
        ) : (
          <div className="space-y-3">
            <p>
              <strong>Latitude:</strong>{" "}
              {driverLocation.latitude}
            </p>

            <p>
              <strong>Longitude:</strong>{" "}
              {driverLocation.longitude}
            </p>

            <p>
              <strong>Speed:</strong>{" "}
              {driverLocation.speed ?? 0} km/h
            </p>

            <p>
              <strong>Heading:</strong>{" "}
              {driverLocation.heading ?? 0}°
            </p>

            <p>
              <strong>Last Update:</strong>{" "}
              {driverLocation.updated_at}
            </p>
          </div>
        )}
      </div>
      {/* Live Map */}

<div className="bg-white rounded-xl shadow p-6 mt-6">
  <h2 className="text-2xl font-bold text-[#061B33] mb-4">
    Live Map
  </h2>

  <div className="h-[500px] rounded-xl overflow-hidden">
    <APIProvider
      apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ""}
    >

<Map
  zoom={15}
  center={
          driverLocation
            ? {
                lat: driverLocation.latitude,
                lng: driverLocation.longitude,
              }
            : {
                lat: -33.918861,
                lng: 18.4233,
              }
        }
      >
        {driverLocation && (
          <Marker
            position={{
              lat: driverLocation.latitude,
              lng: driverLocation.longitude,
            }}
            label="🚐"
          />
        )}
      </Map>
    </APIProvider>
  </div>
</div>
{/* Passenger Operations */}

<div className="bg-white rounded-xl shadow p-6 mt-6">
  <h2 className="text-2xl font-bold text-[#061B33] mb-4">
    Passenger Operations
  </h2>

  <div className="grid grid-cols-3 gap-4 mb-6">
    <div className="rounded-xl bg-gray-50 p-4 text-center">
      <p className="text-gray-500">Passengers</p>
      <p className="text-3xl font-bold">
        {passengers.length}
      </p>
    </div>

    <div className="rounded-xl bg-green-50 p-4 text-center">
      <p className="text-gray-500">Picked Up</p>
      <p className="text-3xl font-bold text-green-600">
        {
          passengers.filter(
            (p) => p.pickup_status === "Picked Up"
          ).length
        }
      </p>
    </div>

    <div className="rounded-xl bg-orange-50 p-4 text-center">
      <p className="text-gray-500">Waiting</p>
      <p className="text-3xl font-bold text-orange-600">
        {
          passengers.filter(
            (p) => p.pickup_status !== "Picked Up"
          ).length
        }
      </p>
    </div>
  </div>

  {passengers.length === 0 ? (
    <p>No passengers assigned.</p>
  ) : (
    <div className="space-y-3">
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

          <p>
            Status:{" "}
            <strong>
              {passenger.pickup_status ?? "Waiting"}
            </strong>
          </p>
        </div>
      ))}
    </div>
  )}
</div>
    </main>
  );
}