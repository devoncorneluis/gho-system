"use client";
import { AdvancedMarker } from "@vis.gl/react-google-maps";

type Pickup = {  id: string;  full_name: string;  latitude: number;  longitude: number;  pickup_status: string | null;};
type Props = {  pickups: Pickup[];};

export default function PickupMarkers({ pickups }: Props) {  return (    <>      {pickups.map((pickup) => (        <AdvancedMarker          key={pickup.id}          position={{            lat: pickup.latitude,            lng: pickup.longitude,          }}        >          <div            className={`flex h-8 w-8 items-center justify-center rounded-full border-2 border-white shadow ${              pickup.pickup_status === "Picked Up"                ? "bg-green-500"                : "bg-orange-500"            }`}          >            🏠          </div>        </AdvancedMarker>      ))}    </>  );}
