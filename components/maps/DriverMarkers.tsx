"use client";
import { AdvancedMarker } from "@vis.gl/react-google-maps";

export type LiveDriver = {
  driver_id: string;
  driver_name?: string;
  latitude: number;
  longitude: number;
  speed: number | null;
  is_tracking: boolean;
};

type Props = {
  drivers: LiveDriver[];
  onSelect: (driver: LiveDriver) => void;
};

export default function DriverMarkers({
  drivers,
  onSelect,
}: Props) {
  return (
    <>
      {drivers.map((driver) => (
        <AdvancedMarker
          key={driver.driver_id}
          position={{
            lat: Number(driver.latitude),
            lng: Number(driver.longitude),
          }}
          onClick={() => onSelect(driver)}
        >
          <div className="flex flex-col items-center">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-full border-2 border-white shadow-lg ${
                driver.is_tracking
                  ? (driver.speed ?? 0) > 5
                    ? "bg-green-500"
                    : "bg-yellow-500"
                  : "bg-red-500"
              }`}
            >
              🚐
            </div>
            <div className="mt-1 rounded bg-white px-2 py-1 text-xs font-bold shadow">
              {driver.driver_name}
            </div>
          </div>
        </AdvancedMarker>
      ))}
    </>
  );
}
