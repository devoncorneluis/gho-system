
import FleetPassengerManifest from "./FleetPassengerManifest";
import {
  completeTrip,
  cancelTrip,
} from "../../lib/dispatchService";
import { supabase } from "@/lib/supabase";

 type FleetDriver = { 
  id: string;
  full_name: string | null;
  phone: string | null;
assigned_driver: {
  id: string;
  vehicle_name: string | null;
}[] | null;
trips: {
  id: string;
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
  platformId: string | null;
  activeEmergencies: string[];
  passengers: Passenger[];
  onClose: () => void;
  onRefresh: () => Promise<void>;
  onOpenReassign: () => void;
};

export default function FleetDriverDetail({
  selectedDriver,
  platformId,
  activeEmergencies,
  passengers,
  onClose,
  onRefresh,
  onOpenReassign,
}: Props) {

  if (!selectedDriver) return null;

  const activeTrip = selectedDriver.trips?.find(
    (trip) =>
      trip.trip_status !== "completed" &&
      trip.trip_status !== "cancelled"
  );

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
<div className="mt-6 border-t pt-6">
  <h3 className="mb-4 text-lg font-semibold text-[#0B3A82]">
    Quick Actions
  </h3>

  <div className="grid grid-cols-2 gap-3">

<button
  onClick={() => {
    if (!selectedDriver) return;

    window.open(
      `/live-map?driver=${selectedDriver.id}`,
      "_blank"
    );
  }}
  className="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700"
>
  📍 Locate Driver
</button>

<button
  onClick={() => {
    if (!selectedDriver.phone) {
      alert("No phone number available.");
      return;
    }

    window.open(`tel:${selectedDriver.phone}`);
  }}
  className="rounded-lg bg-green-600 px-4 py-2 font-semibold text-white hover:bg-green-700"
>
  📞 Contact Driver
</button>


<button
  onClick={async () => {
    if (!selectedDriver) return;

    const confirmed = window.confirm(
      `Raise an emergency for ${selectedDriver.full_name}?`
    );

    if (!confirmed) return;

    const activeTrip = selectedDriver.trips?.find(
      (trip) =>
        trip.trip_status !== "completed" &&
        trip.trip_status !== "cancelled"
    );

    const { error } = await supabase
      .from("emergency_alerts")
      .insert({
        trip_id: activeTrip?.id ?? null,
        driver_id: selectedDriver.id,
        alert_type: "Dispatcher Alert",
        notes: "Emergency raised from Fleet Command Centre",
        status: "ACTIVE",
      });

    if (error) {
      console.error(error);
      alert("Unable to create emergency alert.");
      return;
    }

    alert("Emergency alert created successfully.");

await onRefresh();
  }}
  className="rounded-lg bg-orange-500 px-4 py-2 font-semibold text-white hover:bg-orange-600"
>
  🚨 Raise Emergency
</button>

<button
  onClick={onOpenReassign}
  className="rounded-lg bg-purple-600 px-4 py-2 font-semibold text-white hover:bg-purple-700"
>
  🔄 Reassign Trip
</button>

<button
  onClick={async () => {
    const activeTrip = selectedDriver?.trips?.find(
      (trip) =>
        trip.trip_status !== "completed" &&
        trip.trip_status !== "cancelled"
    );

    if (!activeTrip) {
      alert("No active trip found.");
      return;
    }

    try {
const vehicleId = selectedDriver?.assigned_driver?.[0]?.id;

if (!vehicleId) {
  alert("No vehicle assigned to this driver.");
  return;
}

if (!platformId) {
  alert("Platform not loaded.");
  return;
}

await completeTrip(
  supabase,
  activeTrip.id,
  platformId,
  selectedDriver.id,
  vehicleId
);

      alert("Trip completed successfully.");

      await onRefresh();
    } catch (error) {
      console.error(error);

      alert("Unable to complete trip.");
    }
  }}
  className="rounded-lg bg-emerald-600 px-4 py-2 font-semibold text-white hover:bg-emerald-700"
>
  ✅ Complete Trip
</button>

<button
  onClick={async () => {
    if (!activeTrip) {
      alert("No active trip found.");
      return;
    }

    const vehicleId = selectedDriver.assigned_driver?.[0]?.id;

    if (!vehicleId) {
      alert("No vehicle assigned.");
      return;
    }

    const confirmed = window.confirm(
      `Cancel trip ${activeTrip.trip_code}?`
    );

    if (!confirmed) return;

    try {
if (!platformId) {
  alert("Platform not loaded.");
  return;
}

await cancelTrip(
  supabase,
  activeTrip.id,
  platformId,
  activeTrip.trip_status ?? "assigned",
  selectedDriver.id,
  vehicleId
);

      alert("Trip cancelled successfully.");

      await onRefresh();
    } catch (error) {
      console.error(error);
      alert("Unable to cancel trip.");
    }
  }}
  className="rounded-lg bg-red-600 px-4 py-2 font-semibold text-white hover:bg-red-700"
>
  ❌ Cancel Trip
</button>

  </div>
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