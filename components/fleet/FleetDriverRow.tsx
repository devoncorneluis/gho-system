import Link from "next/link";
import { getFleetPriority } from "../../lib/fleet/fleetPriority";
import { getEtaPrediction } from "../../lib/fleet/etaPrediction";
import {
  getTripStatus,
  getGpsAge,
} from "../../lib/fleet/getTripStatus";
import { getRouteDeviation } from "../../lib/fleet/routeDeviation";
import { getRouteRisk } from "../../lib/fleet/routeRisk";

type FleetDriver = {
  id: string;
  full_name: string | null;

  assigned_driver: {
    vehicle_name: string |null;
  }[] | null;

  trips: {
    trip_code: string | null;
    trip_status: string | null;
  }[] | null;

  driver_locations: {
    latitude: number | null;
    longitude: number | null;
    updated_at: string | null;
  }[] | null;
};

type Props = {
  driver: FleetDriver;
  activeEmergencies: string[];
  isDriverOnline: (
    updatedAt: string | null | undefined
  ) => boolean;
  health: "Healthy" | "Warning" | "Critical";
  onSelect: () => void;
};

export default function FleetDriverRow({
  driver,
  activeEmergencies,
  isDriverOnline,
  health,
  onSelect,
}: Props) {
  const activeTrip = driver.trips?.find(
    (trip) =>
      trip.trip_status !== "completed" &&
      trip.trip_status !== "cancelled"
  );

  const tripStatus = getTripStatus(
    !!activeTrip,
    driver.driver_locations?.[0]?.updated_at
  );

  const routeStatus = getRouteDeviation(
    driver.driver_locations?.[0]?.latitude,
    driver.driver_locations?.[0]?.longitude
  );

  const routeRisk = getRouteRisk(routeStatus);

  const gpsAge = getGpsAge(
    driver.driver_locations?.[0]?.updated_at
  );

  const etaStatus = getEtaPrediction(
    driver.driver_locations?.[0]?.updated_at ?? null
  );

  const fleetPriority = getFleetPriority(
    health,
    routeRisk,
    etaStatus
  );

  return (
    <tr
      onClick={onSelect}
      className={`cursor-pointer border-t transition-colors ${
        health === "Critical"
          ? "bg-red-50 hover:bg-red-100"
          : health === "Warning"
          ? "bg-gray-50 hover:bg-gray-100"
          : "hover:bg-blue-50"
      }`}
    >
      <td className="px-4 py-3 font-semibold">
        {driver.full_name}
      </td>

      <td className="px-4 py-3">
        {driver.assigned_driver?.[0]?.vehicle_name ??
          "Unassigned"}
      </td>

      <td className="px-4 py-3">
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            tripStatus === "On Time"
              ? "bg-green-100 text-green-700"
              : tripStatus === "Delayed"
              ? "bg-yellow-100 text-yellow-700"
              : tripStatus === "GPS Offline"
              ? "bg-red-100 text-red-700"
              : "bg-gray-100 text-gray-700"
          }`}
        >
          {tripStatus}
        </span>
      </td>

      <td className="px-4 py-3">
        <span
          className={`rounded-full px-2 py-1 text-xs font-semibold ${
            routeStatus === "On Route"
              ? "bg-green-100 text-green-700"
              : routeStatus === "Minor Deviation"
              ? "bg-yellow-100 text-yellow-700"
              : routeStatus === "Major Deviation"
              ? "bg-red-100 text-red-700"
              : "bg-gray-100 text-gray-700"
          }`}
        >
          {routeStatus}
        </span>
      </td>
            <td className="px-4 py-3">
        {driver.driver_locations?.length
          ? "Live"
          : "No GPS"}
      </td>

      <td className="px-4 py-3">
        <span
          className={`rounded-full px-2 py-1 text-xs font-semibold ${
            routeRisk === "Low"
              ? "bg-green-100 text-green-700"
              : routeRisk === "Medium"
              ? "bg-yellow-100 text-yellow-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {routeRisk}
        </span>
      </td>

      <td className="px-4 py-3">
        {activeEmergencies.includes(driver.id)
          ? "Emergency"
          : "Normal"}
      </td>

      <td className="px-4 py-3">
        {activeTrip?.trip_status ?? "Idle"}
      </td>

      <td className="px-4 py-3">
        {isDriverOnline(
          driver.driver_locations?.[0]?.updated_at
        )
          ? "Online"
          : "Offline"}
      </td>

      <td className="px-4 py-3">
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            health === "Healthy"
              ? "bg-green-100 text-green-700"
              : health === "Warning"
              ? "bg-yellow-100 text-yellow-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {health}
        </span>
      </td>

      <td className="px-4 py-3">
        <span
          className={`rounded-full px-2 py-1 text-xs font-semibold ${
            fleetPriority === "Normal"
              ? "bg-green-100 text-green-700"
              : fleetPriority === "Attention"
              ? "bg-yellow-100 text-yellow-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {fleetPriority}
        </span>
      </td>

      <td className="px-4 py-3">
        <div className="flex flex-col">
          <span className="font-medium">
            {gpsAge}
          </span>

          <span className="text-xs text-gray-500">
            {driver.driver_locations?.[0]?.updated_at
              ? new Date(
                  driver.driver_locations[0].updated_at
                ).toLocaleTimeString()
              : "No GPS"}
          </span>
        </div>
      </td>

      <td className="px-4 py-3">
        {driver.driver_locations?.[0]?.latitude != null
          ? driver.driver_locations[0].latitude.toFixed(6)
          : "-"}
      </td>

      <td className="px-4 py-3">
        {driver.driver_locations?.[0]?.longitude != null
          ? driver.driver_locations[0].longitude.toFixed(6)
          : "-"}
      </td>
            <td className="px-4 py-3">
<div className="flex flex-wrap gap-2">
  <Link
    href={`/live-map?driver=${driver.id}`}
    onClick={(e) => e.stopPropagation()}
    className="rounded bg-blue-600 px-3 py-1 text-xs font-semibold text-white hover:bg-blue-700"
  >
    Live Map
  </Link>

  <Link
    href={`/manifest?driver=${driver.id}`}
    onClick={(e) => e.stopPropagation()}
    className="rounded bg-green-600 px-3 py-1 text-xs font-semibold text-white hover:bg-green-700"
  >
    Manifest
  </Link>
<Link
  href={`/route-playback?driver=${driver.id}`}
  onClick={(e) => e.stopPropagation()}
  className="rounded bg-purple-600 px-3 py-1 text-xs font-semibold text-white hover:bg-purple-700"
>
  Playback
</Link>
  <Link
    href="/dispatch-command"
    onClick={(e) => e.stopPropagation()}
    className="rounded bg-orange-500 px-3 py-1 text-xs font-semibold text-white hover:bg-orange-600"
  >
    Dispatch
  </Link>
</div>
      </td>
    </tr>
  );
}