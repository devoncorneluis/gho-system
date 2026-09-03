"use client";

import { use, useCallback, useEffect, useRef, useState } from "react";
import { publishFleetEvent } from "../../../lib/fleet/fleetEventBus";
import { getFleetEvent } from "../../../lib/fleet/fleetEventEngine";
import { logActivity } from "../../../lib/activity/activityLogger";
import { supabase } from "../../../lib/supabase";
import { TRIP_STATUS } from "../../../lib/tripStatus";
import TripTimeline, {
  TimelineEvent,
} from "../../../components/timeline/TripTimeline";
import { loadTripTimeline } from "../../../lib/loadTripTimeline";
import { recordTripEvent } from "../../../lib/tripEventService";
type Trip = {
  id: string;
  platform_id: string | null;

  trip_code: string | null;
  trip_date: string | null;

  shift: string | null;
  area: string | null;

  pickup_time: string | null;
  dropoff_time: string | null;

  driver_id: string | null;
  driver_name: string | null;

  vehicle_id: string | null;
  vehicle_name: string | null;
  vehicle_registration: string | null;

  status: string | null;

  estimated_km: number | null;
  trip_distance_km: number | null;
  estimated_duration: number | null;

  started_at: string | null;
  completed_at: string | null;
  last_gps_update: string | null;
driver_latitude: number | null;
driver_longitude: number | null;
driver_speed: number | null;
driver_heading: number | null;
};
export default function TripDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
const watchIdRef = useRef<number | null>(null);
  const [trip, setTrip] = useState<Trip | null>(null);
const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
const [liveLocation, setLiveLocation] = useState<{
  latitude: number;
  longitude: number;
  speed: number;
  heading: number;
  updated_at: string;
} | null>(null);

  const loadTrip = useCallback(async () => {
    const { data } = await supabase
      .from("trips")
      .select("*")
      .eq("id", id)
      .single();

if (data) {
  setTrip(data);

  const timelineData = await loadTripTimeline(
    supabase,
    data.id
  );

  setTimeline(timelineData);
}
if (data?.driver_id) {
  const { data: location } = await supabase
    .from("driver_locations")
    .select("latitude, longitude, speed, heading, updated_at")
    .eq("driver_id", data.driver_id)
    .eq("trip_id", data.id)
    .single();

  setLiveLocation(location ?? null);
}
}, [id]);

async function startTrip() {
  function startLocationTracking(driverId: string, tripId: string) {
    watchIdRef.current = navigator.geolocation.watchPosition(
      async (position) => {
        await supabase
          .from("driver_locations")
          .upsert({
            driver_id: driverId,
            trip_id: tripId,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            speed: position.coords.speed ?? 0,
            heading: position.coords.heading ?? 0,
            updated_at: new Date().toISOString(),
          });

        await supabase.from("driver_location_history").insert({
          platform_id: trip?.platform_id,
          driver_id: driverId,
          trip_id: tripId,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          speed: position.coords.speed ?? 0,
          heading: position.coords.heading ?? 0,
          recorded_at: new Date().toISOString(),
        });
      },
      (error) => {
        console.error(error);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 5000,
        timeout: 10000,
      }
    );
  }

  if (!trip) return;

  if (!trip.platform_id) {
    alert("Trip platform context is missing.");
    return;
  }

  const { error } = await supabase
    .from("trips")
    .update({
      status: TRIP_STATUS.IN_TRANSIT,
      started_at: new Date().toISOString(),
    })
    .eq("id", trip.id)
    .eq("platform_id", trip.platform_id);

  if (error) {
    alert(error.message);
    return;
  }

  publishFleetEvent(
    getFleetEvent("trip_started", {
      driverName: trip.driver_name ?? "Driver",
      tripCode: trip.trip_code ?? "Unknown",
    })
  );

  await recordTripEvent({
    tripId: trip.id,
    platformId: trip.platform_id,
    createdBy: trip.driver_id,
    eventType: "trip_started",
    eventData: {
      description: `${trip.trip_code} was started.`,
      tripCode: trip.trip_code,
      driverName: trip.driver_name,
      vehicleName: trip.vehicle_name,
    },
  });
await logActivity({
  platformId: trip.platform_id,
  activityType: "trip_started",
  entityType: "trip",
  entityId: trip.id,
  entityName: trip.trip_code ?? "",
  description: `${trip.driver_name} started trip ${trip.trip_code}`,
  createdBy: trip.driver_id ?? undefined,
  createdByName: trip.driver_name ?? undefined,
  metadata: {
    vehicle: trip.vehicle_name,
  },
});
  if (trip.driver_id) {
    startLocationTracking(trip.driver_id, trip.id);
  }

  await loadTrip();

  alert("Trip started.");
}

async function completeTrip() {
  if (!trip) return;

  if (!confirm("Complete this trip?")) return;

  if (!trip.platform_id) {
    alert("Trip platform context is missing.");
    return;
  }

const { data: updatedTrip, error: updateError } = await supabase
  .from("trips")
  .update({
    status: TRIP_STATUS.COMPLETED,
    completed_at: new Date().toISOString(),
    actual_end_time: new Date().toISOString(),
    billable: true,
    invoiced: false,
  })
  .eq("id", trip.id)
  .eq("platform_id", trip.platform_id)
  .select("id, platform_id, status, billable, invoiced");

if (updateError) {
  console.error("Complete Trip update error:", updateError);
  alert(String(updateError));
  return;
}

console.log("Complete Trip updated:", updatedTrip);

  publishFleetEvent(
    getFleetEvent("trip_completed", {
      driverName: trip.driver_name ?? "Driver",
      tripCode: trip.trip_code ?? "Unknown",
    })
  );

  await recordTripEvent({
    tripId: trip.id,
    platformId: trip.platform_id,
    createdBy: trip.driver_id,
    eventType: "trip_completed",
    eventData: {
      description: `${trip.trip_code} was completed.`,
      tripCode: trip.trip_code,
      driverName: trip.driver_name,
      vehicleName: trip.vehicle_name,
    },
  });
await logActivity({
  platformId: trip.platform_id,
  activityType: "trip_completed",
  entityType: "trip",
  entityId: trip.id,
  entityName: trip.trip_code ?? "",
  description: `${trip.driver_name} completed trip ${trip.trip_code}`,
  createdBy: trip.driver_id ?? undefined,
  createdByName: trip.driver_name ?? undefined,
  metadata: {
    vehicle: trip.vehicle_name,
  },
});
  await supabase
    .from("trip_passengers")
    .update({
      pickup_status: "Completed",
    })
    .eq("trip_id", trip.id)
    .eq("platform_id", trip.platform_id);

  if (trip.driver_id) {
    await supabase
      .from("drivers")
      .update({
        status: "Available",
        availability_status: "Available",
      })
      .eq("id", trip.driver_id)
      .eq("platform_id", trip.platform_id);
  }

  if (trip.vehicle_id) {
    await supabase
      .from("vehicles")
      .update({
        status: "Available",
        availability_status: "Available",
        assigned_driver: null,
      })
      .eq("id", trip.vehicle_id)
      .eq("platform_id", trip.platform_id);
  }

  if (watchIdRef.current !== null) {
    navigator.geolocation.clearWatch(watchIdRef.current);
    watchIdRef.current = null;
  }

  await loadTrip();

  alert("Trip completed successfully.");
}

async function cancelTrip() {
  if (!trip) return;

  if (!confirm("Cancel this trip?")) return;

  const { error } = await supabase
    .from("trips")
    .update({
      status: TRIP_STATUS.CANCELLED,
    })
    .eq("id", trip.id)
    .eq("platform_id", trip.platform_id);

  if (error) {
    alert(error.message);
    return;
  }
publishFleetEvent(
  getFleetEvent("trip_cancelled", {
    driverName: trip.driver_name ?? "Driver",
    tripCode: trip.trip_code ?? "Unknown",
  })
);

  await recordTripEvent({
    tripId: trip.id,
    platformId: trip.platform_id,
    createdBy: trip.driver_id,
    eventType: "trip_cancelled",
    eventData: {
      description: `${trip.trip_code} was cancelled.`,
      tripCode: trip.trip_code,
      driverName: trip.driver_name,
      vehicleName: trip.vehicle_name,
    },
  });
await logActivity({
platformId: trip.platform_id!,
  activityType: "trip_cancelled",
  entityType: "trip",
  entityId: trip.id,
  entityName: trip.trip_code ?? "",
  description: `${trip.driver_name} cancelled trip ${trip.trip_code}`,
  createdBy: trip.driver_id ?? undefined,
  createdByName: trip.driver_name ?? undefined,
  metadata: {
    vehicle: trip.vehicle_name,
  },
});
  if (watchIdRef.current !== null) {
    navigator.geolocation.clearWatch(watchIdRef.current);
    watchIdRef.current = null;
  }

  await loadTrip();

  alert("Trip cancelled.");
}

async function createEmergencyAlert() {
  if (!trip) return;

  if (!confirm("Send an emergency alert?")) return;

  const { error } = await supabase
    .from("emergency_alerts")
    .insert({
      platform_id: trip.platform_id,
      trip_id: trip.id,
      driver_id: trip.driver_id,
      alert_type: "Emergency",
      notes: `Emergency raised from ${trip.trip_code}`,
      status: "Open",
    });

  if (error) {
    alert(error.message);
    return;
  }

  publishFleetEvent(
    getFleetEvent("emergency", {
      driverName: trip.driver_name ?? "Driver",
      tripCode: trip.trip_code ?? "Unknown",
    })
  );

  await recordTripEvent({
    tripId: trip.id,
platformId: trip.platform_id!,
    createdBy: trip.driver_id,
    eventType: "emergency_raised",
    eventData: {
      description: `Emergency raised for ${trip.trip_code}.`,
      tripCode: trip.trip_code,
      driverName: trip.driver_name,
      vehicleName: trip.vehicle_name,
      alertType: "Emergency",
    },
  });

  alert("Emergency alert sent successfully.");
}
useEffect(() => {
  // eslint-disable-next-line react-hooks/set-state-in-effect
  loadTrip();

  const channel = supabase
    .channel(`trip-location-${id}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "driver_locations",
      },
      () => {
        loadTrip();
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}, [id, loadTrip]);

  if (!trip) {
    return (
      <main className="min-h-screen p-6">
        Loading trip...
      </main>
    );
  }
function gpsStatus() {
  if (trip?.status === TRIP_STATUS.IN_TRANSIT) {
    return {
      label: "Active",
      colour: "text-green-600",
    };
  }

  return {
    label: "Inactive",
    colour: "text-gray-500",
  };
}
  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <button
        onClick={() => window.history.back()}
        className="mb-4 bg-gray-200 px-4 py-2 rounded-xl font-bold"
      >
        ← Back
      </button>

      <div className="bg-white rounded-xl shadow p-6">
        <h1 className="text-3xl font-bold text-[#061B33]">
          {trip.trip_code}
        </h1>
        <div className="grid md:grid-cols-2 gap-4 mt-4">
          <p><strong>Date:</strong> {trip.trip_date}</p>
          <p><strong>Shift:</strong> {trip.shift}</p>
          <p><strong>Area:</strong> {trip.area}</p>
          <p><strong>Status:</strong> {trip.status}</p>
          <p><strong>Driver:</strong> {trip.driver_name}</p>
          <p><strong>Vehicle:</strong> {trip.vehicle_name}</p>
          <p><strong>Registration:</strong> {trip.vehicle_registration}</p>
          <p><strong>Distance:</strong> {trip.trip_distance_km || trip.estimated_km} km</p>
          <p>
            <strong>Duration:</strong>{" "}
            {trip.estimated_duration
              ? `${trip.estimated_duration} min`
              : "Not set"}
          </p>
        </div>
<div className="mt-6">
  <TripTimeline events={timeline} />
</div>
</div>

<div className="bg-white rounded-xl shadow p-6 mt-6">
  <h2 className="text-2xl font-bold text-[#061B33] mb-4">
    Live Tracking
  </h2>

  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">

    <div>
      <p className="text-sm text-gray-500">GPS Status</p>
      <p className={`font-bold ${gpsStatus().colour}`}>
        {gpsStatus().label}
      </p>
    </div>

    <div>
      <p className="text-sm text-gray-500">Trip Status</p>
      <p className="font-bold">
        {trip.status}
      </p>
    </div>

<div>
  <p className="text-sm text-gray-500">Current Speed</p>
  <p className="font-bold">
    {liveLocation ? `${Math.round(liveLocation.speed)} km/h` : "-"}
  </p>
</div>

<div>
  <p className="text-sm text-gray-500">Last GPS Update</p>
  <p className="font-bold">
    {liveLocation
      ? new Date(liveLocation.updated_at).toLocaleTimeString()
      : "-"}
  </p>
</div>

  </div>
</div>

<div className="bg-white rounded-xl shadow p-6 mt-6">
  <h2 className="text-2xl font-bold mb-4">
    Operations Centre
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">

          <button
            onClick={startTrip}
            disabled={
              trip.status === TRIP_STATUS.IN_TRANSIT ||
              trip.status === TRIP_STATUS.COMPLETED
            }
            className="bg-green-600 text-white rounded-xl p-3 font-bold disabled:bg-gray-400"
          >
            {trip.status === TRIP_STATUS.IN_TRANSIT
              ? "Trip Started"
              : trip.status === TRIP_STATUS.COMPLETED
              ? "Trip Completed"
              : "Start Trip"}
          </button>

          <button
            onClick={completeTrip}
            disabled={trip.status === TRIP_STATUS.COMPLETED}
            className="bg-blue-600 text-white rounded-xl p-3 font-bold disabled:bg-gray-400"
          >
            Complete Trip
          </button>
<button
  onClick={cancelTrip}
  disabled={trip.status === TRIP_STATUS.COMPLETED}
  className="bg-gray-700 text-white rounded-xl p-3 font-bold disabled:bg-gray-400"
>
  Cancel Trip
</button>
          <button
            onClick={() =>
              window.location.href = `/live-map?trip=${trip.id}`
            }
            className="bg-green-700 text-white rounded-xl p-3 font-bold"
          >
            Live Map
          </button>

          <button
            onClick={() => alert("Support ticket modal coming soon.")}
            className="bg-yellow-500 text-white rounded-xl p-3 font-bold"
          >
            Support Ticket
          </button>

          <button
            onClick={createEmergencyAlert}
            className="bg-red-600 text-white rounded-xl p-3 font-bold"
          >
            Emergency
          </button>
        </div>
      </div>
    </main>
  );
}