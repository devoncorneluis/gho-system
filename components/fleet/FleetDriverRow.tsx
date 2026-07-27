import Link from "next/link";
import {
  getTripStatus,
  getGpsAge,
} from "../../lib/fleet/getTripStatus";
type FleetDriver = {
  id: string;
  full_name: string | null;
  assigned_driver: {
    vehicle_name: string | null;
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
  isDriverOnline: (updatedAt: string | null |undefined) => boolean;
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
const gpsAge = getGpsAge(
  driver.driver_locations?.[0]?.updated_at
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
        {driver.assigned_driver?.[0]?.vehicle_name ?? "Unassigned"}
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
        {driver.driver_locations?.length ? "Live" : "No GPS"}
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
        {activeEmergencies.includes(driver.id)
          ? "Emergency"
          : "Normal"}
      </td>

      <td className="px-4 py-3">
        {activeTrip?.trip_status ?? "Idle"}
      </td>

      <td className="px-4 py-3">
        {isDriverOnline(driver.driver_locations?.[0]?.updated_at)
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
        <div className="flex gap-2">
          <Link
            href="/live-map"
            className="rounded bg-blue-600 px-3 py-1 text-xs text-white"
          >
            Live Map
          </Link>

          <Link
            href="/dispatch-command"
            className="rounded bg-orange-500 px-3 py-1 text-xs text-white"
          >
            Dispatch
          </Link>
        </div>
      </td>
    </tr>
  );
}