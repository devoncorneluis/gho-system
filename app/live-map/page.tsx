"use client";

import { APIProvider, InfoWindow, Map, Marker } from "@vis.gl/react-google-maps";
import { useEffect, useState } from "react";
import AdminLayout from "../../components/AdminLayout";
import { supabase } from "../../lib/supabase";

const PLATFORM_ID = "713c411b-847e-4379-8e38-c142e06ff5fd";

type DriverLocation = {
  id: string;
  driver_name: string | null;
  driver_email: string | null;
  latitude: number | null;
  longitude: number | null;
  status: string | null;
  last_updated: string | null;
};

type EmergencyAlertPin = {
  id: string;
  driver_name: string | null;
  alert_type: string | null;
  emergency_type: string | null;
  message: string | null;
  latitude: number | null;
  longitude: number | null;
  status: string | null;
  created_at: string | null;
};

export default function LiveMapPage() {
  const [locations, setLocations] = useState<DriverLocation[]>([]);
  const [emergencies, setEmergencies] = useState<EmergencyAlertPin[]>([]);
  const [selectedEmergency, setSelectedEmergency] =
    useState<EmergencyAlertPin | null>(null);

  async function loadLocations() {
    const { data, error } = await supabase
      .from("driver_locations")
      .select("*")
      .eq("platform_id", PLATFORM_ID)
      .order("last_updated", { ascending: false });

    if (error) {
      alert(error.message);
      return;
    }

    setLocations(data || []);
  }

  async function loadEmergencies() {
    const { data, error } = await supabase
      .from("emergency_alerts")
      .select("*")
      .eq("platform_id", PLATFORM_ID)
      .eq("status", "Open")
      .order("created_at", { ascending: false });

    if (error) {
      alert(error.message);
      return;
    }

    setEmergencies(data || []);
  }

  useEffect(() => {
    loadLocations();
    loadEmergencies();

    const timer = setInterval(() => {
      loadLocations();
      loadEmergencies();
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

  return (
    <AdminLayout>
      <main className="min-h-screen bg-gray-100 p-6">
        <h1 className="text-4xl font-bold text-[#061B33]">
          Admin Live Map
        </h1>

        <p className="text-gray-600 mt-2">
          View live GPS locations, online drivers, and open emergency alerts.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="bg-white rounded-xl shadow p-4">
            <p className="text-gray-500">Online Drivers</p>
            <p className="text-3xl font-bold text-[#061B33]">{locations.length}</p>
          </div>

          <div className="bg-white rounded-xl shadow p-4">
            <p className="text-gray-500">Open Emergencies</p>
            <p className="text-3xl font-bold text-red-600">{emergencies.length}</p>
          </div>

          <div className="bg-white rounded-xl shadow p-4">
            <p className="text-gray-500">Map Refresh</p>
            <p className="text-3xl font-bold text-green-600">10s</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-6 mt-6">
          <div className="h-[500px] rounded-xl overflow-hidden">
            <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ""}>
              <Map defaultCenter={center} defaultZoom={12}>
                {emergencies.map((alert) => {
                  if (!alert.latitude || !alert.longitude) return null;

                  return (
                    <Marker
                      key={alert.id}
                      position={{
                        lat: alert.latitude,
                        lng: alert.longitude,
                      }}
                      label="🚨"
                      title={`🚨 ${
                        alert.emergency_type || alert.alert_type || "Emergency"
                      } - ${alert.driver_name || "Unknown Driver"}`}
                      onClick={() => setSelectedEmergency(alert)}
                    />
                  );
                })}

                {locations.map((location) => {
                  if (!location.latitude || !location.longitude) return null;

                  return (
                    <Marker
                      key={location.id}
                      position={{
                        lat: location.latitude,
                        lng: location.longitude,
                      }}
                      label="🚐"
                      title={location.driver_name || "Driver"}
                    />
                  );
                })}

                {selectedEmergency &&
                  selectedEmergency.latitude &&
                  selectedEmergency.longitude && (
                    <InfoWindow
                      position={{
                        lat: selectedEmergency.latitude,
                        lng: selectedEmergency.longitude,
                      }}
                      onCloseClick={() => setSelectedEmergency(null)}
                    >
                      <div className="text-sm space-y-2 max-w-[260px]">
                        <p className="text-lg font-bold text-red-600">
                          🚨 Emergency Alert
                        </p>

                        <p>
                          <strong>Driver:</strong>{" "}
                          {selectedEmergency.driver_name || "Unknown Driver"}
                        </p>

                        <p>
                          <strong>Type:</strong>{" "}
                          {selectedEmergency.emergency_type ||
                            selectedEmergency.alert_type ||
                            "Emergency"}
                        </p>

                        <p>
                          <strong>Status:</strong>{" "}
                          {selectedEmergency.status || "Open"}
                        </p>

                        <p>
                          <strong>Message:</strong>{" "}
                          {selectedEmergency.message || "No message provided"}
                        </p>

                        <p>
                          <strong>Created:</strong>{" "}
                          {selectedEmergency.created_at || "Unknown"}
                        </p>
                      </div>
                    </InfoWindow>
                  )}
              </Map>
            </APIProvider>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-6 mt-6">
          <h2 className="text-2xl font-bold text-[#061B33]">
            Open Emergency Alerts
          </h2>

          {emergencies.length === 0 && (
            <p className="text-gray-500 mt-4">
              No open emergency alerts.
            </p>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            {emergencies.map((alert) => (
              <div key={alert.id} className="border border-red-200 rounded-xl p-4 bg-red-50">
                <p className="text-xl font-bold text-red-700">
                  🚨 {alert.driver_name || "Unknown Driver"}
                </p>
                <p><strong>Type:</strong> {alert.emergency_type || alert.alert_type || "Emergency"}</p>
                <p><strong>Status:</strong> {alert.status}</p>
                <p><strong>Message:</strong> {alert.message || "No message provided"}</p>
                <p><strong>Latitude:</strong> {alert.latitude}</p>
                <p><strong>Longitude:</strong> {alert.longitude}</p>
                <p><strong>Created:</strong> {alert.created_at}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-6 mt-6">
          <h2 className="text-2xl font-bold text-[#061B33]">
            Online Drivers
          </h2>

          {locations.length === 0 && (
            <p className="text-gray-500 mt-4">
              No driver locations found yet.
            </p>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            {locations.map((location) => (
              <div key={location.id} className="border rounded-xl p-4">
                <p className="text-xl font-bold">
                  📍 {location.driver_name || "Unknown Driver"}
                </p>
                <p><strong>Email:</strong> {location.driver_email}</p>
                <p><strong>Status:</strong> {location.status}</p>
                <p><strong>Latitude:</strong> {location.latitude}</p>
                <p><strong>Longitude:</strong> {location.longitude}</p>
                <p><strong>Last Updated:</strong> {location.last_updated}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </AdminLayout>
  );
}
