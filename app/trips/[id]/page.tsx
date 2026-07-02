"use client";

import { use, useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase";

type Trip = {
  id: string;
  platform_id: string | null;

  trip_code: string | null;
  trip_date: string | null;

  shift: string | null;
  area: string | null;

  pickup_time: string | null;
  dropoff_time: string | null;

  driver_id: string | null;
  driver_name: string | null;

  vehicle_id: string | null;
  vehicle_name: string | null;
  vehicle_registration: string | null;

  status: string | null;

  estimated_km: number | null;
  trip_distance_km: number | null;
  estimated_duration: number | null;

  started_at: string | null;
  completed_at: string | null;
};

type Passenger = {
  id: string;

  full_name: string | null;

  phone: string | null;

  pickup_address: string | null;
  pickup_area: string | null;

  pickup_time: string | null;

  pickup_status: string | null;
};

export default function TripDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const [trip, setTrip] = useState<Trip | null>(null);
  const [passengers, setPassengers] = useState<Passenger[]>([]);

  const [showTicketModal, setShowTicketModal] = useState(false);

  const [ticketSubject, setTicketSubject] = useState("");
  const [ticketDescription, setTicketDescription] = useState("");
  const [ticketPriority, setTicketPriority] = useState("Medium");

  async function loadTrip() {
    const { data } = await supabase
      .from("trips")
      .select("*")
      .eq("id", id)
      .single();

    if (data) {
      setTrip(data);
    }

    const { data: passengerData } = await supabase
      .from("trip_passengers")
      .select("*")
      .eq("trip_id", id)
      .order("pickup_time");

    setPassengers(passengerData || []);
  }

  async function startTrip() {
    function startLocationTracking(driverId: string, tripId: string) {
  navigator.geolocation.watchPosition(
    async (position) => {
      await supabase
        .from("driver_locations")
        .upsert({
          driver_id: driverId,
          trip_id: tripId,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          speed: position.coords.speed ?? 0,
          heading: position.coords.heading ?? 0,
          updated_at: new Date().toISOString(),
        });
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
}
    if (!trip) return;

    if (!trip.platform_id) {
      alert("Trip platform context is missing.");
      return;
    }

    const { error } = await supabase
      .from("trips")
      .update({
        status: "In Progress",
        started_at: new Date().toISOString(),
      })
      .eq("id", trip.id)
      .eq("platform_id", trip.platform_id);

    if (error) {
      alert(error.message);
      return;
    }

    if (trip.driver_id) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          await supabase
            .from("driver_locations")
            .upsert({
              driver_id: trip.driver_id,
              trip_id: trip.id,
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              speed: position.coords.speed ?? 0,
              heading: position.coords.heading ?? 0,
              updated_at: new Date().toISOString(),
            });

          await supabase
            .from("drivers")
            .update({
              last_location_update: new Date().toISOString(),
            })
            .eq("id", trip.driver_id)
            .eq("platform_id", trip.platform_id);
        },
        (error) => {
          console.error(error);
        }
      );
    }

    await loadTrip();

    alert("Trip started.");
  }

  async function completeTrip() {
    if (!trip) return;

    if (!confirm("Complete this trip?")) return;

    if (!trip.platform_id) {
      alert("Trip platform context is missing.");
      return;
    }

    const { error } = await supabase
      .from("trips")
      .update({
        status: "Completed",
        completed_at: new Date().toISOString(),
      })
      .eq("id", trip.id)
      .eq("platform_id", trip.platform_id);

    if (error) {
      alert(error.message);
      return;
    }

    await supabase
      .from("trip_passengers")
      .update({
        pickup_status: "Completed",
      })
      .eq("trip_id", trip.id)
      .eq("platform_id", trip.platform_id);

    if (trip.driver_id) {
      await supabase
        .from("drivers")
        .update({
          status: "Available",
          availability_status: "Available",
        })
        .eq("id", trip.driver_id)
        .eq("platform_id", trip.platform_id);
    }

    if (trip.vehicle_id) {
      await supabase
        .from("vehicles")
        .update({
          status: "Available",
          availability_status: "Available",
          assigned_driver: null,
        })
        .eq("id", trip.vehicle_id)
        .eq("platform_id", trip.platform_id);
    }

    await loadTrip();

    alert("Trip completed successfully.");
  }

  async function createSupportTicket() {
    if (!trip) return;

    if (!ticketSubject.trim()) {
      alert("Enter a subject.");
      return;
    }

    const { error } = await supabase
      .from("support_tickets")
      .insert({
        platform_id: trip.platform_id,
        trip_id: trip.id,
        created_by: null,
        subject: ticketSubject,
        description: ticketDescription,
        status: "Open",
      });

    if (error) {
      alert(error.message);
      return;
    }

    alert("Support ticket created.");

    setTicketSubject("");
    setTicketDescription("");
    setTicketPriority("Medium");
    setShowTicketModal(false);
  }

  async function createEmergencyAlert() {
    if (!trip) return;

    if (!confirm("Send an emergency alert?")) return;

    const { error } = await supabase
      .from("emergency_alerts")
      .insert({
        platform_id: trip.platform_id,
        trip_id: trip.id,
        driver_id: trip.driver_id,
        alert_type: "Emergency",
        notes: `Emergency raised from ${trip.trip_code}`,
        status: "Open",
      });

    if (error) {
      alert(error.message);
      return;
    }

    alert("Emergency alert sent successfully.");
  }

  useEffect(() => {
    loadTrip();
  }, []);

  if (!trip) {
    return (
      <main className="min-h-screen p-6">
        Loading trip...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <button
        onClick={() => window.history.back()}
        className="mb-4 bg-gray-200 px-4 py-2 rounded-xl font-bold"
      >
        ← Back
      </button>

      <div className="bg-white rounded-xl shadow p-6">
        <h1 className="text-3xl font-bold text-[#061B33]">
          {trip.trip_code}
        </h1>

        <div className="grid md:grid-cols-2 gap-4 mt-4">
          <p><strong>Date:</strong> {trip.trip_date}</p>
          <p><strong>Shift:</strong> {trip.shift}</p>
          <p><strong>Area:</strong> {trip.area}</p>
          <p><strong>Status:</strong> {trip.status}</p>
          <p><strong>Driver:</strong> {trip.driver_name}</p>
          <p><strong>Vehicle:</strong> {trip.vehicle_name}</p>
          <p><strong>Registration:</strong> {trip.vehicle_registration}</p>
          <p><strong>Distance:</strong> {trip.trip_distance_km || trip.estimated_km} km</p>
          <p>
            <strong>Duration:</strong>{" "}
            {trip.estimated_duration
              ? `${trip.estimated_duration} min`
              : "Not set"}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow p-6 mt-6">
        <h2 className="text-2xl font-bold mb-4">
          Operations Centre
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">

          <button
            onClick={startTrip}
            disabled={
              trip.status === "In Progress" ||
              trip.status === "Completed"
            }
            className="bg-green-600 text-white rounded-xl p-3 font-bold disabled:bg-gray-400"
          >
            {trip.status === "In Progress"
              ? "Trip Started"
              : trip.status === "Completed"
              ? "Trip Completed"
              : "Start Trip"}
          </button>

          <button
            onClick={completeTrip}
            disabled={trip.status === "Completed"}
            className="bg-blue-600 text-white rounded-xl p-3 font-bold disabled:bg-gray-400"
          >
            Complete Trip
          </button>

          <button
            onClick={() =>
              window.location.href = `/live-map?trip=${trip.id}`
            }
            className="bg-green-700 text-white rounded-xl p-3 font-bold"
          >
            Live Map
          </button>

          <button
            onClick={() => setShowTicketModal(true)}
            className="bg-yellow-500 text-white rounded-xl p-3 font-bold"
          >
            Support Ticket
          </button>

          <button
            onClick={createEmergencyAlert}
            className="bg-red-600 text-white rounded-xl p-3 font-bold"
          >
            Emergency
          </button>
        </div>
      </div>
    </main>
  );
}