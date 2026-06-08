"use client";

import { APIProvider, Map, Marker } from "@vis.gl/react-google-maps";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

const PLATFORM_ID = "713c411b-847e-4379-8e38-c142e06ff5fd";

// Demo pickup point: Bishop Lavis area
const PICKUP_LOCATION = {
  lat: -33.9467,
  lng: 18.5759,
};

type DriverLocation = {
  id: string;
  driver_name: string | null;
  latitude: number | null;
  longitude: number | null;
  status: string | null;
  last_updated: string | null;
};

type Trip = {
  id: string;
  trip_code: string;
  pickup_time: string | null;
  dropoff_time: string | null;
  driver_name: string | null;
  vehicle_name: string | null;
  vehicle_registration: string | null;
  status: string | null;
};

function getDistanceKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

export default function AgentTrackingPage() {
  const [locations, setLocations] = useState<DriverLocation[]>([]);
  const [trips, setTrips] = useState<Trip[]>([]);

  async function loadData() {
    const { data: locationData } = await supabase
      .from("driver_locations")
      .select("*")
      .eq("platform_id", PLATFORM_ID)
      .order("last_updated", { ascending: false });

    const { data: tripData } = await supabase
      .from("trips")
      .select("*")
      .eq("platform_id", PLATFORM_ID)
      .order("created_at", { ascending: false })
      .limit(1);

    setLocations(locationData || []);
    setTrips(tripData || []);
  }

  useEffect(() => {
    loadData();

    const timer = setInterval(() => {
      loadData();
    }, 15000);

    return () => clearInterval(timer);
  }, []);

  const latestLocation = locations[0];
  const trip = trips[0];

  const center =
    latestLocation?.latitude && latestLocation?.longitude
      ? { lat: latestLocation.latitude, lng: latestLocation.longitude }
      : PICKUP_LOCATION;

  let distanceKm = 0;
  let etaMinutes = 0;

  if (latestLocation?.latitude && latestLocation?.longitude) {
    distanceKm = getDistanceKm(
      latestLocation.latitude,
      latestLocation.longitude,
      PICKUP_LOCATION.lat,
      PICKUP_LOCATION.lng
    );

    etaMinutes = Math.ceil((distanceKm / 40) * 60);
  }

  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-4xl font-bold text-[#061B33]">
        Agent Tracking
      </h1>

      <p className="text-gray-600 mt-2">
        Track your driver, vehicle, ETA, and pickup details.
      </p>

      {trip && (
        <div className="bg-white rounded-xl shadow p-6 mt-6">
          <h2 className="text-xl font-bold">My Transport Details</h2>

          <div className="mt-4 space-y-2">
            <p><strong>Trip:</strong> {trip.trip_code}</p>
            <p><strong>Pickup Time:</strong> {trip.pickup_time}</p>
            <p><strong>Drop-off Time:</strong> {trip.dropoff_time}</p>
            <p><strong>Driver:</strong> {trip.driver_name}</p>
            <p><strong>Vehicle:</strong> {trip.vehicle_name}</p>
            <p><strong>Number Plate:</strong> {trip.vehicle_registration}</p>
            <p><strong>Status:</strong> {trip.status}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        <div className="bg-white rounded-xl shadow p-6">
          <p className="font-bold">Estimated Arrival</p>
          <p className="text-4xl text-orange-500 font-bold">
            {etaMinutes > 0 ? `${etaMinutes} min` : "Waiting"}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <p className="font-bold">Distance Away</p>
          <p className="text-4xl text-orange-500 font-bold">
            {distanceKm > 0 ? `${distanceKm.toFixed(1)} km` : "Waiting"}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow p-6 mt-6">
        <div className="h-96 rounded-xl overflow-hidden">
          <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ""}>
            <Map defaultCenter={center} defaultZoom={13}>
              {latestLocation?.latitude && latestLocation?.longitude && (
                <Marker
                  position={{
                    lat: latestLocation.latitude,
                    lng: latestLocation.longitude,
                  }}
                />
              )}

              <Marker position={PICKUP_LOCATION} />
            </Map>
          </APIProvider>
        </div>
      </div>

      {latestLocation && (
        <div className="bg-white rounded-xl shadow p-6 mt-6">
          <p><strong>Driver:</strong> {latestLocation.driver_name}</p>
          <p><strong>Status:</strong> {latestLocation.status}</p>
          <p><strong>Last Updated:</strong> {latestLocation.last_updated}</p>
        </div>
      )}
    </main>
  );
}
