"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { getUserPlatform } from "../../lib/getUserPlatform";
import AdminLayout from "../../components/AdminLayout";
import {
  startTrip,
  completeTrip,
  getCurrentTripForDriver,
  getTripPassengers,
} from "../../lib/dispatchService";


type Vehicle = {
  id: string;
  vehicle_code: string | null;
  vehicle_name: string;
  registration_number: string;
  vehicle_type: string | null;
  passenger_limit: number | null;
  status: string | null;
  vehicle_colour: string | null;
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
photo_url: string | null;
  assigned_vehicle: string | null;
  assigned_vehicle_id: string | null;
  status: string | null;
  availability_status: string | null;
};

type ManifestPassenger = {
  id: string;
  full_name: string | null;
  phone: string | null;
  pickup_address: string | null;
};

export default function DriversPage() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null);
const [manifestPassengers, setManifestPassengers] = useState<ManifestPassenger[]>([]);
const [manifestTripCode, setManifestTripCode] = useState("");
const [showManifest, setShowManifest] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [pdpNumber, setPdpNumber] = useState("");
  const [vehicleName, setVehicleName] = useState("");
const [registrationNumber, setRegistrationNumber] = useState("");
const [vehicleType, setVehicleType] = useState("");
const [vehicleColour, setVehicleColour] = useState("");
const [passengerLimit, setPassengerLimit] = useState("");
  const [driverPhoto, setDriverPhoto] = useState("");
  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [platformId, setPlatformId] = useState<string | null>(null);
const [watchId, setWatchId] = useState<number | null>(null);

  const loadDrivers = useCallback(async () => {
    if (!platformId) return;

    const { data, error } = await supabase
      .from("drivers")
      .select("*")
      .eq("platform_id", platformId)
      .order("created_at", { ascending: false });

    if (error) {
      alert(error.message);
      return;
    }

    setDrivers(data || []);
  }, [platformId]);

  const loadVehicles = useCallback(async () => {
    if (!platformId) return;

    const { data, error } = await supabase
      .from("vehicles")
.select(`
  id,
  vehicle_code,
  vehicle_name,
  registration_number,
  vehicle_type,
  passenger_limit,
  status,
  vehicle_colour
`)
      .eq("platform_id", platformId)
      .order("vehicle_name");

    if (error) {
      alert(error.message);
      return;
    }

    setVehicles(data || []);
  }, [platformId]);
function selectedVehicleInfo(vehicleId: string | null) {
  return vehicles.find((vehicle) => vehicle.id === vehicleId) || null;
}
async function uploadDriverPhoto(file: File): Promise<string | null> {
  setUploading(true);

  const fileExt = file.name.split(".").pop();
  const fileName = `${Date.now()}-${Math.random()
    .toString(36)
    .substring(2)}.${fileExt}`;

  const filePath = `${platformId}/${fileName}`;

const { error: uploadError } = await supabase.storage
    .from("driver-photos")
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (uploadError) {
    alert(uploadError.message);
    setUploading(false);
    return null;
  }

const { data, error: signedUrlError } = await supabase.storage
  .from("driver-photos")
  .createSignedUrl(filePath, 60 * 60 * 24 * 365);

if (signedUrlError) {
  alert(signedUrlError.message);
  setUploading(false);
  return null;
}

setUploading(false);

return data.signedUrl;
}

  async function saveVehicle() {
    if (!platformId) {
      alert("Platform not loaded yet.");
      return null;
    }

    const nextVehicleCode = `VEH-${String(vehicles.length + 1).padStart(4, "0")}`;
    const { data, error } = await supabase
      .from("vehicles")
      .insert({
        platform_id: platformId,
        vehicle_code: nextVehicleCode,
        vehicle_name: vehicleName,
        registration_number: registrationNumber,
        vehicle_type: vehicleType,
        vehicle_colour: vehicleColour,
        passenger_limit: Number(passengerLimit),
        status: "Available",
        availability_status: "Available",
      })
      .select()
      .single();

    if (error) {
      alert(error.message);
      return null;
    }

    return data;
  }

  async function saveDriver() {
  if (!platformId) {
    alert("Platform not loaded yet.");
    return;
  }

  if (!name || !email) {
    alert("Driver Name and Email Address are required");
    return;
  }

  const newVehicle = await saveVehicle();

  if (!newVehicle) {
    return;
  }

  let photoUrl = driverPhoto;

  if (selectedPhoto) {
    const uploaded = await uploadDriverPhoto(selectedPhoto);

    if (!uploaded) {
      await supabase
        .from("vehicles")
        .delete()
        .eq("id", newVehicle.id);

      return;
    }

    photoUrl = uploaded;
  }

  const nextDriverCode = `DRV-${String(drivers.length + 1).padStart(4, "0")}`;

  const { data: newDriver, error } = await supabase
    .from("drivers")
    .insert({
      platform_id: platformId,
      driver_code: nextDriverCode,
      full_name: name,
      phone,
      email,
      license_number: licenseNumber,
      pdp_number: pdpNumber,
      photo_url: photoUrl,
      assigned_vehicle_id: newVehicle.id,
      assigned_vehicle: `${newVehicle.vehicle_name} - ${newVehicle.registration_number}`,
      status: "Available",
      availability_status: "Available",
    })
    .select()
    .single();

  if (error || !newDriver) {
    await supabase
      .from("vehicles")
      .delete()
      .eq("id", newVehicle.id);

    console.error("DRIVER SAVE ERROR", error);
    alert(error?.message || "Driver could not be saved.");
    return;
  }

  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.access_token) {
      alert(
        "Driver and assigned vehicle saved successfully, but your admin session could not be verified. Please log in again."
      );
      return;
    }

    const response = await fetch("/api/create-driver-user", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({
        email,
        full_name: name,
        platform_id: platformId,
      }),
    });

    const result = await response.json();
console.log("DRIVER INVITATION HTTP STATUS:", response.status);
console.log("DRIVER INVITATION RESPONSE:", JSON.stringify(result, null, 2));
    if (!response.ok) {
console.error("Driver invitation failed:", {
  status: response.status,
  statusText: response.statusText,
  result,
});

alert(
  `Driver invitation failed.\n\nHTTP ${response.status}\n\n${
    result.error || JSON.stringify(result)
  }`
);

      return;
    }

    alert(
      `Driver and assigned vehicle saved successfully.\n\nDriver invitation sent to ${email}.`
    );
  } catch (err) {
    console.error("Driver login creation failed:", err);

    alert(
      `Driver and assigned vehicle saved successfully, but the login invitation could not be sent.\n\n${
        err instanceof Error ? err.message : "Unknown error."
      }`
    );

    return;
  }
  setName("");
  setPhone("");
  setEmail("");
  setLicenseNumber("");
  setPdpNumber("");

  setVehicleName("");
  setRegistrationNumber("");
  setVehicleType("");
  setVehicleColour("");
  setPassengerLimit("");

  setDriverPhoto("");
  setSelectedPhoto(null);

  await loadDrivers();
  await loadVehicles();

  alert("Driver and assigned vehicle saved successfully.");
}

  async function saveDriverChanges() {
    if (!platformId) {
      alert("Platform not loaded yet.");
      return;
    }

    if (!editingDriver) return;

    const previousDriver = drivers.find(
      (driver) => driver.id === editingDriver.id
    );

    const previousVehicleId = previousDriver?.assigned_vehicle_id ?? null;

    const selectedVehicle = vehicles.find(
      (vehicle) => vehicle.id === editingDriver.assigned_vehicle_id
    );

    const selectedVehicleId = editingDriver.assigned_vehicle_id || null;

    let photoUrl = editingDriver.photo_url;

if (selectedPhoto) {
  const uploaded = await uploadDriverPhoto(selectedPhoto);

  if (!uploaded) {
    return;
  }

  photoUrl = uploaded;
}

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
photo_url: photoUrl,
        assigned_vehicle_id: editingDriver.assigned_vehicle_id,
        assigned_vehicle: selectedVehicle
          ? `${selectedVehicle.vehicle_code || "VEH"} - ${selectedVehicle.vehicle_name} - ${selectedVehicle.registration_number}`
          : null,
        status: editingDriver.status,
        availability_status: editingDriver.availability_status,
      })
      .eq("id", editingDriver.id)
      .eq("platform_id", platformId);

    if (error) {
      alert(error.message);
      return;
    }

    if (previousVehicleId && previousVehicleId !== selectedVehicleId) {
      const { error: previousVehicleError } = await supabase
        .from("vehicles")
        .update({
          status: "Available",
          availability_status: "Available",
        })
        .eq("platform_id", platformId)
        .eq("id", previousVehicleId);

      if (previousVehicleError) {
        alert(previousVehicleError.message);
        return;
      }
    }

    if (selectedVehicleId && previousVehicleId !== selectedVehicleId) {
      const { error: selectedVehicleError } = await supabase
        .from("vehicles")
        .update({
          status: "Assigned",
          availability_status: "Assigned",
        })
        .eq("platform_id", platformId)
        .eq("id", selectedVehicleId);

      if (selectedVehicleError) {
        alert(selectedVehicleError.message);
        return;
      }
    }

    setSelectedPhoto(null);
    setEditingDriver(null);

    await loadDrivers();
    await loadVehicles();

    alert("Driver and vehicle assignment updated successfully.");
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

    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadDrivers();
    loadVehicles();
  }, [loadDrivers, loadVehicles, platformId]);

  return (
    <AdminLayout>
      <main className="min-h-screen bg-gray-100 p-6">
<h1 className="text-4xl font-bold text-[#061B33]">
  Driver Fleet
</h1>

<p className="text-gray-600 mt-2">
  Manage drivers and their assigned vehicles from one place.
</p>

        {editingDriver && (
          <div className="bg-white rounded-xl shadow p-6 mt-6 border-2 border-orange-500">
            <h2 className="text-2xl font-bold text-[#061B33] mb-4">
              Edit Driver: {editingDriver.full_name}
            </h2>
<h3 className="text-lg font-bold text-[#061B33] border-b pb-2 mb-4">
  👤 Driver Information
</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input value={editingDriver.driver_no || ""} onChange={(e) => setEditingDriver({ ...editingDriver, driver_no: e.target.value })} className="border p-3 rounded-lg" placeholder="Driver Number" />
              <input value={editingDriver.driver_code || ""} onChange={(e) => setEditingDriver({ ...editingDriver, driver_code: e.target.value })} className="border p-3 rounded-lg" placeholder="Driver Code" />
              <input value={editingDriver.full_name || ""} onChange={(e) => setEditingDriver({ ...editingDriver, full_name: e.target.value })} className="border p-3 rounded-lg" placeholder="Full Name" />
              <input value={editingDriver.phone || ""} onChange={(e) => setEditingDriver({ ...editingDriver, phone: e.target.value })} className="border p-3 rounded-lg" placeholder="Phone Number" />
              <input value={editingDriver.email || ""} onChange={(e) => setEditingDriver({ ...editingDriver, email: e.target.value })} className="border p-3 rounded-lg" placeholder="Email Address" />
              <input value={editingDriver.license_number || ""} onChange={(e) => setEditingDriver({ ...editingDriver, license_number: e.target.value })} className="border p-3 rounded-lg" placeholder="License Number" />
              <input value={editingDriver.pdp_number || ""} onChange={(e) => setEditingDriver({ ...editingDriver, pdp_number: e.target.value })} className="border p-3 rounded-lg" placeholder="PDP Number" />

              <div className="border rounded-lg p-3">
                <label className="block font-bold text-[#061B33] mb-2">
                  Driver Photo
                </label>

                <input
                  type="file"
                  accept="image/*"
onChange={(e) => {
  const file = e.target.files?.[0];

  if (!file || !editingDriver) return;

  setSelectedPhoto(file);

  const preview = URL.createObjectURL(file);

  setEditingDriver({
    ...editingDriver,
    photo_url: preview,
  });
}}
                />

                {uploading && (
                  <p className="text-orange-500 font-bold mt-2">
                    Uploading photo...
                  </p>
                )}

{editingDriver.photo_url && (
  <Image
    src={editingDriver.photo_url}
    alt={editingDriver.full_name}
    width={128}
    height={128}
    className="mt-3 w-32 h-32 object-cover rounded-2xl border"
  />
                )}
              </div>



{selectedVehicleInfo(editingDriver.assigned_vehicle_id) && (
  <div className="md:col-span-2 rounded-xl border bg-slate-50 p-5">
    <h3 className="text-lg font-bold text-[#061B33] mb-4">
      🚐 Assigned Vehicle
    </h3>

    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">

      <div>
        <p className="text-gray-500 text-sm">Vehicle</p>
        <p className="font-semibold">
{selectedVehicleInfo(editingDriver.assigned_vehicle_id)?.vehicle_name}
        </p>
      </div>

      <div>
        <p className="text-gray-500 text-sm">Registration</p>
        <p className="font-semibold">
          {selectedVehicleInfo(editingDriver.assigned_vehicle_id)?.registration_number}
        </p>
      </div>

      <div>
        <p className="text-gray-500 text-sm">Vehicle Type</p>
        <p className="font-semibold">
          {selectedVehicleInfo(editingDriver.assigned_vehicle_id)?.vehicle_type}
        </p>
      </div>

      <div>
        <p className="text-gray-500 text-sm">Colour</p>
        <p className="font-semibold">
          {selectedVehicleInfo(editingDriver.assigned_vehicle_id)?.vehicle_colour}
        </p>
      </div>

      <div>
        <p className="text-gray-500 text-sm">Passenger Capacity</p>
        <p className="font-semibold">
          {selectedVehicleInfo(editingDriver.assigned_vehicle_id)?.passenger_limit}
        </p>
      </div>

      <div>
        <p className="text-gray-500 text-sm">Status</p>
        <p className="font-semibold">
          {selectedVehicleInfo(editingDriver.assigned_vehicle_id)?.status}
        </p>
      </div>

    </div>
  </div>
)}
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

        <div className="mt-6 space-y-6">
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-2xl font-bold text-[#061B33] mb-6">
              👤 Driver Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input value={name} onChange={(e) => setName(e.target.value)} className="border p-3 rounded-lg" placeholder="Full Name" />
              <input value={phone} onChange={(e) => setPhone(e.target.value)} className="border p-3 rounded-lg" placeholder="Phone Number" />
              <input value={email} onChange={(e) => setEmail(e.target.value)} className="border p-3 rounded-lg" placeholder="Email Address" />
              <input value={licenseNumber} onChange={(e) => setLicenseNumber(e.target.value)} className="border p-3 rounded-lg" placeholder="License Number" />
              <input value={pdpNumber} onChange={(e) => setPdpNumber(e.target.value)} className="border p-3 rounded-lg" placeholder="PDP Number" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-2xl font-bold text-[#061B33] mb-6">
              🚐 Assigned Vehicle
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                value={vehicleName}
                onChange={(e) => setVehicleName(e.target.value)}
                className="border p-3 rounded-lg"
                placeholder="Vehicle Name"
              />

              <input
                value={registrationNumber}
                onChange={(e) => setRegistrationNumber(e.target.value)}
                className="border p-3 rounded-lg"
                placeholder="Registration Number"
              />

              <input
                value={vehicleType}
                onChange={(e) => setVehicleType(e.target.value)}
                className="border p-3 rounded-lg"
                placeholder="Vehicle Type"
              />

              <input
                value={vehicleColour}
                onChange={(e) => setVehicleColour(e.target.value)}
                className="border p-3 rounded-lg"
                placeholder="Vehicle Colour"
              />

              <input
                type="number"
                value={passengerLimit}
                onChange={(e) => setPassengerLimit(e.target.value)}
                className="border p-3 rounded-lg"
                placeholder="Passenger Capacity"
              />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-2xl font-bold text-[#061B33] mb-6">
              📷 Driver Photo
            </h2>

            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];

                if (!file) return;

                setSelectedPhoto(file);

                const preview = URL.createObjectURL(file);

                setDriverPhoto(preview);
              }}
            />

            {driverPhoto && (
              <Image
                src={driverPhoto}
                alt="Driver preview"
                width={128}
                height={128}
                className="mt-3 w-32 h-32 object-cover rounded-2xl border"
              />
            )}
          </div>

<button
  onClick={saveDriver}
  className="bg-orange-500 text-white px-6 py-3 rounded-lg font-bold"
>
  Save Driver Fleet
</button>
        </div>

        <div className="bg-white rounded-xl shadow p-6 mt-6">
          <h2 className="text-xl font-bold mb-4">Driver List</h2>
{drivers.length === 0 ? (
  <p className="text-gray-500">No drivers available yet.</p>
) : (
  <div className="grid grid-cols-1 gap-4">
    {drivers.map((driver) => (
      <div
        key={driver.id ?? driver.driver_no}
        className="border rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow bg-slate-50"
      >
        <div className="flex flex-col md:flex-row md:items-center gap-4">

          <div className="w-28 h-28 rounded-3xl overflow-hidden bg-gray-200 flex items-center justify-center">
            {driver.photo_url ? (
              <Image
                src={driver.photo_url}
                alt={driver.full_name}
                width={112}
                height={112}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-4xl">📷</span>
            )}
          </div>

          <div className="flex-1">
            <h3 className="text-2xl font-bold text-[#061B33]">
              {driver.full_name}
            </h3>

            <p className="text-gray-600 mt-1">
              {driver.driver_code || driver.driver_no}
            </p>

{(() => {
  const assignedVehicle = vehicles.find(
    (vehicle) => vehicle.id === driver.assigned_vehicle_id
  );

  return (
    <div className="mt-2 text-sm">
      <p className="font-bold text-[#061B33]">
        🚐 {assignedVehicle?.vehicle_name || "No Vehicle Assigned"}
      </p>

      {assignedVehicle && (
        <p className="text-gray-500">
          {assignedVehicle.registration_number}
        </p>
      )}
    </div>
  );
})()}
            <div className="mt-3 flex gap-2 flex-wrap">
              <span
                className={`px-3 py-1 rounded-full text-sm font-bold ${
                  driver.status === "On Trip"
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                {driver.status || "Unknown"}
              </span>

              <span
                className={`px-3 py-1 rounded-full text-sm font-bold ${
                  driver.availability_status === "Available"
                    ? "bg-blue-100 text-blue-700"
                    : "bg-orange-100 text-orange-700"
                }`}
              >
                {driver.availability_status || "Unknown"}
              </span>
            </div>
<div className="mt-4 flex flex-wrap justify-end gap-2">

  <button
    onClick={() => setEditingDriver(driver)}
    className="bg-[#061B33] text-white px-4 py-2 rounded-lg font-bold hover:bg-[#0b2b52]"
  >
    ✏️ Edit Driver
  </button>
  <button
  onClick={async () => {
    if (!driver.id) {
      alert("Driver not found.");
      return;
    }

    const confirmed = window.confirm(
      `Delete driver "${driver.full_name}"?\n\nThis cannot be undone.`
    );

    if (!confirmed) {
      return;
    }

    try {
const { count: tripCount, error: tripCountError } = await supabase
  .from("trips")
  .select("id", { count: "exact", head: true })
  .eq("driver_id", driver.id)
  .eq("platform_id", platformId);

if (tripCountError) {
  console.error(tripCountError);
  alert(tripCountError.message);
  return;
}

if ((tripCount ?? 0) > 0) {
  const { error: deactivateError } = await supabase
    .from("drivers")
    .update({
      status: "Unavailable",
      availability_status: "Suspended",
    })
    .eq("id", driver.id)
    .eq("platform_id", platformId);

  if (deactivateError) {
    console.error(deactivateError);
    alert(deactivateError.message);
    return;
  }

  setDrivers((current) =>
    current.map((item) =>
      item.id === driver.id
        ? {
            ...item,
            status: "Unavailable",
            availability_status: "Suspended",
          }
        : item
    )
  );

  alert(
    "This driver has trip history, so GHO kept the driver record and suspended the driver instead."
  );

  return;
}

const { error: driverError } = await supabase
  .from("drivers")
  .delete()
  .eq("id", driver.id)
  .eq("platform_id", platformId);

if (driverError) {
  console.error(driverError);
  alert(driverError.message);
  return;
}

setDrivers((current) =>
  current.filter((item) => item.id !== driver.id)
);

alert("Driver deleted successfully.");
    } catch (error) {
      console.error(error);
      alert("Unable to delete driver.");
    }
  }}
  className="bg-red-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-red-700"
>
  🗑️ Delete Driver
</button>
<button
  onClick={async () => {
    if (!driver.id) {
      alert("Driver not found.");
      return;
    }

    try {
      const trip = await getCurrentTripForDriver(
        supabase,
        driver.id,
        platformId
      );

      if (!trip) {
        alert("No active trip assigned.");
        return;
      }

      if (!trip.destination_latitude || !trip.destination_longitude) {
        alert("Trip destination has no GPS coordinates.");
        return;
      }

      window.open(
        `https://www.google.com/maps?q=${trip.destination_latitude},${trip.destination_longitude}`,
        "_blank"
      );
    } catch (error) {
      console.error(error);
      alert("Unable to open Google Maps.");
    }
  }}
  className="bg-red-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-red-700"
>
  📍 Navigate
</button>
  <button
    onClick={async () => {
      if (!driver.id) {
        alert("Driver not found.");
        return;
      }

      try {
        const trip = await getCurrentTripForDriver(
          supabase,
          driver.id,
          platformId
        );

        if (!trip) {
          alert("No active trip assigned.");
          return;
        }

await startTrip(
  supabase,
  trip.id,
  platformId!,
  driver.id,
  trip.vehicle_id
);
        if ("geolocation" in navigator) {
  const id = navigator.geolocation.watchPosition(
async (position) => {
  const latitude = position.coords.latitude;
  const longitude = position.coords.longitude;
  const speed = position.coords.speed ?? 0;
  const heading = position.coords.heading ?? 0;
  const recordedAt = new Date().toISOString();

  // Update current location
  const { error: locationError } = await supabase
    .from("driver_locations")
    .upsert({

      driver_id: driver.id,
      trip_id: trip.id,
      latitude,
      longitude,
      updated_at: recordedAt,
    });

  if (locationError) {
    console.error(locationError);
  }

  // Save GPS history
  const { error: historyError } = await supabase
    .from("driver_location_history")
    .insert({
      platform_id: platformId,
      driver_id: driver.id,
      trip_id: trip.id,
      latitude,
      longitude,
      speed,
      heading,
      recorded_at: recordedAt,
    });

  if (historyError) {
    console.error(historyError);
  }
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

  setWatchId(id);
}

        await loadDrivers();
        await loadVehicles();

        alert(`✅ Trip ${trip.trip_code} started.`);
      } catch (error) {
        console.error(error);
        alert("Unable to start trip.");
      }
    }}
    className="bg-green-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-green-700"
  >
    ▶️ Start Trip
  </button>
<button
  onClick={async () => {
    if (!driver.id) {
      alert("Driver not found.");
      return;
    }

    try {
      const trip = await getCurrentTripForDriver(
        supabase,
        driver.id,
        platformId
      );

      if (!trip) {
        alert("No active trip assigned.");
        return;
      }

      const passengers = await getTripPassengers(
        supabase,
        trip.id
      );

      setManifestPassengers(passengers);
      setManifestTripCode(trip.trip_code);
      setShowManifest(true);
    } catch (error) {
      console.error(error);
      alert("Unable to load passenger manifest.");
    }
  }}
  className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-700"
>
  👥 Passengers
</button>
</div>
<button
  onClick={async () => {
    if (!driver.id) {
      alert("Driver not found.");
      return;
    }

    try {
      const trip = await getCurrentTripForDriver(
        supabase,
        driver.id,
        platformId
      );

      if (!trip) {
        alert("No active trip assigned.");
        return;
      }
if (!platformId) {
  alert("Platform not loaded.");
  return;
}
await completeTrip(
  supabase,
  trip.id,
  platformId,
  driver.id,
  trip.vehicle_id
);
if (watchId !== null) {
  navigator.geolocation.clearWatch(watchId);
  setWatchId(null);
}
      await loadDrivers();
      await loadVehicles();

      alert(`✅ Trip ${trip.trip_code} completed successfully.`);
    } catch (error) {
      console.error(error);
      alert("Unable to complete trip.");
    }
  }}
  className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-indigo-700"
>
  ✅ Complete Trip
</button>
          </div>

        </div>
      </div>
    ))}
  </div>
)}

</div> {/* closes Driver List card */}

{showManifest && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 w-full max-w-3xl max-h-[80vh] overflow-y-auto">

              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">
                  Passenger Manifest
                </h2>

                <button
                  onClick={() => setShowManifest(false)}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg"
                >
                  Close
                </button>
              </div>

              <p className="font-semibold mb-4">
                Trip: {manifestTripCode}
              </p>

              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-slate-100">
                    <th className="border p-2 text-left">Passenger</th>
                    <th className="border p-2 text-left">Phone</th>
                    <th className="border p-2 text-left">Pickup</th>
                  </tr>
                </thead>

                <tbody>
                  {manifestPassengers.map((passenger) => (
                    <tr key={passenger.id}>
                      <td className="border p-2">
                        {passenger.full_name}
                      </td>
                      <td className="border p-2">
                        {passenger.phone}
                      </td>
                      <td className="border p-2">
                        {passenger.pickup_address}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

            </div>
          </div>
        )}

      </main>
    </AdminLayout>
  );
}

