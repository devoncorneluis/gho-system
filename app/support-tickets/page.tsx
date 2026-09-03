"use client";

import { useCallback, useEffect, useState } from "react";
import { getUserPlatform } from "@/lib/getUserPlatform";
import { supabase } from "@/lib/supabase";

type SupportTicket = {
  id: string;
  trip_id: string | null;
  trip_code: string | null;
  driver_name: string | null;
  vehicle_name: string | null;
  vehicle_registration: string | null;
  priority: string | null;
  message: string | null;
  status: string | null;
};

export default function SupportTicketsPage() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [platformId, setPlatformId] = useState<string | null>(null);

  const loadTickets = useCallback(async () => {
    if (!platformId) return;

    const { data } = await supabase
      .from("support_tickets")
      .select("*")
      .eq("platform_id", platformId)
      .order("created_at", { ascending: false });

    setTickets(((data as SupportTicket[] | null) ?? []));
  }, [platformId]);

  const resolveTicket = async (id: string) => {
    if (!platformId) return;

    await supabase
      .from("support_tickets")
      .update({
        status: "Resolved",
        resolved_at: new Date().toISOString(),
      })
      .eq("platform_id", platformId)
      .eq("id", id);

    loadTickets();
  };

  const escalateToEmergency = async (ticket: SupportTicket) => {
    if (!platformId) return;

    const confirmEscalate = confirm("Escalate this support ticket to emergency?");
    if (!confirmEscalate) return;

    const { data: existingEmergency } = await supabase
      .from("emergency_alerts")
      .select("id")
      .eq("platform_id", platformId)
      .eq("trip_id", ticket.trip_id)
      .eq("status", "Open")
      .maybeSingle();

    if (existingEmergency) {
      alert("An open emergency already exists for this trip.");
      return;
    }

    const { error } = await supabase.from("emergency_alerts").insert({
      platform_id: platformId,
      trip_id: ticket.trip_id || null,
      trip_code: ticket.trip_code || null,
      driver_name: ticket.driver_name || null,
      vehicle_name: ticket.vehicle_name || null,
      vehicle_registration: ticket.vehicle_registration || null,
      alert_type: "Support Escalation",
      emergency_type: "Escalated Support Ticket",
      description: ticket.message || "Support ticket escalated to emergency.",
      status: "Open",
    });

    if (error) {
      alert("Escalation failed.");
      return;
    }

    await supabase
      .from("support_tickets")
      .update({ status: "Escalated" })
      .eq("platform_id", platformId)
      .eq("id", ticket.id);

    loadTickets();
  };

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
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadTickets();
  }, [loadTickets]);

  return (
    <main className="p-6">
      <h1 className="text-3xl font-bold mb-6">Support Tickets</h1>

      {tickets.length === 0 && (
        <div className="bg-gray-50 border rounded-xl p-6">
          No support tickets found.
        </div>
      )}

      <div className="grid gap-4">
        {tickets.map((ticket) => (
          <div key={ticket.id} className="bg-white border rounded-xl p-4 shadow">
            <div className="flex justify-between gap-3">
              <h2 className="font-bold">
                Trip: {ticket.trip_code || ticket.trip_id || "N/A"}
              </h2>

              <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-xs font-bold">
                {ticket.status}
              </span>
            </div>

            <p><strong>Driver:</strong> {ticket.driver_name || "N/A"}</p>
            <p><strong>Vehicle:</strong> {ticket.vehicle_name || "N/A"}</p>
            <p><strong>Registration:</strong> {ticket.vehicle_registration || "N/A"}</p>
            <p><strong>Priority:</strong> {ticket.priority || "Medium"}</p>
            <p><strong>Message:</strong> {ticket.message || "N/A"}</p>

            {ticket.status === "Open" && (
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => resolveTicket(ticket.id)}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg"
                >
                  Resolve
                </button>

                <button
                  onClick={() => escalateToEmergency(ticket)}
                  className="bg-red-700 text-white px-4 py-2 rounded-lg"
                >
                  Escalate to Emergency
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </main>
  );
}
