"use client";

import { useEffect, useState } from "react";
import AdminLayout from "../../components/AdminLayout";
import { supabase } from "../../lib/supabase";
import { getUserPlatform } from "../../lib/getUserPlatform";



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

type Vehicle = {
  id: string;
  vehicle_name: string | null;
  registration_number: string | null;
  assigned_driver?: string | null;
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
  estimated_km: number | null;
};

export default function TripsPage() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [passengers, setPassengers] = useState<TripPassenger[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [search, setSearch] = useState("");
  const [platformId, setPlatformId] = useState<string | null>(null);

  async function loadTrips() {
    if (!platformId) return;

    const { data, error } = await supabase
      .from("trips")
      .select("*")
      .eq("platform_id", platformId)
      .order("trip_date", { ascending: false });

    if (error) {
      alert(error.message);
      return;
    }

    setTrips(data || []);

    const { data: passengerData, error: passengerError } = await supabase
      .from("trip_passengers")
      .select("id, trip_id, full_name, phone, pickup_area, pickup_address, pickup_time, pickup_status")
      .eq("platform_id", platformId);

    if (passengerError) {
      alert(passengerError.message);
      return;
    }

    setPassengers(passengerData || []);

    const { data: driverData, error: driverError } = await supabase
      .from("drivers")
      .select("id, full_name")
      .eq("platform_id", platformId)
      .order("full_name", { ascending: true });

    if (driverError) {
      alert(driverError.message);
      return;
    }

    setDrivers(driverData || []);

    const { data: vehicleData, error: vehicleError } = await supabase
      .from("vehicles")
      .select("id, vehicle_name, registration_number, assigned_driver")
      .eq("platform_id", platformId)
      .order("vehicle_name", { ascending: true });

    if (vehicleError) {
      alert(vehicleError.message);
      return;
    }

    setVehicles(vehicleData || []);
  }

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
      .eq("id", trip.id);

    if (error) {
      alert(error.message);
      return;
    }

    if (!status) {
      await createAssignmentNotifications(trip);
    }

    if ((status || trip.status) === "Completed") {
      await saveBillingReport(trip);
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

  async function saveBillingReport(trip: Trip) {
    if (!platformId) return;

    await supabase.from("trip_billing_reports").insert({
      platform_id: platformId,
      trip_id: trip.id,
      trip_code: trip.trip_code,
      trip_date: trip.trip_date,
      company_name: "GHO",
      client_name: trip.area,
      area: trip.area,
      pickup_time: trip.pickup_time,
      dropoff_time: trip.dropoff_time,
      driver_name: trip.driver_name,
      vehicle_name: trip.vehicle_name,
      vehicle_registration: trip.vehicle_registration,
      passenger_count: trip.passenger_count,
      estimated_km: trip.estimated_km,
      trip_status: "Completed",
      billing_status: "Unbilled",
      billing_amount: 0,
      notes: "Auto-saved when trip was completed.",
    });
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

    loadTrips();
  }, [platformId]);

  const filteredTrips = trips.filter((trip) => {
    const text = `${trip.trip_code} ${trip.trip_date} ${trip.shift} ${trip.area} ${trip.driver_name} ${trip.vehicle_name} ${trip.vehicle_registration} ${trip.status}`.toLowerCase();
    return text.includes(search.toLowerCase());
  });

  const confirmedTrips = trips.filter((trip) => trip.status === "Confirmed").length;
  const inProgressTrips = trips.filter((trip) => trip.status === "In Progress").length;
  const completedTrips = trips.filter((trip) => trip.status === "Completed").length;

  return (
    <AdminLayout>
      <main className="min-h-screen bg-gray-100 p-6">
        <h1 className="text-4xl font-bold text-[#061B33]">
          Trips Management
        </h1>

        <p className="text-gray-600 mt-2">
          Calendar-generated trips appear here for driver, vehicle, and billing management.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-white rounded-xl shadow p-5">
            <p className="font-bold text-gray-600">Total Trips</p>
            <p className="text-4xl font-bold text-[#061B33]">{trips.length}</p>
          </div>

          <div className="bg-orange-50 rounded-xl shadow p-5">
            <p className="font-bold text-gray-600">Confirmed</p>
            <p className="text-4xl font-bold text-orange-500">{confirmedTrips}</p>
          </div>

          <div className="bg-blue-50 rounded-xl shadow p-5">
            <p className="font-bold text-gray-600">In Progress</p>
            <p className="text-4xl font-bold text-blue-600">{inProgressTrips}</p>
          </div>

          <div className="bg-green-50 rounded-xl shadow p-5">
            <p className="font-bold text-gray-600">Completed</p>
            <p className="text-4xl font-bold text-green-600">{completedTrips}</p>
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
          <h2 className="text-xl font-bold mb-4">Trip List</h2>

          {filteredTrips.length === 0 && (
            <p className="text-gray-500">No trips found.</p>
          )}

          <div className="space-y-4">
            {filteredTrips.map((trip) => (
              <div key={trip.id} className="border rounded-2xl p-5 bg-slate-50">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div>
                    <p className="text-2xl font-bold text-[#061B33]">
                      🚐 {trip.trip_code}
                    </p>
                    <p><strong>Date:</strong> {trip.trip_date}</p>
                    <p><strong>Shift:</strong> {trip.shift}</p>
                    <p><strong>Area:</strong> {trip.area}</p>
                    <p><strong>Pickup:</strong> {trip.pickup_time}</p>
                    <p><strong>Drop-off:</strong> {trip.dropoff_time}</p>
                    <p><strong>Passengers:</strong> {trip.passenger_count}</p>
                    <p><strong>Estimated KM:</strong> {trip.estimated_km ? `${trip.estimated_km} km` : "Not set"}</p>
                    <p><strong>Status:</strong> {trip.status}</p>
                  </div>

                  <div className="grid grid-cols-1 gap-3 w-full md:max-w-md">
                    <select
                      value={trip.driver_name || ""}
                      onChange={(e) =>
                        setTrips((current) =>
                          current.map((item) =>
                            item.id === trip.id
                              ? { ...item, driver_name: e.target.value }
                              : item
                          )
                        )
                      }
                      className="border p-3 rounded-lg"
                    >
                      <option value="">Select Driver</option>
                      {drivers.map((driver) => (
                        <option key={driver.id} value={driver.full_name || ""}>
                          {driver.full_name}
                        </option>
                      ))}
                    </select>

                    <input
                      value={trip.vehicle_name || ""}
                      onChange={(e) =>
                        setTrips((current) =>
                          current.map((item) =>
                            item.id === trip.id
                              ? { ...item, vehicle_name: e.target.value }
                              : item
                          )
                        )
                      }
                      className="border p-3 rounded-lg"
                      placeholder="Vehicle name"
                    />

                    <input
                      value={trip.vehicle_registration || ""}
                      onChange={(e) =>
                        setTrips((current) =>
                          current.map((item) =>
                            item.id === trip.id
                              ? { ...item, vehicle_registration: e.target.value }
                              : item
                          )
                        )
                      }
                      className="border p-3 rounded-lg"
                      placeholder="Vehicle registration"
                    />

                    <button
                      onClick={() => updateTrip(trip)}
                      className="bg-[#061B33] text-white px-5 py-3 rounded-lg font-bold"
                    >
                      Save Driver & Vehicle
                    </button>

                    <div className="grid grid-cols-3 gap-2">
                      <button
                        onClick={() => updateTrip(trip, "In Progress")}
                        className="bg-blue-600 text-white px-3 py-2 rounded-lg font-bold"
                      >
                        Start
                      </button>

                      <button
                        onClick={() => updateTrip(trip, "Completed")}
                        className="bg-green-600 text-white px-3 py-2 rounded-lg font-bold"
                      >
                        Complete
                      </button>

                      <button
                        onClick={() => updateTrip(trip, "Cancelled")}
                        className="bg-red-600 text-white px-3 py-2 rounded-lg font-bold"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>

                <div className="mt-4 bg-white rounded-xl border p-4">
                  <p className="font-bold text-[#061B33]">Assigned Unit</p>
                  <p>👤 Driver: {trip.driver_name || "Not assigned"}</p>
                  <p>🚐 Vehicle: {trip.vehicle_name || trip.vehicle_type || "Not assigned"}</p>
                  <p>🔢 Registration: {trip.vehicle_registration || "Not assigned"}</p>
                </div>

                <div className="mt-4 bg-white rounded-xl border p-4">
                  <p className="font-bold text-[#061B33] mb-3">📄 Passenger Manifest</p>

                  {passengers.filter((passenger) => passenger.trip_id === trip.id).length === 0 ? (
                    <p className="text-gray-500">No passengers linked to this trip.</p>
                  ) : (
                    <div className="space-y-2">
                      {passengers
                        .filter((passenger) => passenger.trip_id === trip.id)
                        .map((passenger, index) => (
                          <div key={passenger.id} className="border rounded-lg p-3 bg-gray-50">
                            <p className="font-bold">
                              {index + 1}. {passenger.full_name || "Unknown Passenger"}
                            </p>
                            <p className="text-sm text-gray-600">📞 {passenger.phone || "No phone"}</p>
                            <p className="text-sm text-gray-600">
                              📍 {passenger.pickup_address || passenger.pickup_area || "No pickup address"}
                            </p>
                            <p className="text-sm font-bold">
                              Status: {passenger.pickup_status || "Waiting"}
                            </p>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </AdminLayout>
  );
}
