"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

const PLATFORM_ID = "713c411b-847e-4379-8e38-c142e06ff5fd";

type Vehicle = {
  id?: string;
  vehicle_name: string;
  registration_number: string;
  vehicle_type: string | null;
  passenger_limit: string | null;
  status: string | null;
};

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [name, setName] = useState("");
  const [registration, setRegistration] = useState("");
  const [type, setType] = useState("Suzuki Ertiga");
  const [passengerLimit, setPassengerLimit] = useState("");

  async function loadVehicles() {
    const { data, error } = await supabase
      .from("vehicles")
      .select("*")
      .eq("platform_id", PLATFORM_ID)
      .order("created_at", { ascending: false });

    if (error) {
      alert(error.message);
      return;
    }

    setVehicles(data || []);
  }

  async function saveVehicle() {
    if (!name || !registration) {
      alert("Please enter Vehicle Name and Registration Number");
      return;
    }

    const { error } = await supabase.from("vehicles").insert({
      platform_id: PLATFORM_ID,
      vehicle_name: name,
      registration_number: registration,
      vehicle_type: type,
      passenger_limit: passengerLimit,
      status: "Available",
    });

    if (error) {
      alert(error.message);
      return;
    }

    setName("");
    setRegistration("");
    setType("Suzuki Ertiga");
    setPassengerLimit("");

    loadVehicles();
  }

  useEffect(() => {
    loadVehicles();
  }, []);

  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-4xl font-bold text-[#061B33]">Vehicles</h1>

      <p className="text-gray-600 mt-2">
        Add and manage Sedans, Suzuki Ertigas, and Toyota Quantums.
      </p>

      <div className="bg-white rounded-xl shadow p-6 mt-6">
        <h2 className="text-xl font-bold mb-4">Add Vehicle</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input value={name} onChange={(e) => setName(e.target.value)} className="border p-3 rounded-lg" placeholder="Vehicle Name" />
          <input value={registration} onChange={(e) => setRegistration(e.target.value)} className="border p-3 rounded-lg" placeholder="Registration Number" />

          <select value={type} onChange={(e) => setType(e.target.value)} className="border p-3 rounded-lg">
            <option>Sedan</option>
            <option>Suzuki Ertiga</option>
            <option>Toyota Quantum</option>
          </select>

          <input value={passengerLimit} onChange={(e) => setPassengerLimit(e.target.value)} className="border p-3 rounded-lg" placeholder="Passenger Limit" />
        </div>

        <button onClick={saveVehicle} className="mt-6 bg-orange-500 text-white px-6 py-3 rounded-lg font-bold">
          Save Vehicle
        </button>
      </div>

      <div className="bg-white rounded-xl shadow p-6 mt-6">
        <h2 className="text-xl font-bold mb-4">Vehicle List</h2>

        <div className="grid grid-cols-5 font-bold border-b pb-2">
          <p>Vehicle</p>
          <p>Registration</p>
          <p>Type</p>
          <p>Passenger Limit</p>
          <p>Status</p>
        </div>

        {vehicles.map((vehicle) => (
          <div key={vehicle.id} className="grid grid-cols-5 py-3 border-b">
            <p>{vehicle.vehicle_name}</p>
            <p>{vehicle.registration_number}</p>
            <p>{vehicle.vehicle_type}</p>
            <p>{vehicle.passenger_limit}</p>
            <p>{vehicle.status}</p>
          </div>
        ))}
      </div>
    </main>
  );
}
