"use client";

import { useState } from "react";
import { supabase } from "../../lib/supabase";

const PLATFORM_ID = "713c411b-847e-4379-8e38-c142e06ff5fd";

type Agent = {
  id: string;
  employee_no: string;
  full_name: string;
  home_area: string | null;
  shift_start: string | null;
  shift_end: string | null;
  status: string | null;
};

type SuggestedTrip = {
  trip_code: string;
  area: string;
  pickup_time: string;
  dropoff_time: string;
  vehicle_type: string;
  passenger_count: number;
};

function chooseVehicle(passengerCount: number) {
  if (passengerCount <= 4) return "Sedan";
  if (passengerCount <= 6) return "Suzuki Ertiga";
  return "Toyota Quantum";
}

function pickupTimeForShift(shift: string) {
  if (shift.includes("06:00")) return "05:00";
  if (shift.includes("18:00")) return "17:00";
  return "05:00";
}

function dropoffTimeForShift(shift: string) {
  if (shift.includes("06:00")) return "06:00";
  if (shift.includes("18:00")) return "18:00";
  return "06:00";
}

export default function CalendarPage() {
  const [showTrips, setShowTrips] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [tripDate, setTripDate] = useState("");
  const [shift, setShift] = useState("06:00 Shift");
  const [suggestedTrips, setSuggestedTrips] = useState<SuggestedTrip[]>([]);

  async function generateTrips() {
    const { data, error } = await supabase
      .from("agents")
      .select("*")
      .eq("platform_id", PLATFORM_ID)
      .eq("status", "Active");

    if (error) {
      alert(error.message);
      return;
    }

    const agents = (data || []) as Agent[];

    if (agents.length === 0) {
      alert("No active agents found. Add agents first.");
      return;
    }

    const groups: Record<string, Agent[]> = {};

    agents.forEach((agent) => {
      const area = agent.home_area || "Unknown Area";

      if (!groups[area]) {
        groups[area] = [];
      }

      groups[area].push(agent);
    });

    const trips: SuggestedTrip[] = [];

    Object.entries(groups).forEach(([area, areaAgents], index) => {
      const passengerCount = areaAgents.length;

      trips.push({
        trip_code: `GHO-${String(index + 1).padStart(3, "0")}`,
        area,
        pickup_time: pickupTimeForShift(shift),
        dropoff_time: dropoffTimeForShift(shift),
        vehicle_type: chooseVehicle(passengerCount),
        passenger_count: passengerCount,
      });
    });

    setSuggestedTrips(trips);
    setShowTrips(true);
    setConfirmed(false);
  }

  async function confirmTrips() {
    if (!tripDate) {
      alert("Please select a date first");
      return;
    }

    if (suggestedTrips.length === 0) {
      alert("Please generate trips first");
      return;
    }

    const tripsToSave = suggestedTrips.map((trip) => ({
      platform_id: PLATFORM_ID,
      trip_code: trip.trip_code,
      trip_date: tripDate,
      shift,
      area: trip.area,
      pickup_time: trip.pickup_time,
      dropoff_time: trip.dropoff_time,
      vehicle_type: trip.vehicle_type,
      passenger_count: trip.passenger_count,
      driver_name: "Not assigned",
      status: "Confirmed",
    }));

    const { error } = await supabase.from("trips").insert(tripsToSave);

    if (error) {
      alert(error.message);
      return;
    }

    setConfirmed(true);
  }

  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-4xl font-bold text-[#061B33]">
        Transport Calendar
      </h1>

      <p className="text-gray-600 mt-2">
        Select a date and shift to automatically generate transport trips.
      </p>

      <div className="bg-white rounded-xl shadow p-6 mt-6 max-w-xl">
        <label className="block mb-2 font-bold">Select Date</label>
        <input
          value={tripDate}
          onChange={(e) => setTripDate(e.target.value)}
          type="date"
          className="border p-3 rounded-lg w-full"
        />

        <label className="block mt-4 mb-2 font-bold">Select Shift</label>
        <select
          value={shift}
          onChange={(e) => setShift(e.target.value)}
          className="border p-3 rounded-lg w-full"
        >
          <option>06:00 Shift</option>
          <option>18:00 Shift</option>
        </select>

        <button
          onClick={generateTrips}
          className="mt-6 bg-orange-500 text-white px-6 py-3 rounded-lg font-bold"
        >
          Generate Trips
        </button>
      </div>

      {showTrips && (
        <div className="bg-white rounded-xl shadow p-6 mt-6">
          <h2 className="text-2xl font-bold text-[#061B33]">
            Suggested Group Trips
          </h2>

          <div className="grid grid-cols-6 font-bold border-b pb-2 mt-4">
            <p>Group</p>
            <p>Area</p>
            <p>Pickup</p>
            <p>Drop-off</p>
            <p>Vehicle</p>
            <p>Passengers</p>
          </div>

          {suggestedTrips.map((trip) => (
            <div key={trip.trip_code} className="grid grid-cols-6 py-3 border-b">
              <p>{trip.trip_code}</p>
              <p>{trip.area}</p>
              <p>{trip.pickup_time}</p>
              <p>{trip.dropoff_time}</p>
              <p>{trip.vehicle_type}</p>
              <p>{trip.passenger_count}</p>
            </div>
          ))}

          <div className="flex gap-3 mt-6">
            <button className="bg-[#061B33] text-white px-5 py-3 rounded-lg font-bold">
              Edit Trips
            </button>

            <button className="bg-orange-500 text-white px-5 py-3 rounded-lg font-bold">
              Assign Drivers
            </button>

            <button
              onClick={confirmTrips}
              className="bg-green-600 text-white px-5 py-3 rounded-lg font-bold"
            >
              Confirm Trips
            </button>
          </div>
        </div>
      )}

      {confirmed && (
        <div className="bg-green-100 border border-green-500 text-green-800 rounded-xl p-6 mt-6">
          <h2 className="text-2xl font-bold">Trips Saved Successfully</h2>
          <p className="mt-2">
            Trips were automatically generated from active agents and saved to Supabase.
          </p>
        </div>
      )}
    </main>
  );
}
