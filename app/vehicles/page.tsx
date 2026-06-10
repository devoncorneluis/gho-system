"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import AdminLayout from "../../components/AdminLayout";

const PLATFORM_ID = "713c411b-847e-4379-8e38-c142e06ff5fd";

type Vehicle = {
  id?: string;
  vehicle_name: string;
  registration_number: string;
  vehicle_type: string | null;
  vehicle_colour: string | null;
  passenger_limit: string | null;
  vehicle_photo: string | null;
  status: string | null;
};

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [name, setName] = useState("");
  const [registration, setRegistration] = useState("");
  const [type, setType] = useState("Suzuki 7 Seater");
  const [colour, setColour] = useState("");
  const [passengerLimit, setPassengerLimit] = useState("");
  const [vehiclePhoto, setVehiclePhoto] = useState("");
  const [uploading, setUploading] = useState(false);

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

  async function uploadVehiclePhoto(file: File) {
    setUploading(true);

    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random()
      .toString(36)
      .substring(2)}.${fileExt}`;

    const filePath = `${PLATFORM_ID}/${fileName}`;

    const { error } = await supabase.storage
      .from("vehicle-photos")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      alert(error.message);
      setUploading(false);
      return;
    }

    const { data } = supabase.storage
      .from("vehicle-photos")
      .getPublicUrl(filePath);

    setVehiclePhoto(data.publicUrl);
    setUploading(false);
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
      vehicle_colour: colour,
      passenger_limit: passengerLimit,
      vehicle_photo: vehiclePhoto,
      status: "Available",
    });

    if (error) {
      alert(error.message);
      return;
    }

    setName("");
    setRegistration("");
    setType("Suzuki 7 Seater");
    setColour("");
    setPassengerLimit("");
    setVehiclePhoto("");

    loadVehicles();
  }

  useEffect(() => {
    loadVehicles();
  }, []);

  return (
    <AdminLayout>
      <main className="min-h-screen bg-gray-100 p-6">
        <h1 className="text-4xl font-bold text-[#061B33]">Vehicles</h1>

        <p className="text-gray-600 mt-2">
          Add and manage GHO fleet vehicles.
        </p>

        <div className="bg-white rounded-xl shadow p-6 mt-6">
          <h2 className="text-xl font-bold mb-4">Add Vehicle</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="border p-3 rounded-lg"
              placeholder="Vehicle Name e.g. Suzuki 7 Seater"
            />

            <input
              value={registration}
              onChange={(e) => setRegistration(e.target.value)}
              className="border p-3 rounded-lg"
              placeholder="Registration Number e.g. CY 234578"
            />

            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="border p-3 rounded-lg"
            >
              <option>Sedan</option>
              <option>Suzuki 7 Seater</option>
              <option>Suzuki Ertiga</option>
              <option>Toyota Quantum</option>
              <option>Minibus</option>
            </select>

            <input
              value={colour}
              onChange={(e) => setColour(e.target.value)}
              className="border p-3 rounded-lg"
              placeholder="Vehicle Colour e.g. Black"
            />

            <input
              value={passengerLimit}
              onChange={(e) => setPassengerLimit(e.target.value)}
              className="border p-3 rounded-lg"
              placeholder="Passenger Limit"
            />

            <div className="border rounded-lg p-3">
              <label className="block font-bold text-[#061B33] mb-2">
                Vehicle Photo
              </label>

              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) uploadVehiclePhoto(file);
                }}
              />

              {uploading && (
                <p className="text-orange-500 font-bold mt-2">
                  Uploading photo...
                </p>
              )}

              {vehiclePhoto && (
                <img
                  src={vehiclePhoto}
                  alt="Vehicle preview"
                  className="mt-3 w-full h-40 object-cover rounded-lg border"
                />
              )}
            </div>
          </div>

          <button
            onClick={saveVehicle}
            className="mt-6 bg-orange-500 text-white px-6 py-3 rounded-lg font-bold"
          >
            Save Vehicle
          </button>
        </div>

        <div className="bg-white rounded-xl shadow p-6 mt-6">
          <h2 className="text-xl font-bold mb-4">Vehicle List</h2>

          {vehicles.length === 0 && (
            <p className="text-gray-500">No vehicles found.</p>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {vehicles.map((vehicle) => (
              <div
                key={vehicle.id}
                className="border rounded-2xl overflow-hidden bg-white shadow-sm"
              >
                <div className="h-44 bg-gray-200">
                  {vehicle.vehicle_photo ? (
                    <img
                      src={vehicle.vehicle_photo}
                      alt={vehicle.vehicle_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-5xl">
                      🚐
                    </div>
                  )}
                </div>

                <div className="p-5 space-y-2">
                  <p className="text-xl font-bold text-[#061B33]">
                    🚐 {vehicle.vehicle_name}
                  </p>

                  <p>
                    🎨 <strong>Colour:</strong>{" "}
                    {vehicle.vehicle_colour || "Not set"}
                  </p>

                  <p>
                    🔢 <strong>Registration:</strong>{" "}
                    {vehicle.registration_number}
                  </p>

                  <p>
                    👥 <strong>Passenger Limit:</strong>{" "}
                    {vehicle.passenger_limit || "Not set"}
                  </p>

                  <p>
                    {vehicle.status === "Available" ? "🟢" : "🔴"}{" "}
                    <strong>Status:</strong> {vehicle.status || "Unknown"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </AdminLayout>
  );
}
