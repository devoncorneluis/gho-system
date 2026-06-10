"use client";

import { useEffect, useState } from "react";
import AdminLayout from "../../components/AdminLayout";
import { supabase } from "../../lib/supabase";

const PLATFORM_ID = "713c411b-847e-4379-8e38-c142e06ff5fd";

type Trip = {
  id: string;
  status: string | null;
};

type Driver = {
  id: string;
  availability_status: string | null;
};

type Passenger = {
  id: string;
  pickup_status: string | null;
};

type EmergencyAlert = {
  id: string;
  status: string | null;
};

type Vehicle = {
  id: string;
  status: string | null;
};

const menuItems = [
  { name: "📅 Calendar", href: "/calendar" },
  { name: "🚐 Trips", href: "/trips" },
  { name: "👥 Agents", href: "/agents" },
  { name: "🚗 Drivers", href: "/drivers" },
  { name: "🚙 Vehicles", href: "/vehicles" },
  { name: "📍 Live Map", href: "/live-map" },
  { name: "🚨 Emergency", href: "/emergency-dashboard" },
  { name: "🔔 Notifications", href: "/notifications" },
  { name: "📊 Reports", href: "/reports" },
];

export default function AdminPage() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [passengers, setPassengers] = useState<Passenger[]>([]);
  const [alerts, setAlerts] = useState<EmergencyAlert[]>([]);

  async function loadDashboard() {
    const { data: tripData } = await supabase
      .from("trips")
      .select("id, status")
      .eq("platform_id", PLATFORM_ID);

    const { data: driverData } = await supabase
      .from("drivers")
      .select("id, availability_status")
      .eq("platform_id", PLATFORM_ID);

    const { data: vehicleData } = await supabase
      .from("vehicles")
      .select("id, status")
      .eq("platform_id", PLATFORM_ID);

    const { data: passengerData } = await supabase
      .from("trip_passengers")
      .select("id, pickup_status")
      .eq("platform_id", PLATFORM_ID);

    const { data: alertData } = await supabase
      .from("emergency_alerts")
      .select("id, status")
      .eq("platform_id", PLATFORM_ID);

    setTrips(tripData || []);
    setDrivers(driverData || []);
    setVehicles(vehicleData || []);
    setPassengers(passengerData || []);
    setAlerts(alertData || []);
  }

  useEffect(() => {
    loadDashboard();

    const timer = setInterval(loadDashboard, 10000);

    return () => clearInterval(timer);
  }, []);

  const activeTrips = trips.filter(
    (trip) => trip.status === "Assigned" || trip.status === "In Progress"
  ).length;

  const completedTrips = trips.filter((trip) => trip.status === "Completed").length;

  const availableDrivers = drivers.filter(
    (driver) => driver.availability_status === "Available"
  ).length;

  const onTripDrivers = drivers.filter(
    (driver) => driver.availability_status === "On Trip"
  ).length;

  const availableVehicles = vehicles.filter(
    (vehicle) => vehicle.status === "Available"
  ).length;

  const unavailableVehicles = vehicles.filter(
    (vehicle) => vehicle.status !== "Available"
  ).length;

  const waitingPassengers = passengers.filter(
    (p) => p.pickup_status === "Waiting"
  ).length;

  const pickedUpPassengers = passengers.filter(
    (p) => p.pickup_status === "Picked Up"
  ).length;

  const latePassengers = passengers.filter(
    (p) => p.pickup_status === "Running Late"
  ).length;

  const noShowPassengers = passengers.filter(
    (p) => p.pickup_status === "No Show"
  ).length;

  const openEmergencies = alerts.filter((alert) => alert.status === "Open").length;

  return (
    <AdminLayout>
      <main className="min-h-screen bg-gray-100 p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold text-[#061B33]">
              GHO Daily Operations Dashboard
            </h1>

            <p className="text-gray-600 mt-2">
              Global Handling Operations command centre for live fleet, trips,
              drivers, passengers, and emergencies.
            </p>
          </div>

          <div className="bg-[#061B33] text-white rounded-xl px-5 py-4 shadow">
            <p className="text-sm text-gray-300">Parent Company</p>
            <p className="text-xl font-bold">Corneluis Group Pty Ltd</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mt-6">
          <div className="bg-white rounded-xl shadow p-5">
            <p className="font-bold text-gray-600">Total Trips</p>
            <p className="text-4xl font-bold text-orange-500">{trips.length}</p>
          </div>

          <div className="bg-white rounded-xl shadow p-5">
            <p className="font-bold text-gray-600">Active Trips</p>
            <p className="text-4xl font-bold text-orange-500">{activeTrips}</p>
          </div>

          <div className="bg-green-50 rounded-xl shadow p-5 border border-green-100">
            <p className="font-bold text-gray-600">Completed</p>
            <p className="text-4xl font-bold text-green-600">{completedTrips}</p>
          </div>

          <div className="bg-white rounded-xl shadow p-5">
            <p className="font-bold text-gray-600">Available Drivers</p>
            <p className="text-4xl font-bold text-[#061B33]">{availableDrivers}</p>
          </div>

          <div className="bg-white rounded-xl shadow p-5">
            <p className="font-bold text-gray-600">Available Vehicles</p>
            <p className="text-4xl font-bold text-[#061B33]">{availableVehicles}</p>
          </div>

          <div className="bg-red-50 rounded-xl shadow p-5 border border-red-200">
            <p className="font-bold text-gray-600">Open Emergencies</p>
            <p className="text-4xl font-bold text-red-600">{openEmergencies}</p>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-[#061B33] mt-8">
          Fleet & Driver Status
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
          <div className="bg-white rounded-xl shadow p-5">
            <p className="font-bold">Total Drivers</p>
            <p className="text-4xl font-bold text-[#061B33]">{drivers.length}</p>
          </div>

          <div className="bg-orange-50 rounded-xl shadow p-5">
            <p className="font-bold">Drivers On Trip</p>
            <p className="text-4xl font-bold text-orange-500">{onTripDrivers}</p>
          </div>

          <div className="bg-white rounded-xl shadow p-5">
            <p className="font-bold">Total Vehicles</p>
            <p className="text-4xl font-bold text-[#061B33]">{vehicles.length}</p>
          </div>

          <div className="bg-red-50 rounded-xl shadow p-5">
            <p className="font-bold">Unavailable Vehicles</p>
            <p className="text-4xl font-bold text-red-600">{unavailableVehicles}</p>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-[#061B33] mt-8">
          Passenger Manifest Summary
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
          <div className="bg-white rounded-xl shadow p-5">
            <p className="font-bold">Waiting</p>
            <p className="text-4xl font-bold text-gray-600">{waitingPassengers}</p>
          </div>

          <div className="bg-green-50 rounded-xl shadow p-5">
            <p className="font-bold">Picked Up</p>
            <p className="text-4xl font-bold text-green-600">{pickedUpPassengers}</p>
          </div>

          <div className="bg-orange-50 rounded-xl shadow p-5">
            <p className="font-bold">Running Late</p>
            <p className="text-4xl font-bold text-orange-500">{latePassengers}</p>
          </div>

          <div className="bg-red-50 rounded-xl shadow p-5">
            <p className="font-bold">No Shows</p>
            <p className="text-4xl font-bold text-red-600">{noShowPassengers}</p>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-[#061B33] mt-8">
          Quick Access
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          {menuItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="bg-white rounded-xl shadow p-6 font-bold text-[#061B33] hover:bg-orange-50"
            >
              {item.name}
            </a>
          ))}
        </div>
      </main>
    </AdminLayout>
  );
}
