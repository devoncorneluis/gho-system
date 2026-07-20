"use client";
import { AdvancedMarker } from "@vis.gl/react-google-maps";

export type Emergency = {
  id: string;
  latitude: number;
  longitude: number;
};

type Props = {
  emergencies: Emergency[];
};

export default function EmergencyMarkers({
  emergencies,
}: Props) {
  return (
    <>
      {emergencies.map((emergency) => (
        <AdvancedMarker
          key={emergency.id}
          position={{
            lat: emergency.latitude,
            lng: emergency.longitude,
          }}
        >
          <div className="animate-pulse text-4xl">
            🚨
          </div>
        </AdvancedMarker>
      ))}
    </>
  );
}
