"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

const PLATFORM_ID = "713c411b-847e-4379-8e38-c142e06ff5fd";

type Trip = {
  id: string;
  trip_code: string;
  trip_date: string | null;
  shift: string | null;
  area: string | null;
  pickup_time: string | null;
  dropoff_time: string | null;
  vehicle_type: string | null;
  vehicle_name: string | null;
  vehicle_registration: string | null;
  passenger_count: number | null;
  driver_name: string | null;
  status: string | null;
};

type Driver = {
  id: string;
  full_name: string;
  driver_code: string | null;
  assigned_vehicle_id: string | null;
};

type Vehicle = {
  id: string;
  vehicle_code: string | null;
  vehicle_name: string;
  registration_number: string;
  vehicle_type: string | null;
};

export default function TripsPage() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [editingTrip, setEditingTrip] = useState<Trip | null>(null);

  async function loadTrips() {
    const { data, error } = await supabase
      .from("trips")
      .select("*")
      .eq("platform_id", PLATFORM_ID)
      .order("created_at", { ascending: false });

    if (error) {
      alert(error.message);
      return;
    }

    setTrips(data || []);
  }

  async function loadDrivers() {
    const { data, error } = await supabase
      .from("drivers")
      .select("id, full_name, driver_code, assigned_vehicle_id")
      .eq("platform_id", PLATFORM_ID)
      .order("full_name");

    if (error) {
      alert(error.message);
      return;
    }

    setDrivers(data || []);
  }

  async function loadVehicles() {
    const { data, error } = await supabase
      .from("vehicles")
      .select("id, vehicle_code, vehicle_name, registration_number, vehicle_type")
      .eq("platform_id", PLATFORM_ID)
      .order("vehicle_name");

    if (error) {
      alert(error.message);
      return;
    }

    setVehicles(data || []);
  }

  async function assignDriverWithVehicle(tripId: string, driverId: string) {
    const selectedDriver = drivers.find((driver) => driver.id === driverId);

    if (!selectedDriver) return;

    if (!selectedDriver.assigned_vehicle_id) {
      alert("This driver has no vehicle details saved. Please edit the driver and assign a vehicle first.");
      return;
    }

    const selectedVehicle = vehicles.find(
      (vehicle) => vehicle.id === selectedDriver.assigned_vehicle_id
    );

    if (!selectedVehicle) {
      alert("Assigned vehicle was not found. Please check the driver's vehicle details.");
      return;
    }

    const { error } = await supabase
      .from("trips")
      .update({
        driver_name: selectedDriver.full_name,
        vehicle_name: selectedVehicle.vehicle_name,
        vehicle_registration: selectedVehicle.registration_number,
        vehicle_type: selectedVehicle.vehicle_type,
        status: "Assigned",
      })
      .eq("id", tripId);

    if (error) {
      alert(error.message);
      return;
    }

    loadTrips();
  }

  async function cancelTrip(tripId: string) {
    const confirmCancel = confirm("Are you sure you want to cancel this trip?");
    if (!confirmCancel) return;

    const { error } = await supabase
      .from("trips")
      .update({ status: "Cancelled" })
      .eq("id", tripId);

    if (error) {
      alert(error.message);
      return;
    }

    loadTrips();
  }

  async function confirmTrip(tripId: string) {
    const { error } = await supabase
      .from("trips")
      .update({ status: "Confirmed" })
      .eq("id", tripId);

    if (error) {
      alert(error.message);
      return;
    }

    loadTrips();
  }

  async function saveTripChanges() {
    if (!editingTrip) return;

    const { error } = await supabase
      .from("trips")
      .update({
        pickup_time: editingTrip.pickup_time,
        dropoff_time: editingTrip.dropoff_time,
        passenger_count: editingTrip.passenger_count,
        status: editingTrip.status,
      })
      .eq("id", editingTrip.id);

    if (error) {
      alert(error.message);
      return;
    }

    setEditingTrip(null);
    loadTrips();
  }

  useEffect(() => {
    loadTrips();
    loadDrivers();
    loadVehicles();
  }, []);

  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-4xl font-bold text-[#061B33]">Trips</h1>

      <p className="text-gray-600 mt-2">
        Select a driver and GHO automatically fills the assigned vehicle and number plate.
      </p>

      <a
        href="/calendar"
        className="inline-block mt-6 bg-orange-500 text-white px-6 py-3 rounded-lg font-bold"
      >
        + Generate Trips
      </a>

      {editingTrip && (
        <div className="bg-white rounded-xl shadow p-6 mt-6 border-2 border-orange-500">
          <h2 className="text-2xl font-bold text-[#061B33] mb-4">
            Edit Trip: {editingTrip.trip_code}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              value={editingTrip.pickup_time || ""}
              onChange={(e) => setEditingTrip({ ...editingTrip, pickup_time: e.target.value })}
              className="border p-3 rounded-lg"
              placeholder="Pickup Time"
            />

            <input
              value={editingTrip.dropoff_time || ""}
              onChange={(e) => setEditingTrip({ ...editingTrip, dropoff_time: e.target.value })}
              className="border p-3 rounded-lg"
              placeholder="Drop-off Time"
            />

            <input
              value={editingTrip.passenger_count || ""}
              onChange={(e) =>
                setEditingTrip({ ...editingTrip, passenger_count: Number(e.target.value) })
              }
              className="border p-3 rounded-lg"
              placeholder="Passenger Count"
              type="number"
            />

            <select
              value={editingTrip.status || ""}
              onChange={(e) => setEditingTrip({ ...editingTrip, status: e.target.value })}
              className="border p-3 rounded-lg"
            >
              <option>Confirmed</option>
              <option>Assigned</option>
              <option>In Progress</option>
              <option>Completed</option>
              <option>Cancelled</option>
            </select>
          </div>

          <div className="flex gap-3 mt-6">
            <button onClick={saveTripChanges} className="bg-green-600 text-white px-5 py-3 rounded-lg font-bold">
              Save Changes
            </button>

            <button onClick={() => setEditingTrip(null)} className="bg-gray-500 text-white px-5 py-3 rounded-lg font-bold">
              Close
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow p-6 mt-6 overflow-x-auto">
        <h2 className="text-xl font-bold mb-4">Trip List</h2>

        <div className="grid grid-cols-10 font-bold border-b pb-2 min-w-[1300px]">
          <p>Trip</p>
          <p>Date</p>
          <p>Area</p>
          <p>Pickup</p>
          <p>Drop-off</p>
          <p>Passengers</p>
          <p>Driver Assignment</p>
          <p>Vehicle / Plate</p>
          <p>Status</p>
          <p>Action</p>
        </div>

        {trips.map((trip) => (
          <div key={trip.id} className="grid grid-cols-10 py-3 border-b min-w-[1300px] items-center">
            <p>{trip.trip_code}</p>
            <p>{trip.trip_date}</p>
            <p>{trip.area}</p>
            <p>{trip.pickup_time}</p>
            <p>{trip.dropoff_time}</p>
            <p>{trip.passenger_count}</p>

            <select
              value={drivers.find((driver) => driver.full_name === trip.driver_name)?.id || ""}
              onChange={(e) => assignDriverWithVehicle(trip.id, e.target.value)}
              className="border p-2 rounded-lg"
            >
              <option value="">Assign Driver</option>
              {drivers.map((driver) => (
                <option key={driver.id} value={driver.id}>
                  {driver.driver_code || "DRV"} - {driver.full_name}
                </option>
              ))}
            </select>

            <p>
              {trip.vehicle_name && trip.vehicle_registration
                ? `${trip.vehicle_name} - ${trip.vehicle_registration}`
                : "No vehicle assigned"}
            </p>

            <p>{trip.status}</p>

            <div className="flex gap-2">
              <button onClick={() => confirmTrip(trip.id)} className="bg-green-600 text-white px-4 py-2 rounded-lg font-bold">
                Confirm
              </button>

              <button onClick={() => setEditingTrip(trip)} className="bg-[#061B33] text-white px-4 py-2 rounded-lg font-bold">
                Edit
              </button>

              <button onClick={() => cancelTrip(trip.id)} className="bg-red-600 text-white px-4 py-2 rounded-lg font-bold">
                Cancel
              </button>
            </div>
          </div>
        ))}

        {trips.length === 0 && (
          <p className="text-gray-500 mt-4">
            No trips saved yet. Go to Transport Calendar and generate trips.
          </p>
        )}
      </div>
    </main>
  );
}
