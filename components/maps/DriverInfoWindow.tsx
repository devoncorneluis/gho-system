"use client";
import { InfoWindow } from "@vis.gl/react-google-maps";
import type { LiveDriver } from "./DriverMarkers";

type Props = {
  driver: LiveDriver | null;
  onClose: () => void;
};

export default function DriverInfoWindow({
  driver,
  onClose,
}: Props) {
  if (!driver) return null;
  return (
    <InfoWindow
      position={{
        lat: Number(driver.latitude),
        lng: Number(driver.longitude),
      }}
      onCloseClick={onClose}
    >
      <div className="min-w-[220px]">
        <h3 className="text-lg font-bold">
          🚐 {driver.driver_name}
        </h3>
        <p>
          Speed: {Math.max(0, Math.round(driver.speed ?? 0))} km/h
        </p>
        <p>
          Status:{" "}
          {driver.is_tracking
            ? (driver.speed ?? 0) > 5
              ? "🟢 Moving"
              : "🟡 Idle"
            : "🔴 Offline"}
        </p>
        <button
          className="mt-3 rounded bg-[#061B33] px-3 py-2 text-white"
          onClick={() =>
            (window.location.href = `/live-dispatch/${driver.driver_id}`)
          }
        >
          Open Command Centre
        </button>
      </div>
    </InfoWindow>
  );
}
