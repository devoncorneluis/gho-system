
import FleetPassengerManifest from "./FleetPassengerManifest";


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
    updated_at: string | null;
  }[] | null;
};

type Passenger = {
  id: string;
  full_name: string | null;
  phone: string | null;
  pickup_address: string | null;
  pickup_area: string | null;
  pickup_time: string | null;
  pickup_status: string | null;
  pickup_order: number | null;
};

type Props = {
  selectedDriver: FleetDriver | null;
  activeEmergencies: string[];
  passengers: Passenger[];
  onClose: () => void;
};

export default function FleetDriverDetail({
  selectedDriver,
  activeEmergencies,
  passengers,
  onClose,
}: Props) {
  if (!selectedDriver) return null;

  const activeTrip = selectedDriver.trips?.find(
    (trip) =>
      trip.trip_status !== "completed" &&
      trip.trip_status !== "cancelled"
  );
<FleetPassengerManifest passengers={passengers} />
  return (
    <div className="mt-6 rounded-lg border bg-white p-6 shadow">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-[#0B3A82]">
          Driver Details
        </h2>

        <button
          onClick={onClose}
          className="rounded bg-gray-200 px-3 py-1 text-sm hover:bg-gray-300"
        >
          Close
        </button>
      </div>
<FleetPassengerManifest passengers={passengers} />
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div>
          <p className="text-sm text-gray-500">Driver</p>
          <p className="font-semibold">{selectedDriver.full_name}</p>
        </div>

        <div>
          <p className="text-sm text-gray-500">Vehicle</p>
          <p>
            {selectedDriver.assigned_driver?.[0]?.vehicle_name ??
              "Unassigned"}
          </p>
        </div>

        <div>
          <p className="text-sm text-gray-500">Current Trip</p>
          <p>{activeTrip?.trip_code ?? "No Active Trip"}</p>
        </div>

        <div>
          <p className="text-sm text-gray-500">Trip Status</p>
          <p>{activeTrip?.trip_status ?? "Idle"}</p>
        </div>

        <div>
          <p className="text-sm text-gray-500">GPS Status</p>
          <p>
            {selectedDriver.driver_locations?.length
              ? "Live"
              : "No GPS"}
          </p>
        </div>

        <div>
          <p className="text-sm text-gray-500">Emergency</p>
          <p>
            {activeEmergencies.includes(selectedDriver.id)
              ? "ACTIVE"
              : "Normal"}
          </p>
        </div>
      </div>
    </div>
  );
}