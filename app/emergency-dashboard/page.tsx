"use client";

import { APIProvider, Map, Marker } from "@vis.gl/react-google-maps";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

const PLATFORM_ID = "713c411b-847e-4379-8e38-c142e06ff5fd";

type EmergencyAlert = {
  id: string;
  driver_name: string | null;
  alert_type: string | null;
  latitude: number | null;
  longitude: number | null;
  status: string | null;
  created_at: string | null;
};

export default function EmergencyDashboardPage() {
  const [alerts, setAlerts] = useState<EmergencyAlert[]>([]);
  const [selectedAlert, setSelectedAlert] = useState<EmergencyAlert | null>(null);

  async function loadAlerts() {
    const { data, error } = await supabase
      .from("emergency_alerts")
      .select("*")
      .eq("platform_id", PLATFORM_ID)
      .order("created_at", { ascending: false });

    if (error) {
      alert(error.message);
      return;
    }

    setAlerts(data || []);

    if (!selectedAlert && data && data.length > 0) {
      setSelectedAlert(data[0]);
    }
  }

  async function updateAlertStatus(alertId: string, status: string) {
    const { error } = await supabase
      .from("emergency_alerts")
      .update({ status })
      .eq("id", alertId);

    if (error) {
      alert(error.message);
      return;
    }

    loadAlerts();
  }

  useEffect(() => {
    loadAlerts();
  }, []);

  const openAlerts = alerts.filter((alert) => alert.status === "Open").length;

  const mapCenter =
    selectedAlert?.latitude && selectedAlert?.longitude
      ? { lat: selectedAlert.latitude, lng: selectedAlert.longitude }
      : { lat: -33.918861, lng: 18.4233 };

  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-4xl font-bold text-red-700">
        🚨 Emergency Dashboard
      </h1>

      <p className="text-gray-600 mt-2">
        View panic alerts, driver emergency locations, and resolve incidents.
      </p>

      <div className="bg-red-100 border border-red-500 text-red-800 rounded-xl p-6 mt-6">
        <p className="font-bold">Open Alerts</p>
        <p className="text-4xl font-bold">{openAlerts}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-xl font-bold mb-4">Emergency Alerts</h2>

          {alerts.length === 0 && (
            <p className="text-gray-500">No emergency alerts yet.</p>
          )}

          {alerts.map((alert) => (
            <div
              key={alert.id}
              className="border rounded-xl p-4 mb-4 cursor-pointer hover:bg-red-50"
              onClick={() => setSelectedAlert(alert)}
            >
              <p><strong>Driver:</strong> {alert.driver_name}</p>
              <p><strong>Type:</strong> {alert.alert_type}</p>
              <p><strong>Status:</strong> {alert.status}</p>
              <p><strong>Time:</strong> {alert.created_at}</p>

              <div className="flex gap-2 mt-3">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    updateAlertStatus(alert.id, "Acknowledged");
                  }}
                  className="bg-orange-500 text-white px-4 py-2 rounded-lg font-bold"
                >
                  Acknowledge
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    updateAlertStatus(alert.id, "Resolved");
                  }}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg font-bold"
                >
                  Resolve
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-xl font-bold mb-4">Alert Location</h2>

          <div className="h-96 rounded-xl overflow-hidden">
            <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ""}>
              <Map defaultCenter={mapCenter} defaultZoom={13}>
                {selectedAlert?.latitude && selectedAlert?.longitude && (
                  <Marker
                    position={{
                      lat: selectedAlert.latitude,
                      lng: selectedAlert.longitude,
                    }}
                  />
                )}
              </Map>
            </APIProvider>
          </div>

          {selectedAlert && (
            <div className="mt-4 space-y-2">
              <p><strong>Driver:</strong> {selectedAlert.driver_name}</p>
              <p><strong>Latitude:</strong> {selectedAlert.latitude}</p>
              <p><strong>Longitude:</strong> {selectedAlert.longitude}</p>
              <p><strong>Status:</strong> {selectedAlert.status}</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
