"use client";

import { useEffect, useState } from "react";
import AdminLayout from "../../components/AdminLayout";
import { supabase } from "../../lib/supabase";
import { getUserPlatform } from "../../lib/getUserPlatform";



type Trip = { id: string; status: string | null };
type Driver = { id: string; availability_status: string | null };
type Passenger = { id: string; pickup_status: string | null };
type EmergencyAlert = { id: string; status: string | null };
type Vehicle = { id: string; status: string | null };

const menuItems = [
{ name: "Daily Planner", icon: "🚐", href: "/admin-planner" },
  { name: "Trips", icon: "🚐", href: "/trips" },
  { name: "Route Playback", icon: "🛰️", href: "/route-playback" },
  { name: "Agents", icon: "👥", href: "/agents" },
  { name: "Drivers", icon: "🚗", href: "/drivers" },
  { name: "Vehicles", icon: "🚙", href: "/vehicles" },
  { name: "Live Map", icon: "📍", href: "/live-map" },
  { name: "Emergency", icon: "🚨", href: "/emergency-dashboard" },
  { name: "Notifications", icon: "🔔", href: "/notifications" },
  { name: "Reports", icon: "📊", href: "/reports" },
];

function StatCard({
  title,
  value,
  icon,
  tone = "dark",
}: {
  title: string;
  value: number;
  icon: string;
  tone?: "dark" | "orange" | "green" | "red" | "blue" | "gray";
}) {
  const toneClass = {
    dark: "text-[#061B33] bg-white border-gray-100",
    orange: "text-orange-600 bg-orange-50 border-orange-100",
    green: "text-green-700 bg-green-50 border-green-100",
    red: "text-red-700 bg-red-50 border-red-100",
    blue: "text-blue-700 bg-blue-50 border-blue-100",
    gray: "text-gray-700 bg-white border-gray-100",
  }[tone];

  return (
    <div className={`rounded-2xl shadow-sm border p-5 ${toneClass}`}>
      <div className="flex items-center justify-between">
        <p className="font-bold text-gray-600">{title}</p>
        <span className="text-2xl">{icon}</span>
      </div>
      <p className="text-4xl font-black mt-3">{value}</p>
    </div>
  );
}

export default function AdminPage() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [passengers, setPassengers] = useState<Passenger[]>([]);
  const [alerts, setAlerts] = useState<EmergencyAlert[]>([]);

  async function loadDashboard() {
    const userPlatform = await getUserPlatform();

    if (!userPlatform) {
      window.location.href = "/login";
      return;
    }

    const platformId = userPlatform.platformId;

    const { data: tripData } = await supabase.from("trips").select("id, status").eq("platform_id", platformId);
    const { data: driverData } = await supabase.from("drivers").select("id, availability_status").eq("platform_id", platformId);
    const { data: vehicleData } = await supabase.from("vehicles").select("id, status").eq("platform_id", platformId);
    const { data: passengerData } = await supabase.from("trip_passengers").select("id, pickup_status").eq("platform_id", platformId);
    const { data: alertData } = await supabase.from("emergency_alerts").select("id, status").eq("platform_id", platformId);

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

  const activeTrips = trips.filter((t) => t.status === "Assigned" || t.status === "In Progress").length;
  const completedTrips = trips.filter((t) => t.status === "Completed").length;
  const availableDrivers = drivers.filter((d) => d.availability_status === "Available").length;
  const onTripDrivers = drivers.filter((d) => d.availability_status === "On Trip").length;
  const availableVehicles = vehicles.filter((v) => v.status === "Available").length;
  const unavailableVehicles = vehicles.filter((v) => v.status !== "Available").length;
  const waitingPassengers = passengers.filter((p) => p.pickup_status === "Waiting").length;
  const pickedUpPassengers = passengers.filter((p) => p.pickup_status === "Picked Up").length;
  const latePassengers = passengers.filter((p) => p.pickup_status === "Running Late").length;
  const noShowPassengers = passengers.filter((p) => p.pickup_status === "No Show").length;
  const openEmergencies = alerts.filter((a) => a.status === "Open").length;

  return (
    <AdminLayout>
      <main className="min-h-screen bg-[#F3F6FA] p-6">
        <section className="rounded-3xl bg-[#061B33] text-white p-8 shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <p className="text-orange-400 font-bold tracking-wide uppercase">
                Corneluis Group Pty Ltd
              </p>
              <h1 className="text-4xl md:text-5xl font-black mt-2">
                GHO Command Center
              </h1>
              <p className="text-gray-300 mt-3 max-w-2xl">
                Global Handling Operations live control dashboard for fleet,
                drivers, passengers, trips, and emergency response.
              </p>
            </div>

            <div className="bg-white/10 rounded-2xl p-5 border border-white/10">
              <p className="text-gray-300 text-sm">System Refresh</p>
              <p className="text-3xl font-black text-green-400">10s</p>
              <p className="text-gray-300 text-sm mt-1">Live operations mode</p>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mt-6">
          <StatCard title="Total Trips" value={trips.length} icon="🚐" tone="orange" />
          <StatCard title="Active Trips" value={activeTrips} icon="🟠" tone="orange" />
          <StatCard title="Completed" value={completedTrips} icon="✅" tone="green" />
          <StatCard title="Drivers Ready" value={availableDrivers} icon="👤" tone="blue" />
          <StatCard title="Vehicles Ready" value={availableVehicles} icon="🚙" tone="dark" />
          <StatCard title="Emergencies" value={openEmergencies} icon="🚨" tone="red" />
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-2xl font-black text-[#061B33]">
              Fleet & Driver Status
            </h2>

            <div className="grid grid-cols-2 gap-4 mt-5">
              <StatCard title="Total Drivers" value={drivers.length} icon="👥" />
              <StatCard title="On Trip" value={onTripDrivers} icon="🚐" tone="orange" />
              <StatCard title="Total Vehicles" value={vehicles.length} icon="🚙" />
              <StatCard title="Unavailable" value={unavailableVehicles} icon="🔴" tone="red" />
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-2xl font-black text-[#061B33]">
              Passenger Manifest
            </h2>

            <div className="grid grid-cols-2 gap-4 mt-5">
              <StatCard title="Waiting" value={waitingPassengers} icon="⏳" tone="gray" />
              <StatCard title="Picked Up" value={pickedUpPassengers} icon="✅" tone="green" />
              <StatCard title="Running Late" value={latePassengers} icon="🟠" tone="orange" />
              <StatCard title="No Shows" value={noShowPassengers} icon="🔴" tone="red" />
            </div>
          </div>
        </section>

        <section className="mt-8">
          <h2 className="text-2xl font-black text-[#061B33]">
            Operations Quick Access
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            {menuItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md hover:-translate-y-1 transition"
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-orange-50 flex items-center justify-center text-3xl">
                    {item.icon}
                  </div>
                  <div>
                    <p className="font-black text-[#061B33] text-lg">{item.name}</p>
                    <p className="text-gray-500 text-sm">Open {item.name}</p>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </section>
      </main>
    </AdminLayout>
  );
}
