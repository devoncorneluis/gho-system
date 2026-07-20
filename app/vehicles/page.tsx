"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { getUserPlatform } from "../../lib/getUserPlatform";
import AdminLayout from "../../components/AdminLayout";



type Vehicle = {
  id?: string;
  vehicle_name: string;
  registration_number: string;
  vehicle_type: string | null;
  vehicle_colour: string | null;
  passenger_limit: string | null;
  vehicle_photo: string | null;
  status: string | null;
  assigned_driver: string | null;   // ← ADD THIS
};
type Driver = {
  id: string;
  full_name: string;
};
export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
const [assignedDriver, setAssignedDriver] = useState("");
  const [name, setName] = useState("");
  const [registration, setRegistration] = useState("");
  const [type, setType] = useState("Suzuki 7 Seater");
  const [colour, setColour] = useState("");
  const [passengerLimit, setPassengerLimit] = useState("");
  const [vehiclePhoto, setVehiclePhoto] = useState("");
  const [uploading, setUploading] = useState(false);
  const [platformId, setPlatformId] = useState<string | null>(null);
const assignedVehicles = vehicles.filter(v => v.assigned_driver).length;
const unassignedVehicles = vehicles.filter(v => !v.assigned_driver).length;
const availableVehicles = vehicles.filter(v => v.status === "Available").length;
const maintenanceVehicles = vehicles.filter(v => v.status === "Maintenance").length;
  async function loadVehicles() {
    if (!platformId) return;

    const { data, error } = await supabase
      .from("vehicles")
      .select("*")
      .eq("platform_id", platformId)
      .order("created_at", { ascending: false });

    if (error) {
      alert(error.message);
      return;
    }

    setVehicles(data || []);
  }

async function loadDrivers() {
  if (!platformId) return;

  const { data, error } = await supabase
    .from("drivers")
    .select("id, full_name")
    .eq("platform_id", platformId)
    .order("full_name");

  if (error) {
    alert(error.message);
    return;
  }

  setDrivers(data ?? []);
}



  async function uploadVehiclePhoto(file: File) {
    if (!platformId) {
      alert("Platform not loaded yet.");
      return;
    }

    setUploading(true);

    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random()
      .toString(36)
      .substring(2)}.${fileExt}`;

    const filePath = `${platformId}/${fileName}`;

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
function getDriverName(driverId: string | null) {
  if (!driverId) {
    return "Unassigned";
  }

  const driver = drivers.find((d) => d.id === driverId);

  return driver?.full_name ?? "Unknown Driver";
}
  async function saveVehicle() {
    if (!platformId) {
      alert("Platform not loaded yet.");
      return;
    }

    if (!name || !registration) {
      alert("Please enter Vehicle Name and Registration Number");
      return;
    }


  if (assignedDriver) {
  const { data: existingVehicle, error: existingError } = await supabase
    .from("vehicles")
    .select("vehicle_name")
    .eq("assigned_driver", assignedDriver)
    .maybeSingle();

  if (existingError) {
    alert(existingError.message);
    return;
  }

  if (existingVehicle) {
    alert(
      `This driver is already assigned to ${existingVehicle.vehicle_name}.`
    );
    return;
  }
}
const { error } = await supabase
  .from("vehicles")
  .insert({
    platform_id: platformId,
    vehicle_name: name,
    registration_number: registration,
    vehicle_type: type,
    vehicle_colour: colour,
    passenger_limit: passengerLimit,
    vehicle_photo: vehiclePhoto,
    assigned_driver: assignedDriver || null,
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
setAssignedDriver("");
    loadVehicles();
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

loadVehicles();
loadDrivers();
  }, [platformId]);

  return (
    <AdminLayout>
      <main className="min-h-screen bg-gray-100 p-6">
        <h1 className="text-4xl font-bold text-[#061B33]">Vehicles</h1>

        <p className="text-gray-600 mt-2">
          Add and manage GHO fleet vehicles.
        </p>
<div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">

  <div className="bg-white rounded-xl shadow p-5">
    <p className="text-gray-500">Total Vehicles</p>
    <p className="text-3xl font-black">{vehicles.length}</p>
  </div>

  <div className="bg-white rounded-xl shadow p-5">
    <p className="text-gray-500">Assigned</p>
    <p className="text-3xl font-black text-blue-600">
      {assignedVehicles}
    </p>
  </div>

  <div className="bg-white rounded-xl shadow p-5">
    <p className="text-gray-500">Unassigned</p>
    <p className="text-3xl font-black text-orange-600">
      {unassignedVehicles}
    </p>
  </div>

  <div className="bg-white rounded-xl shadow p-5">
    <p className="text-gray-500">Available</p>
    <p className="text-3xl font-black text-green-600">
      {availableVehicles}
    </p>
  </div>

</div>
        <div className="bg-white rounded-xl shadow p-6 mt-6">
          <h2 className="text-xl font-bold mb-4">Add Vehicle</h2>
<div className="mt-4 flex gap-2">

  <button
    className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-bold"
    onClick={() => alert("Edit Vehicle - Next Step")}
  >
    Edit
  </button>

  <button
    className="flex-1 bg-red-600 text-white py-2 rounded-lg font-bold"
    onClick={() => alert("Delete Vehicle - Next Step")}
  >
    Delete
  </button>

</div>
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
            <select
  value={assignedDriver}
  onChange={(e) => setAssignedDriver(e.target.value)}
  className="border p-3 rounded-lg"
>
  <option value="">Select Driver</option>

  {drivers.map((driver) => (
    <option key={driver.id} value={driver.id}>
      {driver.full_name}
    </option>
  ))}
</select>

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
  👨‍✈️ <strong>Assigned Driver:</strong>{" "}
  {getDriverName(vehicle.assigned_driver)}
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
