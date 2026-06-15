"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function RoutePlanningPage() {
  const [planningDate, setPlanningDate] = useState("");
  const [shift, setShift] = useState("");
  const [planningMode, setPlanningMode] = useState("By Area");
  const [agents, setAgents] = useState<any[]>([]);

  const loadAgents = async () => {
    const { data } = await supabase
      .from("agents")
      .select("*")
      .order("area");

    setAgents(data || []);
  };

  useEffect(() => {
    loadAgents();
  }, []);

  return (
    <main className="p-6">
      <Link
        href="/admin"
        className="inline-block bg-gray-200 px-4 py-2 rounded-lg mb-4"
      >
        ← Back to Dashboard
      </Link>

      <h1 className="text-3xl font-bold mb-4">Route Group Planning</h1>

      <div className="bg-white border rounded-xl p-4">
        <p className="text-gray-700">
          Plan staff transport by date, shift, area, vehicle capacity, and available drivers.
        </p>
      </div>

      <div className="bg-white border rounded-xl p-4 mt-4 grid gap-3 md:grid-cols-3">
        <input
          type="date"
          value={planningDate}
          onChange={(e) => setPlanningDate(e.target.value)}
          className="border p-3 rounded-lg"
        />

        <select
          value={shift}
          onChange={(e) => setShift(e.target.value)}
          className="border p-3 rounded-lg"
        >
          <option value="">Select Shift</option>
          <option value="Morning">Morning</option>
          <option value="Afternoon">Afternoon</option>
          <option value="Night">Night</option>
        </select>

        <select
          value={planningMode}
          onChange={(e) => setPlanningMode(e.target.value)}
          className="border p-3 rounded-lg"
        >
          <option>By Area</option>
          <option>By Route Group</option>
        </select>
      </div>

      <div className="bg-white border rounded-xl p-4 mt-4">
        <h2 className="font-bold mb-3">Available Agents</h2>

        <div className="grid gap-3">
          {agents.map((agent) => (
            <div key={agent.id} className="border rounded-lg p-3">
              <p><strong>Name:</strong> {agent.agent_name || agent.name || "N/A"}</p>
              <p><strong>Area:</strong> {agent.area || "N/A"}</p>
              <p><strong>Shift:</strong> {agent.shift || "N/A"}</p>
              <p><strong>Pickup:</strong> {agent.pickup_address || agent.home_address || "N/A"}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
