"use client";

import { useEffect, useState } from "react";
import AdminLayout from "../../components/AdminLayout";
import { getUserPlatform } from "../../lib/getUserPlatform";
import { supabase } from "../../lib/supabase";

type Agent = {
  id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  home_area: string | null;
    status: string | null;
};

type RouteGroup = {
  id: string;
  route_name: string;
  areas: string[] | null;
  status: string | null;
};

type Driver = {
  id: string;
  full_name: string;
};

type Vehicle = {
  id: string;
  vehicle_name: string;
  vehicle_type: string | null;
  registration_number: string;
};

type DriverVehicleSelection = {
  driver_id: string;
  driver_name: string;
  vehicle_id: string;
  vehicle_name: string;
  vehicle_type: string | null;
  registration_number: string;
};

export default function DailyTransportPlannerPage() {
  const [platformId, setPlatformId] = useState<string | null>(null);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [routeGroups, setRouteGroups] = useState<RouteGroup[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedDriverVehicle, setSelectedDriverVehicle] = useState<Record<string, string>>({});
  const [planningMode, setPlanningMode] = useState("By Area");
  const [selectedRouteGroupId, setSelectedRouteGroupId] = useState("");
  const [planDate, setPlanDate] = useState(new Date().toISOString().slice(0, 10));
  const [shift, setShift] = useState("06:00 Shift");

  async function loadRouteGroups(activePlatformId: string) {
    const { data, error } = await supabase
      .from("route_groups")
      .select("id, route_name, areas, status")
      .eq("platform_id", activePlatformId)
      .eq("status", "Active")
      .order("route_name");

    if (error) {
      alert(error.message);
      return;
    }

    setRouteGroups(data || []);
  }

  async function loadAgents(activePlatformId: string) {
    const { data, error } = await supabase
      .from("agents")
      .select("id, full_name, email, phone, home_area, status")
      .eq("platform_id", activePlatformId)
      .eq("status", "Active")
      .order("home_area");

    if (error) {
      alert(error.message);
      return;
    }

    setAgents(data || []);
  }

  async function loadDriversAndVehicles(activePlatformId: string) {
    const { data: driverData, error: driverError } = await supabase
      .from("drivers")
      .select("id, full_name")
      .eq("platform_id", activePlatformId)
      .eq("status", "Active")
      .order("full_name");

    if (driverError) {
      alert(driverError.message);
      return;
    }

    const { data: vehicleData, error: vehicleError } = await supabase
      .from("vehicles")
      .select("id, vehicle_name, vehicle_type, registration_number")
      .eq("platform_id", activePlatformId)
      .eq("status", "Available")
      .order("vehicle_name");

    if (vehicleError) {
      alert(vehicleError.message);
      return;
    }

    setDrivers(driverData || []);
    setVehicles(vehicleData || []);
  }

  useEffect(() => {
    async function setupPage() {
      const userPlatform = await getUserPlatform();

      if (!userPlatform) {
        window.location.href = "/login";
        return;
      }

      setPlatformId(userPlatform.platformId);
      loadAgents(userPlatform.platformId);
      loadRouteGroups(userPlatform.platformId);
      loadDriversAndVehicles(userPlatform.platformId);
    }

    setupPage();
  }, []);

  const selectedRouteGroup = routeGroups.find(
    (route) => route.id === selectedRouteGroupId
  );

  const groupedAgents =
    planningMode === "By Route Group" && selectedRouteGroup
      ? {
          [selectedRouteGroup.route_name]: agents.filter((agent) =>
            (selectedRouteGroup.areas || []).includes(agent.home_area || "")
          ),
        }
      : agents.reduce<Record<string, Agent[]>>((groups, agent) => {
          const area = agent.home_area || "Unknown Area";
          if (!groups[area]) groups[area] = [];
          groups[area].push(agent);
          return groups;
        }, {});

  function suggestedVehicle(count: number) {
    if (count <= 4) return "Sedan";
    if (count <= 6) return "Suzuki Ertiga";
    return "Toyota Quantum";
  }

  function handleDriverVehicleChange(tripKey: string, value: string) {
    setSelectedDriverVehicle((current) => ({
      ...current,
      [tripKey]: value,
    }));
  }

  return (
    <AdminLayout>
      <main className="min-h-screen bg-gray-100 p-6">
        <h1 className="text-4xl font-black text-[#061B33]">
          🚐 Daily Transport Planner
        </h1>

        <p className="text-gray-600 mt-2">
          Plan today&apos;s staff transport, assign drivers, assign vehicles, and dispatch trips from one screen.
        </p>

        <div className="bg-white rounded-2xl shadow p-6 mt-6">
          <h2 className="text-xl font-bold mb-4">Planning Details</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="date"
              value={planDate}
              onChange={(e) => setPlanDate(e.target.value)}
              className="border p-3 rounded-lg"
            />

            <select
              value={shift}
              onChange={(e) => setShift(e.target.value)}
              className="border p-3 rounded-lg"
            >
              <option>06:00 Shift</option>
              <option>18:00 Shift</option>
            </select>

            <select
              value={planningMode}
              onChange={(e) => setPlanningMode(e.target.value)}
              className="border p-3 rounded-lg"
            >
              <option>By Area</option>
              <option>By Route Group</option>
            </select>

            {planningMode === "By Route Group" && (
              <select
                value={selectedRouteGroupId}
                onChange={(e) => setSelectedRouteGroupId(e.target.value)}
                className="border p-3 rounded-lg"
              >
                <option value="">Select Route Group</option>
                {routeGroups.map((route) => (
                  <option key={route.id} value={route.id}>
                    {route.route_name}
                  </option>
                ))}
              </select>
            )}

            <button
              onClick={() => {
                if (!platformId) return;
                loadAgents(platformId);
                loadDriversAndVehicles(platformId);
              }}
              className="bg-orange-500 text-white rounded-lg px-5 py-3 font-bold"
            >
              Refresh Plan
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="bg-white rounded-2xl shadow p-5">
            <p className="text-gray-500 font-bold">Active Agents</p>
            <p className="text-4xl font-black text-[#061B33]">{agents.length}</p>
          </div>

          <div className="bg-white rounded-2xl shadow p-5">
            <p className="text-gray-500 font-bold">Planned Trips</p>
            <p className="text-4xl font-black text-orange-500">
              {Object.keys(groupedAgents).length}
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow p-5">
            <p className="text-gray-500 font-bold">Date</p>
            <p className="text-2xl font-black text-[#061B33]">{planDate}</p>
          </div>
        </div>

        <div className="mt-6 space-y-5">
          {Object.entries(groupedAgents).map(([area, areaAgents], index) => {
            const tripCode = `GHO-${String(index + 1).padStart(3, "0")}`;

            return (
              <div key={area} className="bg-white rounded-3xl shadow p-6">
                <div className="flex flex-col md:flex-row md:justify-between gap-4">
                  <div>
                    <p className="text-sm text-gray-500 font-bold">
                      Trip {tripCode}
                    </p>

                    <h2 className="text-3xl font-black text-[#061B33]">
                      Area/Route: {area}
                    </h2>

                    <p className="text-gray-600 mt-2">
                      {areaAgents.length} passengers • Suggested vehicle:{" "}
                      <strong>{suggestedVehicle(areaAgents.length)}</strong>
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-3 md:min-w-[420px]">
                    <select
                      value={selectedDriverVehicle[area] || ""}
                      onChange={(e) => handleDriverVehicleChange(area, e.target.value)}
                      className="border p-3 rounded-lg"
                    >
                      <option value="">Select Driver & Vehicle</option>
                      {drivers.flatMap((driver) =>
                        vehicles.map((vehicle) => (
                          <option
                            key={`${driver.id}-${vehicle.id}`}
                            value={`${driver.id}|${vehicle.id}|${driver.full_name}|${vehicle.vehicle_name}|${vehicle.registration_number}|${vehicle.vehicle_type || ""}`}
                          >
                            {driver.full_name} | {vehicle.vehicle_name} | {vehicle.registration_number}
                          </option>
                        ))
                      )}
                    </select>

                    <button className="bg-[#061B33] text-white rounded-lg px-5 py-3 font-bold">
                      🚀 Dispatch Trip
                    </button>

                    <button className="bg-orange-500 text-white rounded-lg px-5 py-3 font-bold">
                      📄 Passenger Manifest PDF
                    </button>

                    <button className="bg-gray-700 text-white rounded-lg px-5 py-3 font-bold">
                      📄 Driver Manifest PDF
                    </button>
                  </div>
                </div>

                <div className="mt-5 bg-gray-50 rounded-2xl p-4">
                  <p className="font-black text-[#061B33] mb-3">
                    👥 Passengers
                  </p>

                  <div className="space-y-2">
                    {areaAgents.map((agent, passengerIndex) => (
                      <div key={agent.id} className="bg-white rounded-xl p-3 border">
                        <p className="font-bold">
                          {passengerIndex + 1}. {agent.full_name}
                        </p>
                        <p className="text-sm text-gray-500">
                          📍 {agent.home_area || "No pickup address"}
                        </p>
                        <p className="text-sm text-gray-500">
                          📞 {agent.phone || "No phone"} • {agent.email || "No email"}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}

          {agents.length === 0 && (
            <div className="bg-white rounded-3xl shadow p-8 text-center text-gray-500">
              No active agents found. Import or save agents first.
            </div>
          )}
        </div>
      </main>
    </AdminLayout>
  );
}
