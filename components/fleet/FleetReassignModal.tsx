"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

type Driver = {
  id: string;
  full_name: string | null;
};

type Vehicle = {
  id: string;
  vehicle_name: string | null;
};

type Props = {
  open: boolean;
  trip?: {
    id: string;
  } | null;
  onClose: () => void;
  onSuccess?: () => Promise<void>;
};

export default function FleetReassignModal({
  open,
  trip,
  onClose,
  onSuccess,
}: Props) {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);

  const [selectedDriver, setSelectedDriver] = useState("");
  const [selectedVehicle, setSelectedVehicle] = useState("");

  useEffect(() => {
    if (!open) return;

    async function loadData() {
      const { data: driverData } = await supabase
        .from("drivers")
        .select("id, full_name")
        .eq("status", "Available")
        .order("full_name");

      setDrivers(driverData ?? []);

      const { data: vehicleData } = await supabase
        .from("vehicles")
        .select("id, vehicle_name")
        .eq("availability_status", "Available")
        .order("vehicle_name");

      setVehicles(vehicleData ?? []);
    }

    loadData();
  }, [open]);

  if (!open) return null;

  async function handleReassign() {
    if (!trip) {
      alert("No trip selected.");
      return;
    }

    if (!selectedDriver || !selectedVehicle) {
      alert("Select both a driver and vehicle.");
      return;
    }

    // Load current trip BEFORE updating it
    const { data: currentTrip, error: tripError } = await supabase
      .from("trips")
      .select(`
        trip_code,
        platform_id,
        driver_id,
        driver_name,
        vehicle_id,
        vehicle_name
      `)
      .eq("id", trip.id)
      .single();

    if (tripError || !currentTrip) {
      console.error(tripError);
      alert("Unable to load current trip.");
      return;
    }

    const driver = drivers.find((d) => d.id === selectedDriver);
    const vehicle = vehicles.find((v) => v.id === selectedVehicle);

    const { error } = await supabase
      .from("trips")
      .update({
        driver_id: selectedDriver,
        vehicle_id: selectedVehicle,
        driver_name: driver?.full_name ?? null,
        vehicle_name: vehicle?.vehicle_name ?? null,
      })
      .eq("id", trip.id);

    if (error) {
      console.error(error);
      alert("Unable to reassign trip.");
      return;
    }

    const { error: logError } = await supabase
      .from("trip_reassignment_logs")
      .insert({
        trip_id: trip.id,
        trip_code: currentTrip.trip_code,

        previous_driver_id: currentTrip.driver_id,
        previous_driver_name: currentTrip.driver_name,

        new_driver_id: selectedDriver,
        new_driver_name: driver?.full_name ?? null,

        previous_vehicle_id: currentTrip.vehicle_id,
        previous_vehicle_name: currentTrip.vehicle_name,

        new_vehicle_id: selectedVehicle,
        new_vehicle_name: vehicle?.vehicle_name ?? null,

        platform_id: currentTrip.platform_id,

        reason: "Fleet Command Centre reassignment",
      });

    if (logError) {
      console.error(logError);
    }

    alert("Trip reassigned successfully.");

    await onSuccess?.();

    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
        <h2 className="mb-6 text-2xl font-bold text-[#0B3A82]">
          Reassign Trip
        </h2>

        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">
              Driver
            </label>

            <select
              value={selectedDriver}
              onChange={(e) => setSelectedDriver(e.target.value)}
              className="w-full rounded border p-2"
            >
              <option value="">Select Driver</option>

              {drivers.map((driver) => (
                <option key={driver.id} value={driver.id}>
                  {driver.full_name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Vehicle
            </label>

            <select
              value={selectedVehicle}
              onChange={(e) => setSelectedVehicle(e.target.value)}
              className="w-full rounded border p-2"
            >
              <option value="">Select Vehicle</option>

              {vehicles.map((vehicle) => (
                <option key={vehicle.id} value={vehicle.id}>
                  {vehicle.vehicle_name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-lg bg-gray-200 px-4 py-2 hover:bg-gray-300"
          >
            Cancel
          </button>

          <button
            onClick={handleReassign}
            disabled={!selectedDriver || !selectedVehicle}
            className="rounded-lg bg-[#0B3A82] px-4 py-2 text-white disabled:cursor-not-allowed disabled:bg-gray-400"
          >
            Reassign
          </button>
        </div>
      </div>
    </div>
  );
}