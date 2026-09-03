"use client";

import { useCallback, useEffect, useState } from "react";
import AdminLayout from "../../components/AdminLayout";
import { supabase } from "../../lib/supabase";
import { getUserPlatform } from "../../lib/getUserPlatform";
import TripCard from "../../components/trips/TripCard";
import StatusBadge from "../../components/trips/StatusBadge";
import { dispatchTrip } from "../../lib/dispatchService";
import Pagination from "../../components/common/Pagination";
import { TRIP_STATUS } from "../../lib/tripStatus";


type TripPassenger = {
  id: string;
  trip_id: string;
  full_name: string | null;
  phone: string | null;
  pickup_area: string | null;
  pickup_address: string | null;
  pickup_time: string | null;
  pickup_status: string | null;
};

type Driver = {
  id: string;
  full_name: string | null;
};

type Trip = {
  id: string;
  platform_id: string;
  trip_code: string;
  trip_date: string | null;
  shift: string | null;
  area: string | null;
  pickup_time: string | null;
  dropoff_time: string | null;
  vehicle_type: string | null;
  passenger_count: number | null;
  driver_name: string | null;
  status: string | null;
  created_at: string | null;
  vehicle_name: string | null;
  vehicle_registration: string | null;
distance_km: number | null;
};

const PAGE_SIZE = 25;

export default function TripsPage() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [totalTripsCount, setTotalTripsCount] = useState(0);
  const [confirmedTripsCount, setConfirmedTripsCount] = useState(0);
  const [inProgressTripsCount, setInProgressTripsCount] = useState(0);
  const [completedTripsCount, setCompletedTripsCount] = useState(0);
  const [page, setPage] = useState(1);
  const [passengers, setPassengers] = useState<TripPassenger[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [search, setSearch] = useState("");
  const [platformId, setPlatformId] = useState<string | null>(null);

  type LiveDriver = {
    driver_id: string;
    driver_name?: string;
    trip_id: string | null;
    latitude: number;
    longitude: number;
    speed: number | null;
    heading: number | null;
    accuracy: number | null;
    is_tracking: boolean;
    updated_at: string;
  };
  type DriverLocationRow = LiveDriver & {
    drivers?: {
      full_name?: string | null;
    } | null;
  };
  const [liveDrivers, setLiveDrivers] = useState<LiveDriver[]>([]);

  const loadTrips = useCallback(async () => {
    if (!platformId) return;

    const from = (page - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    const [
      tripsResult,
      passengerResult,
      driverResult,
      confirmedCountResult,
      inProgressCountResult,
      completedCountResult,
    ] = await Promise.all([
      supabase
        .from("trips")
        .select("*", { count: "exact" })
        .eq("platform_id", platformId)
        .order("trip_date", { ascending: false })
        .range(from, to),
      supabase
        .from("trip_passengers")
        .select("id, trip_id, full_name, phone, pickup_area, pickup_address, pickup_time, pickup_status")
        .eq("platform_id", platformId),
      supabase
        .from("drivers")
        .select("id, full_name")
        .eq("platform_id", platformId)
        .order("full_name", { ascending: true }),
      supabase
        .from("trips")
        .select("id", { count: "exact", head: true })
        .eq("platform_id", platformId)
        .eq("status", TRIP_STATUS.APPROVED),
      supabase
        .from("trips")
        .select("id", { count: "exact", head: true })
        .eq("platform_id", platformId)
        .eq("status", TRIP_STATUS.IN_TRANSIT),
      supabase
        .from("trips")
        .select("id", { count: "exact", head: true })
        .eq("platform_id", platformId)
        .eq("status", TRIP_STATUS.COMPLETED),
    ]);

    const { data, error, count } = tripsResult;

    if (error) {
      alert(error.message);
      return;
    }

    setTrips(data || []);
    setTotalTripsCount(count ?? 0);

    const { data: passengerData, error: passengerError } = passengerResult;

    if (passengerError) {
      alert(passengerError.message);
      return;
    }

    setPassengers(passengerData || []);

    const { data: driverData, error: driverError } = driverResult;

    if (driverError) {
      alert(driverError.message);
      return;
    }

    setDrivers(driverData || []);

    setConfirmedTripsCount(confirmedCountResult.count ?? 0);
    setInProgressTripsCount(inProgressCountResult.count ?? 0);
    setCompletedTripsCount(completedCountResult.count ?? 0);
  }, [page, platformId]);

  const loadLiveDrivers = useCallback(async () => {
    if (!platformId) return;

    const { data, error } = await supabase
      .from("driver_locations")
      .select(`
        driver_id,
        trip_id,
        latitude,
        longitude,
        speed,
        heading,
        accuracy,
        is_tracking,
        updated_at,
        drivers(full_name)
      `)
      .eq("drivers.platform_id", platformId)
      .eq("is_tracking", true);

    if (error) {
      console.error(error.message);
      return;
    }

    setLiveDrivers(
      (data as DriverLocationRow[] | null || []).map((item) => ({
        ...item,
        driver_name: item.drivers?.full_name ?? "Unknown Driver",
      }))
    );
  }, [platformId]);

  async function updateTrip(trip: Trip, status?: string) {
    if (!platformId) {
      alert("Platform not loaded yet.");
      return;
    }

    const { error } = await supabase
      .from("trips")
      .update({
        driver_name: trip.driver_name,
        vehicle_name: trip.vehicle_name,
        vehicle_registration: trip.vehicle_registration,
        status: status || trip.status,
      })
      .eq("platform_id", platformId)
      .eq("id", trip.id);

    if (error) {
      alert(error.message);
      return;
    }

    if (!status) {
      await createAssignmentNotifications(trip);
    }

    if ((status || trip.status) === TRIP_STATUS.COMPLETED) {
    }

    loadTrips();
  }

  async function createAssignmentNotifications(trip: Trip) {
    if (!platformId) return;

    const { data: passengers, error: passengerError } = await supabase
      .from("trip_passengers")
      .select("full_name, email, phone")
      .eq("platform_id", platformId)
      .eq("trip_id", trip.id);

    if (passengerError) {
      alert(passengerError.message);
      return;
    }

    if (!passengers || passengers.length === 0) {
      return;
    }

    const baseMessage =
      `GHO: Driver assigned for trip ${trip.trip_code}. ` +
      `Driver: ${trip.driver_name || "Not assigned"}. ` +
      `Vehicle: ${trip.vehicle_name || "Not assigned"} ` +
      `${trip.vehicle_registration || ""}.`;

    const notificationRows = passengers.flatMap((passenger) => {
      return [
        {
          platform_id: platformId,
          trip_id: trip.id,
          recipient_name: passenger.full_name,
          recipient_email: passenger.email,
          recipient_phone: passenger.phone,
          whatsapp_number: passenger.phone,
          notification_type: "Driver Assigned",
          channel: "In-App",
          message: baseMessage,
          status: "Pending",
        },
        {
          platform_id: platformId,
          trip_id: trip.id,
          recipient_name: passenger.full_name,
          recipient_email: passenger.email,
          recipient_phone: passenger.phone,
          whatsapp_number: passenger.phone,
          notification_type: "Driver Assigned",
          channel: "Email",
          message: baseMessage,
          status: "Pending",
        },
        {
          platform_id: platformId,
          trip_id: trip.id,
          recipient_name: passenger.full_name,
          recipient_email: passenger.email,
          recipient_phone: passenger.phone,
          whatsapp_number: passenger.phone,
          notification_type: "Driver Assigned",
          channel: "WhatsApp",
          message: baseMessage,
          status: "Pending",
        },
      ];
    });

    const { error } = await supabase
      .from("notification_logs")
      .insert(notificationRows);

    if (error) {
      alert(error.message);
    }
  }


  useEffect(() => {
    async function setupPage() {
      const userPlatform = await getUserPlatform();

      if (!userPlatform) {
        window.location.href = "/login";
        return;
      }

      setPlatformId(userPlatform.platformId);
    }

    setupPage();
  }, []);

  useEffect(() => {
    if (!platformId) return;

    const interval = setInterval(() => {
      loadLiveDrivers();
    }, 10000);

    return () => clearInterval(interval);
  }, [loadLiveDrivers, platformId]);

  useEffect(() => {
    if (!platformId) return;

    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadTrips();
    loadLiveDrivers();
  }, [loadLiveDrivers, loadTrips, page, platformId]);

  const filteredTrips = trips.filter((trip) => {
    const text = `${trip.trip_code} ${trip.trip_date} ${trip.shift} ${trip.area} ${trip.driver_name} ${trip.vehicle_name} ${trip.vehicle_registration} ${trip.status}`.toLowerCase();
    return text.includes(search.toLowerCase());
  });

  return (
    <AdminLayout>
      <main className="min-h-screen bg-gray-100 p-6">
<h1 className="text-4xl font-bold text-[#061B33]">
  Booked Trips
</h1>

<p className="text-gray-600 mt-2">
  All planned transport trips in one place. Open a trip to manage its operations.
</p>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-white rounded-xl shadow p-5">
            <p className="font-bold text-gray-600">Total Trips</p>
            <p className="text-4xl font-bold text-[#061B33]">{totalTripsCount}</p>
          </div>

          <div className="bg-orange-50 rounded-xl shadow p-5">
            <p className="font-bold text-gray-600">Confirmed</p>
            <p className="text-4xl font-bold text-orange-500">{confirmedTripsCount}</p>
          </div>

          <div className="bg-blue-50 rounded-xl shadow p-5">
            <p className="font-bold text-gray-600">In Progress</p>
            <p className="text-4xl font-bold text-blue-600">{inProgressTripsCount}</p>
          </div>

          <div className="bg-green-50 rounded-xl shadow p-5">
            <p className="font-bold text-gray-600">Completed</p>
            <p className="text-4xl font-bold text-green-600">{completedTripsCount}</p>
          </div>
        </div>


        <div className="bg-white rounded-xl shadow p-6 mt-6">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border p-3 rounded-lg w-full"
            placeholder="Search trips by area, driver, vehicle, status..."
          />
        </div>

        <div className="bg-white rounded-xl shadow p-6 mt-6">
          <h2 className="text-xl font-bold mb-4">Booked Trips</h2>

          {filteredTrips.length === 0 && (
            <p className="text-gray-500">No booked trips found.</p>
          )}

          <div className="space-y-4">
            {filteredTrips.map((trip) => (
              <TripCard key={trip.id}>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">

                  <div className="space-y-1">
                    <p className="text-2xl font-bold text-[#061B33]">
                      🚐 {trip.trip_code}
                    </p>

                    <p className="text-gray-600">
                      {trip.trip_date || "Date not set"} · {trip.shift || "Shift not set"}
                    </p>

                    <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
                      <p>
                        <strong>Passengers:</strong>{" "}
                        {trip.passenger_count ?? 0}
                      </p>

                      <p>
                        <strong>Distance:</strong>{" "}
{trip.distance_km
  ? `${trip.distance_km} km`
  : "Not set"}
                      </p>

                      <p>
                        <strong>Driver:</strong>{" "}
                        {trip.driver_name || "Not assigned"}
                      </p>

                      <p>
                        <strong>Vehicle:</strong>{" "}
                        {trip.vehicle_name || "Not assigned"}
                      </p>
                    </div>

                    <div className="mt-3">
                      <StatusBadge status={trip.status} />
                    </div>
                  </div>

                  <div className="w-full md:w-auto">
                    <a
                      href={`/trips/${trip.id}`}
                      className="block bg-[#061B33] text-white text-center px-6 py-3 rounded-lg font-bold hover:bg-orange-500"
                    >
                      Open Trip
                    </a>
                  </div>

                </div>
              </TripCard>
            ))}
          </div>

          <Pagination
            page={page}
            pageSize={PAGE_SIZE}
            total={totalTripsCount}
            onPageChange={setPage}
          />
        </div>
      </main>
    </AdminLayout>
  );
}
