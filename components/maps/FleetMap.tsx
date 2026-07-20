"use client";
import { memo, useMemo, useState } from "react";
import { APIProvider, Map } from "@vis.gl/react-google-maps";
import DriverInfoWindow from "./DriverInfoWindow";
import DriverMarkers from "./DriverMarkers";
import EmergencyMarkers from "./EmergencyMarkers";
import PickupMarkers from "./PickupMarkers";
import TripRoute from "./TripRoute";

type LiveDriver = {  driver_id: string;  driver_name?: string;  latitude: number;  longitude: number;  speed: number | null;  is_tracking: boolean;};
type Pickup = {  id: string;  full_name: string;  latitude: number;  longitude: number;  pickup_status: string | null;};
type Emergency = {  id: string;  latitude: number;  longitude: number;};
type Props = {  drivers: LiveDriver[];  pickups?: Pickup[];  route?: {    lat: number;    lng: number;  }[];  emergencies?: Emergency[];};

function FleetMapComponent({ drivers, pickups = [], route = [], emergencies = [] }: Props) {
  const [selectedDriver, setSelectedDriver] = useState<LiveDriver | null>(null);
  const defaultCenter = useMemo(
    () =>
      drivers.length
        ? {
            lat: Number(drivers[0].latitude),
            lng: Number(drivers[0].longitude),
          }
        : {
            lat: -33.9249,
            lng: 18.4241,
          },
    [drivers]
  );

  const mapStyle = useMemo(
    () => ({
      width: "100%",
      height: "650px",
    }),
    []
  );

  return (
    <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}>
      <Map
        defaultCenter={defaultCenter}
        defaultZoom={11}
        gestureHandling="greedy"
        disableDefaultUI={false}
        style={mapStyle}
      >
        <DriverMarkers drivers={drivers} onSelect={setSelectedDriver} />
        <DriverInfoWindow
          driver={selectedDriver}
          onClose={() => setSelectedDriver(null)}
        />
        <EmergencyMarkers emergencies={emergencies} />
        <TripRoute path={route} />
        <PickupMarkers pickups={pickups} />
      </Map>
    </APIProvider>
  );
}

const FleetMap = memo(FleetMapComponent);

export default FleetMap;
