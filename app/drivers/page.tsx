"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import AdminLayout from "../../components/AdminLayout";

const PLATFORM_ID = "713c411b-847e-4379-8e38-c142e06ff5fd";

type Vehicle = {
  id: string;
  vehicle_code: string | null;
  vehicle_name: string;
  registration_number: string;
};

type Driver = {
  id?: string;
  driver_no: string;
  driver_code: string | null;
  full_name: string;
  phone: string | null;
  email: string | null;
  license_number: string | null;
  pdp_number: string | null;
  driver_photo: string | null;
  assigned_vehicle: string | null;
  assigned_vehicle_id: string | null;
  status: string | null;
  availability_status: string | null;
};

export default function DriversPage() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null);

  const [driverNo, setDriverNo] = useState("");
  const [driverCode, setDriverCode] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [pdpNumber, setPdpNumber] = useState("");
  const [assignedVehicleId, setAssignedVehicleId] = useState("");

  async function loadDrivers() {
    const { data, error } = await supabase
      .from("drivers")
      .select("*")
      .eq("platform_id", PLATFORM_ID)
      .order("created_at", { ascending: false });

    if (error) {
      alert(error.message);
      return;
    }

    setDrivers(data || []);
  }

  async function loadVehicles() {
    const { data, error } = await supabase
      .from("vehicles")
      .select("id, vehicle_code, vehicle_name, registration_number")
      .eq("platform_id", PLATFORM_ID)
      .order("vehicle_name");

    if (error) {
      alert(error.message);
      return;
    }

    setVehicles(data || []);
  }

  function vehicleLabel(vehicleId: string | null) {
    const vehicle = vehicles.find((item) => item.id === vehicleId);
    if (!vehicle) return "No vehicle assigned";
    return `${vehicle.vehicle_code || "VEH"} - ${vehicle.vehicle_name} - ${vehicle.registration_number}`;
  }

  async function saveDriver() {
    if (!driverNo || !name || !assignedVehicleId) {
      alert("Driver Number, Full Name, and Vehicle are required");
      return;
    }

    const selectedVehicle = vehicles.find((vehicle) => vehicle.id === assignedVehicleId);

    const { error } = await supabase.from("drivers").insert({
      platform_id: PLATFORM_ID,
      driver_no: driverNo,
      driver_code: driverCode,
      full_name: name,
      phone,
      email,
      license_number: licenseNumber,
      pdp_number: pdpNumber,
      assigned_vehicle_id: assignedVehicleId,
      assigned_vehicle: selectedVehicle
        ? `${selectedVehicle.vehicle_code || "VEH"} - ${selectedVehicle.vehicle_name} - ${selectedVehicle.registration_number}`
        : null,
      status: "Available",
      availability_status: "Available",
    });

    if (error) {
      alert(error.message);
      return;
    }

    setDriverNo("");
    setDriverCode("");
    setName("");
    setPhone("");
    setEmail("");
    setLicenseNumber("");
    setPdpNumber("");
    setAssignedVehicleId("");

    loadDrivers();
  }

  async function saveDriverChanges() {
    if (!editingDriver) return;

    const selectedVehicle = vehicles.find(
      (vehicle) => vehicle.id === editingDriver.assigned_vehicle_id
    );

    const { error } = await supabase
      .from("drivers")
      .update({
        driver_no: editingDriver.driver_no,
        driver_code: editingDriver.driver_code,
        full_name: editingDriver.full_name,
        phone: editingDriver.phone,
        email: editingDriver.email,
        license_number: editingDriver.license_number,
        pdp_number: editingDriver.pdp_number,
        assigned_vehicle_id: editingDriver.assigned_vehicle_id,
        assigned_vehicle: selectedVehicle
          ? `${selectedVehicle.vehicle_code || "VEH"} - ${selectedVehicle.vehicle_name} - ${selectedVehicle.registration_number}`
          : null,
        status: editingDriver.status,
        availability_status: editingDriver.availability_status,
      })
      .eq("id", editingDriver.id);

    if (error) {
      alert(error.message);
      return;
    }

    setEditingDriver(null);
    loadDrivers();
  }

  useEffect(() => {
    loadDrivers();
    loadVehicles();
  }, []);

  return (
    <AdminLayout>
      <main className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-4xl font-bold text-[#061B33]">Drivers</h1>

      <p className="text-gray-600 mt-2">
        Add, edit, and assign vehicles to drivers.
      </p>

      {editingDriver && (
        <div className="bg-white rounded-xl shadow p-6 mt-6 border-2 border-orange-500">
          <h2 className="text-2xl font-bold text-[#061B33] mb-4">
            Edit Driver: {editingDriver.full_name}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input value={editingDriver.driver_no || ""} onChange={(e) => setEditingDriver({ ...editingDriver, driver_no: e.target.value })} className="border p-3 rounded-lg" placeholder="Driver Number" />
            <input value={editingDriver.driver_code || ""} onChange={(e) => setEditingDriver({ ...editingDriver, driver_code: e.target.value })} className="border p-3 rounded-lg" placeholder="Driver Code" />
            <input value={editingDriver.full_name || ""} onChange={(e) => setEditingDriver({ ...editingDriver, full_name: e.target.value })} className="border p-3 rounded-lg" placeholder="Full Name" />
            <input value={editingDriver.phone || ""} onChange={(e) => setEditingDriver({ ...editingDriver, phone: e.target.value })} className="border p-3 rounded-lg" placeholder="Phone Number" />
            <input value={editingDriver.email || ""} onChange={(e) => setEditingDriver({ ...editingDriver, email: e.target.value })} className="border p-3 rounded-lg" placeholder="Email Address" />
            <input value={editingDriver.license_number || ""} onChange={(e) => setEditingDriver({ ...editingDriver, license_number: e.target.value })} className="border p-3 rounded-lg" placeholder="License Number" />
            <input value={editingDriver.pdp_number || ""} onChange={(e) => setEditingDriver({ ...editingDriver, pdp_number: e.target.value })} className="border p-3 rounded-lg" placeholder="PDP Number" />

            <select
              value={editingDriver.assigned_vehicle_id || ""}
              onChange={(e) => setEditingDriver({ ...editingDriver, assigned_vehicle_id: e.target.value })}
              className="border p-3 rounded-lg"
            >
              <option value="">Select Vehicle</option>
              {vehicles.map((vehicle) => (
                <option key={vehicle.id} value={vehicle.id}>
                  {vehicle.vehicle_code || "VEH"} - {vehicle.vehicle_name} - {vehicle.registration_number}
                </option>
              ))}
            </select>

            <select value={editingDriver.status || ""} onChange={(e) => setEditingDriver({ ...editingDriver, status: e.target.value })} className="border p-3 rounded-lg">
              <option>Available</option>
              <option>Unavailable</option>
              <option>Suspended</option>
              <option>Pending Approval</option>
            </select>

            <select value={editingDriver.availability_status || ""} onChange={(e) => setEditingDriver({ ...editingDriver, availability_status: e.target.value })} className="border p-3 rounded-lg">
              <option>Available</option>
              <option>On Trip</option>
              <option>Off Duty</option>
              <option>On Leave</option>
              <option>Suspended</option>
            </select>
          </div>

          <div className="flex gap-3 mt-6">
            <button onClick={saveDriverChanges} className="bg-green-600 text-white px-5 py-3 rounded-lg font-bold">
              Save Changes
            </button>

            <button onClick={() => setEditingDriver(null)} className="bg-gray-500 text-white px-5 py-3 rounded-lg font-bold">
              Close
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow p-6 mt-6">
        <h2 className="text-xl font-bold mb-4">Add Driver</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input value={driverNo} onChange={(e) => setDriverNo(e.target.value)} className="border p-3 rounded-lg" placeholder="Driver Number" />
          <input value={driverCode} onChange={(e) => setDriverCode(e.target.value)} className="border p-3 rounded-lg" placeholder="Driver Code e.g. DRV001" />
          <input value={name} onChange={(e) => setName(e.target.value)} className="border p-3 rounded-lg" placeholder="Full Name" />
          <input value={phone} onChange={(e) => setPhone(e.target.value)} className="border p-3 rounded-lg" placeholder="Phone Number" />
          <input value={email} onChange={(e) => setEmail(e.target.value)} className="border p-3 rounded-lg" placeholder="Email Address" />
          <input value={licenseNumber} onChange={(e) => setLicenseNumber(e.target.value)} className="border p-3 rounded-lg" placeholder="License Number" />
          <input value={pdpNumber} onChange={(e) => setPdpNumber(e.target.value)} className="border p-3 rounded-lg" placeholder="PDP Number" />

          <select
            value={assignedVehicleId}
            onChange={(e) => setAssignedVehicleId(e.target.value)}
            className="border p-3 rounded-lg"
          >
            <option value="">Select Vehicle</option>
            {vehicles.map((vehicle) => (
              <option key={vehicle.id} value={vehicle.id}>
                {vehicle.vehicle_code || "VEH"} - {vehicle.vehicle_name} - {vehicle.registration_number}
              </option>
            ))}
          </select>
        </div>

        <button onClick={saveDriver} className="mt-6 bg-orange-500 text-white px-6 py-3 rounded-lg font-bold">
          Save Driver
        </button>
      </div>

      <div className="bg-white rounded-xl shadow p-6 mt-6">
        <h2 className="text-xl font-bold mb-4">Driver List</h2>

        {drivers.length === 0 ? (
          <p className="text-gray-500">No drivers available yet.</p>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {drivers.map((driver) => (
              <div key={driver.id ?? driver.driver_no} className="border rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow bg-slate-50">
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  <div className="w-28 h-28 rounded-3xl overflow-hidden bg-gray-200 flex items-center justify-center">
                    {driver.driver_photo ? (
                      <img
                        src={driver.driver_photo}
                        alt={driver.full_name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-4xl">📷</span>
                    )}
                  </div>

                  <div className="flex-1">
                    <p className="text-2xl font-bold text-[#061B33]">{driver.full_name}</p>
                    <p className="text-gray-600">{driver.driver_code || driver.driver_no}</p>
                    <p className="text-gray-500 mt-2">{vehicleLabel(driver.assigned_vehicle_id)}</p>
                  </div>

                  <div className="flex flex-col gap-2 text-right">
                    <button
                      onClick={() => setEditingDriver(driver)}
                      className="self-end bg-[#061B33] text-white px-5 py-2 rounded-full font-bold"
                    >
                      Edit
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-5 text-sm text-gray-700">
                  <div className="rounded-2xl bg-white p-4 border">
                    <p className="text-sm text-gray-500">Vehicle</p>
                    <p className="font-semibold">{driver.assigned_vehicle || vehicleLabel(driver.assigned_vehicle_id)}</p>
                  </div>

                  <div className="rounded-2xl bg-white p-4 border">
                    <p className="text-sm text-gray-500">Status</p>
                    <p className="font-semibold">{driver.status || "Unknown"}</p>
                  </div>

                  <div className="rounded-2xl bg-white p-4 border">
                    <p className="text-sm text-gray-500">Availability</p>
                    <p className="font-semibold">{driver.availability_status || "Unknown"}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      </main>
    </AdminLayout>
  );
}
