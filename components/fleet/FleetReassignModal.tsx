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
  onClose: () => void;
};

export default function FleetReassignModal({
  open,
  onClose,
}: Props) {
  if (!open) return null;
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

        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="rounded-lg bg-gray-200 px-4 py-2 hover:bg-gray-300"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}