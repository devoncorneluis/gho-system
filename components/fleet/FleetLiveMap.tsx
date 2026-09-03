"use client";

import { useCallback, useEffect, useState } from "react";
import {
  GoogleMap,
  Marker,
  InfoWindow,
  useJsApiLoader,
} from "@react-google-maps/api";
import { supabase } from "../../lib/supabase";

type DriverLocation = {
  id: string;
  driver_name: string | null;
  latitude: number | null;
  longitude: number | null;
  trip_code: string | null;
  driver_status: string | null;
  emergency: boolean;
};

type DriverLocationRelationRow = {
  id: string;
  latitude: number | null;
  longitude: number | null;
  emergency?: boolean | null;
  drivers?: {
    driver_name?: string | null;
    status?: string | null;
  } | null;
  trips?: {
    trip_code?: string | null;
  } | null;
};

const mapContainerStyle = {
  width: "100%",
  height: "650px",
};

const centre = {
  lat: -33.9249,
  lng: 18.4241,
};

export default function FleetLiveMap() {
  const [drivers, setDrivers] = useState<DriverLocation[]>([]);
  const [selectedDriver, setSelectedDriver] =
    useState<DriverLocation | null>(null);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey:
      process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
  });

  const loadDrivers = useCallback(async () => {
    const { data } = await supabase
      .from("driver_locations")
      .select(`
        id,
        latitude,
        longitude,
        emergency,
        drivers(
          driver_name,
          status
        ),
        trips(
          trip_code
        )
      `);

    const rows: DriverLocation[] =
      ((data as DriverLocationRelationRow[] | null) ?? []).map((item) => ({
        id: item.id,
        latitude: item.latitude,
        longitude: item.longitude,
        driver_name: item.drivers?.driver_name ?? null,
        driver_status: item.drivers?.status ?? null,
        trip_code: item.trips?.trip_code ?? null,
        emergency: item.emergency ?? false,
      }));

    setDrivers(rows);
    setLastUpdated(new Date());
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadDrivers();

    const channel = supabase
      .channel("driver-locations")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "driver_locations",
        },
        () => loadDrivers()
      )
      .subscribe();

    const interval = setInterval(() => {
      loadDrivers();
    }, 60000);

    return () => {
      clearInterval(interval);
      supabase.removeChannel(channel);
    };
  }, [loadDrivers]);

  function getMarkerColour(driver: DriverLocation) {
    if (driver.emergency) return "🔴";

    switch (driver.driver_status) {
      case "Available":
        return "🟢";

      case "On Trip":
        return "🔵";

      case "Delayed":
        return "🟠";

      case "Reassigned":
        return "🟣";

      default:
        return "⚪";
    }
  }

  if (!isLoaded) {
    return (
      <div className="rounded-xl bg-white p-10 text-center shadow">
        Loading live fleet map...
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-white p-4 shadow">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold text-[#0B3A82]">
          Live Fleet Map
        </h2>

        <p className="text-sm text-gray-500">
          Last updated: {lastUpdated.toLocaleTimeString()}
        </p>
      </div>

      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={centre}
        zoom={10}
      >
        {drivers.map((driver) => {
          if (
            driver.latitude === null ||
            driver.longitude === null
          ) {
            return null;
          }

          return (
            <Marker
              key={driver.id}
              position={{
                lat: driver.latitude,
                lng: driver.longitude,
              }}
              onClick={() => setSelectedDriver(driver)}
            />
          );
        })}

        {selectedDriver &&
          selectedDriver.latitude !== null &&
          selectedDriver.longitude !== null && (
            <InfoWindow
              position={{
                lat: selectedDriver.latitude,
                lng: selectedDriver.longitude,
              }}
              onCloseClick={() => setSelectedDriver(null)}
            >
              <div className="min-w-[220px]">
                <h3 className="font-bold text-[#0B3A82]">
                  {getMarkerColour(selectedDriver)}{" "}
                  {selectedDriver.driver_name ?? "Driver"}
                </h3>

                <p className="mt-2 text-sm">
                  Trip:
                  <strong>
                    {" "}
                    {selectedDriver.trip_code ??
                      "Not Assigned"}
                  </strong>
                </p>

                <p className="text-sm text-gray-600">
                  Status:{" "}
                  {selectedDriver.driver_status ??
                    "Unknown"}
                </p>

                <p className="text-sm text-gray-600">
                  GPS Connected
                </p>

                <div className="mt-3 rounded bg-green-100 px-2 py-1 text-center text-sm font-semibold text-green-700">
                  LIVE
                </div>
              </div>
            </InfoWindow>
          )}
      </GoogleMap>
    </div>
  );
}