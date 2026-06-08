"use client";

import { APIProvider, Map, Marker } from "@vis.gl/react-google-maps";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

const PLATFORM_ID = "713c411b-847e-4379-8e38-c142e06ff5fd";

type DriverLocation = {
  id: string;
  driver_name: string | null;
  latitude: number | null;
  longitude: number | null;
  status: string | null;
  last_updated: string | null;
};

export default function LiveMapPage() {
  const [locations, setLocations] = useState<DriverLocation[]>([]);

  async function loadLocations() {
    const { data, error } = await supabase
      .from("driver_locations")
      .select("*")
      .eq("platform_id", PLATFORM_ID);

    if (error) {
      alert(error.message);
      return;
    }

    setLocations(data || []);
  }

  useEffect(() => {
    loadLocations();
  }, []);

  const center = {
    lat: -33.918861,
    lng: 18.4233,
  };

  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-4xl font-bold text-[#061B33]">Live Map</h1>

      <p className="text-gray-600 mt-2">
        Track active drivers and transport routes in real time.
      </p>

      <div className="bg-white rounded-xl shadow p-6 mt-6">
        <div className="h-96 rounded-xl overflow-hidden">
          <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ""}>
            <Map defaultCenter={center} defaultZoom={11}>
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

      <div className="bg-white rounded-xl shadow p-6 mt-6">
        <h2 className="text-xl font-bold">Driver Locations</h2>

        {locations.map((location) => (
          <div key={location.id} className="border-b py-3">
            <p><strong>Driver:</strong> {location.driver_name}</p>
            <p><strong>Status:</strong> {location.status}</p>
            <p><strong>Latitude:</strong> {location.latitude}</p>
            <p><strong>Longitude:</strong> {location.longitude}</p>
            <p><strong>Last Updated:</strong> {location.last_updated}</p>
          </div>
        ))}
      </div>
    </main>
  );
}
