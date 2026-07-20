type FleetDriver = {
  driver_locations: {
    updated_at: string | null;
  }[] | null;
  trips: {
    trip_status: string | null;
  }[] | null;
};

type Props = {
  drivers: FleetDriver[];
  activeEmergencies: string[];
  isDriverOnline: (updatedAt: string | null | undefined) => boolean;
};

export default function FleetSummaryCards({
  drivers,
  activeEmergencies,
  isDriverOnline,
}: Props) {
  const onlineDrivers = drivers.filter((driver) =>
    isDriverOnline(driver.driver_locations?.[0]?.updated_at)
  ).length;

  const activeTrips = drivers.filter((driver) =>
    driver.trips?.some(
      (trip) =>
        trip.trip_status !== "completed" &&
        trip.trip_status !== "cancelled"
    )
  ).length;

  return (
    <div className="mb-6 grid gap-4 md:grid-cols-4">
      <div className="rounded-lg border bg-white p-4 shadow">
        <p className="text-sm text-gray-500">Drivers</p>
        <p className="text-3xl font-bold">{drivers.length}</p>
      </div>

      <div className="rounded-lg border bg-white p-4 shadow">
        <p className="text-sm text-gray-500">Online</p>
        <p className="text-3xl font-bold">{onlineDrivers}</p>
      </div>

      <div className="rounded-lg border bg-white p-4 shadow">
        <p className="text-sm text-gray-500">Emergencies</p>
        <p className="text-3xl font-bold">
          {activeEmergencies.length}
        </p>
      </div>

      <div className="rounded-lg border bg-white p-4 shadow">
        <p className="text-sm text-gray-500">Active Trips</p>
        <p className="text-3xl font-bold">{activeTrips}</p>
      </div>
    </div>
  );
}