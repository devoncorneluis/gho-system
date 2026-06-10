"use client";

import { APIProvider, Map, Marker } from "@vis.gl/react-google-maps";
import { useEffect, useState } from "react";
import UserTopBar from "../../components/UserTopBar";
import { supabase } from "../../lib/supabase";

const PLATFORM_ID = "713c411b-847e-4379-8e38-c142e06ff5fd";

type DriverLocation = {
  id: string;
  driver_name: string | null;
  driver_email: string | null;
  latitude: number | null;
  longitude: number | null;
  status: string | null;
  last_updated: string | null;
};

type Trip = {
  id: string;
  trip_code: string | null;
  driver_name: string | null;
  vehicle_name: string | null;
  vehicle_registration: string | null;
  pickup_time: string | null;
  dropoff_time: string | null;
  status: string | null;
};

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
      .in("status", ["Assigned", "In Progress"]);

    setLocations(locationData || []);
    setTrips(tripData || []);
  }

  useEffect(() => {
    loadData();

    const timer = setInterval(() => {
      loadData();
    }, 10000);

    return () => clearInterval(timer);
  }, []);

  const firstLocation = locations.find(
    (location) => location.latitude && location.longitude
  );

  const center =
    firstLocation?.latitude && firstLocation?.longitude
      ? { lat: firstLocation.latitude, lng: firstLocation.longitude }
      : { lat: -33.918861, lng: 18.4233 };

  function getTripForDriver(driverName: string | null) {
    return trips.find((trip) => trip.driver_name === driverName);
  }

  return (
    <main className="min-h-screen bg-gray-100">
      <UserTopBar />

      <div className="p-6">
        <h1 className="text-4xl font-bold text-[#061B33]">
          Agent Live Tracking
        </h1>

        <p className="text-gray-600 mt-2">
          View live driver locations, vehicle details, and active trip status.
        </p>

        <div className="bg-white rounded-xl shadow p-6 mt-6">
          <div className="h-[500px] rounded-xl overflow-hidden">
            <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ""}>
              <Map defaultCenter={center} defaultZoom={12}>
                {locations.map((location) => {
                  if (!location.latitude || !location.longitude) return null;

                  return (
                    <Marker
                      key={location.id}
                      position={{
                        lat: location.latitude,
                        lng: location.longitude,
                      }}
                    />
                  );
                })}
              </Map>
            </APIProvider>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          {locations.map((location) => {
            const trip = getTripForDriver(location.driver_name);

            return (
              <div key={location.id} className="bg-white rounded-xl shadow p-6">
                <h2 className="text-2xl font-bold text-[#061B33]">
                  📍 {location.driver_name || "Unknown Driver"}
                </h2>

                <p><strong>Status:</strong> {location.status}</p>
                <p><strong>Last Updated:</strong> {location.last_updated}</p>

                {trip ? (
                  <div className="bg-orange-50 rounded-xl p-4 mt-4">
                    <p className="font-bold">Active Trip</p>
                    <p><strong>Trip:</strong> {trip.trip_code}</p>
                    <p><strong>Vehicle:</strong> {trip.vehicle_name}</p>
                    <p><strong>Registration:</strong> {trip.vehicle_registration}</p>
                    <p><strong>Pickup:</strong> {trip.pickup_time}</p>
                    <p><strong>Drop-off:</strong> {trip.dropoff_time}</p>
                    <p><strong>Trip Status:</strong> {trip.status}</p>
                  </div>
                ) : (
                  <p className="text-gray-500 mt-4">
                    No active trip linked to this driver.
                  </p>
                )}
              </div>
            );
          })}

          {locations.length === 0 && (
            <p className="text-gray-500">
              No live driver locations available yet.
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
