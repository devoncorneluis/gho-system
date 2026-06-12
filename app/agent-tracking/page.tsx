"use client";

import { APIProvider, Map, Marker } from "@vis.gl/react-google-maps";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { getUserPlatform } from "../../lib/getUserPlatform";

type DriverLocation = {
  id: string;
  driver_name: string | null;
  driver_email: string | null;
  latitude: number | null;
  longitude: number | null;
  status: string | null;
  last_updated: string | null;
};

type Trip = {
  id: string;
  trip_code: string | null;
  trip_date: string | null;
  driver_name: string | null;
  vehicle_name: string | null;
  vehicle_registration: string | null;
  pickup_time: string | null;
  dropoff_time: string | null;
  status: string | null;
  area: string | null;
};

type Agent = {
  id: string;
  full_name: string | null;
  email: string | null;
};

export default function AgentTrackingPage() {
  const [platformId, setPlatformId] = useState("");
  const [agentName, setAgentName] = useState("Agent");
  const [agentEmail, setAgentEmail] = useState("");
  const [agent, setAgent] = useState<Agent | null>(null);
  const [locations, setLocations] = useState<DriverLocation[]>([]);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [menuOpen, setMenuOpen] = useState(false);

  async function loadData(activePlatformId?: string, activeAgentEmail?: string) {
    const finalPlatformId = activePlatformId || platformId;
    const finalAgentEmail = activeAgentEmail || agentEmail;

    if (!finalPlatformId || !finalAgentEmail) return;

    const today = new Date().toISOString().slice(0, 10);

    const { data: myPassengers, error: passengerError } = await supabase
      .from("trip_passengers")
      .select("trip_id")
      .eq("platform_id", finalPlatformId)
      .eq("email", finalAgentEmail);

    if (passengerError) {
      alert(passengerError.message);
      return;
    }

    const myTripIds = Array.from(
      new Set((myPassengers || []).map((item) => item.trip_id).filter(Boolean))
    );

    if (myTripIds.length === 0) {
      setTrips([]);
      setLocations([]);
      return;
    }

    const { data: tripData, error: tripError } = await supabase
      .from("trips")
      .select("*")
      .eq("platform_id", finalPlatformId)
      .eq("trip_date", today)
      .in("status", ["Assigned", "In Progress"])
      .in("id", myTripIds);

    if (tripError) {
      alert(tripError.message);
      return;
    }

    const driverNames = Array.from(
      new Set((tripData || []).map((trip) => trip.driver_name).filter(Boolean))
    );

    if (driverNames.length === 0) {
      setTrips(tripData || []);
      setLocations([]);
      return;
    }

    const { data: locationData } = await supabase
      .from("driver_locations")
      .select("*")
      .eq("platform_id", finalPlatformId)
      .in("driver_name", driverNames)
      .order("last_updated", { ascending: false });

    setLocations(locationData || []);
    setTrips(tripData || []);
  }

  async function setupPage() {
    const userPlatform = await getUserPlatform();

    if (!userPlatform) {
      window.location.href = "/login";
      return;
    }

    setPlatformId(userPlatform.platformId);

    if (userPlatform.email) {
      const { data: agent } = await supabase
        .from("agents")
        .select("id, full_name, email")
        .eq("platform_id", userPlatform.platformId)
        .eq("email", userPlatform.email)
        .maybeSingle();

      if (agent?.full_name) {
        setAgent(agent);
        setAgentName(agent.full_name);
        setAgentEmail(agent.email || "");

        await loadData(userPlatform.platformId, agent.email || "");
      }
    }

    if (!userPlatform.email) {
      loadData(userPlatform.platformId);
    }
  }

  useEffect(() => {
    setupPage();

    const timer = setInterval(() => {
      loadData(platformId, agentEmail);
    }, 10000);

    return () => clearInterval(timer);
  }, []);

  const firstLocation = locations.find(
    (location) => location.latitude && location.longitude
  );

  const center =
    firstLocation?.latitude && firstLocation?.longitude
      ? { lat: firstLocation.latitude, lng: firstLocation.longitude }
      : { lat: -33.918861, lng: 18.4233 };

  function getTripForDriver(driverName: string | null) {
    return trips.find((trip) => trip.driver_name === driverName);
  }

  async function logout() {
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  function openGoogleMaps(driverLocation: DriverLocation) {
    if (!driverLocation.latitude || !driverLocation.longitude) {
      alert("No driver location available yet.");
      return;
    }

    window.open(
      `https://www.google.com/maps/search/?api=1&query=${driverLocation.latitude},${driverLocation.longitude}`,
      "_blank"
    );
  }

  return (
    <main className="min-h-screen bg-[#F6F7FB] text-gray-700">
      {menuOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div className="w-4/5 max-w-sm bg-white h-full p-8 shadow-2xl">
            <div className="flex items-center justify-between mb-10">
              <div>
                <h1 className="text-3xl font-black text-[#061B33]">
                  GHO Agent
                </h1>
                <p className="text-orange-500 font-bold">
                  Transport Tracking
                </p>
              </div>

              <button
                onClick={() => setMenuOpen(false)}
                className="text-3xl text-gray-400"
              >
                ×
              </button>
            </div>

            <nav className="space-y-8 text-xl font-semibold text-gray-500">
              <p>📊 Dashboard</p>
              <p>🚘 My Transport</p>
              <p>📍 Live Tracking</p>
              <p>🔔 Notifications</p>
              <p>👤 Profile</p>
            </nav>

            <button
              onClick={logout}
              className="absolute bottom-8 left-8 right-8 bg-black text-white rounded-2xl py-4 font-bold"
            >
              Sign Out
            </button>
          </div>

          <button
            onClick={() => setMenuOpen(false)}
            className="flex-1 bg-black/40"
          />
        </div>
      )}

      <header className="bg-white border-b p-5 sticky top-0 z-40">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => window.history.back()}
              className="text-xl bg-gray-100 rounded-xl px-3 py-2"
            >
              ←
            </button>

            <button
              onClick={() => setMenuOpen(true)}
              className="text-3xl text-gray-500"
            >
              ☰
            </button>
          </div>

          <div className="text-right">
            <h1 className="text-xl font-black text-[#061B33]">
              Agent Dashboard
            </h1>
            <p className="text-sm">
              Logged in as <strong>{agentName}</strong>
            </p>
          </div>
        </div>
      </header>

      <section className="p-4 space-y-5">
        <div className="bg-white rounded-3xl shadow p-6 overflow-hidden">
          <h2 className="text-3xl font-black text-gray-700">
            Hi {agentName.split(" ")[0]}, welcome back.
          </h2>

          <p className="text-xl text-gray-500 mt-2">
            View only today&apos;s assigned transport to avoid confusion.
          </p>

          <div className="bg-gray-100 rounded-xl p-5 mt-6">
            <p className="text-gray-500">Today&apos;s active trips:</p>
            <p className="text-4xl font-black text-[#061B33]">
              {trips.length}
            </p>
          </div>

          <div className="mt-6 bg-gray-50 rounded-2xl p-6 text-center">
            <div className="text-7xl">🚘</div>
            <p className="text-gray-500 mt-3">
              Live tracking, driver details, and trip updates.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow p-6">
          <h2 className="text-2xl font-black mb-4">Live Tracking</h2>

          <div className="h-[320px] rounded-3xl overflow-hidden bg-gray-100">
            <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ""}>
              <Map defaultCenter={center} defaultZoom={12}>
                {locations.map((location) => {
                  if (!location.latitude || !location.longitude) return null;

                  return (
                    <Marker
                      key={location.id}
                      position={{
                        lat: location.latitude,
                        lng: location.longitude,
                      }}
                    />
                  );
                })}
              </Map>
            </APIProvider>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow p-6">
          <h2 className="text-2xl font-black mb-4">Today&apos;s Transport</h2>
          {agentEmail && (
            <p className="text-gray-500 mb-4">
              Signed in with: <strong>{agentEmail}</strong>
            </p>
          )}

          {locations.length === 0 && (
            <p className="text-gray-500">
              No live driver locations available yet.
            </p>
          )}

          <div className="space-y-5">
            {locations.map((location) => {
              const trip = getTripForDriver(location.driver_name);

              return (
                <div key={location.id} className="border rounded-3xl p-5 bg-gray-50">
                  <p className="text-lg font-black text-[#061B33]">
                    📍 {location.driver_name || "Unknown Driver"}
                  </p>

                  <div className="grid grid-cols-2 gap-4 mt-4 text-gray-600">
                    <div>
                      <p className="font-bold">{location.status || "Unknown"}</p>
                      <p className="text-sm">Driver Status</p>
                    </div>

                    <div>
                      <p className="font-bold">
                        {location.last_updated
                          ? new Date(location.last_updated).toLocaleTimeString()
                          : "No update"}
                      </p>
                      <p className="text-sm">Last Updated</p>
                    </div>
                  </div>

                  {trip ? (
                    <div className="bg-white rounded-2xl shadow-sm p-4 mt-5">
                      <h3 className="text-xl font-black text-gray-600">
                        Trip Details
                      </h3>

                      <div className="space-y-3 mt-4">
                        <p>
                          <strong>Trip ID:</strong> {trip.trip_code}
                        </p>

                        <p>
                          <strong>Vehicle:</strong> {trip.vehicle_name || "Not assigned"}
                        </p>

                        <p>
                          <strong>Registration:</strong>{" "}
                          {trip.vehicle_registration || "Not assigned"}
                        </p>

                        <p>
                          <strong>Pickup:</strong> {trip.pickup_time || "Not set"}
                        </p>

                        <p>
                          <strong>Drop-off:</strong> {trip.dropoff_time || "Not set"}
                        </p>

                        <p>
                          <strong>Status:</strong> {trip.status || "Assigned"}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-2 mt-5">
                        <button
                          onClick={() => openGoogleMaps(location)}
                          className="border border-green-500 text-green-600 px-4 py-2 rounded-lg font-bold"
                        >
                          Open Map
                        </button>

                        <button
                          onClick={() => alert("Support ticket feature coming next")}
                          className="border px-4 py-2 rounded-lg font-bold"
                        >
                          Support
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-500 mt-4">
                      No active trip linked to this driver.
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </main>
  );
}
