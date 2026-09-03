import { supabase } from "../supabase";
import type { Incident } from "./incidentEngine";

type Listener = (incidents: Incident[]) => void;

type IncidentRow = {
  id: string;
  created_at: string;
  incident_type: Incident["type"];
  severity: Incident["severity"];
  status: Incident["status"];
  trip_code: string | null;
  driver_name: string | null;
  vehicle_name: string | null;
  description: string | null;
  assigned_to: string | null;
};

const listeners = new Set<Listener>();

async function notifyListeners(platformId: string) {
  const { data, error } = await supabase
    .from("incidents")
    .select("*")
    .eq("platform_id", platformId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
    return;
  }

const incidents: Incident[] = ((data as IncidentRow[] | null) ?? []).map((row) => ({
  id: row.id,
  createdAt: row.created_at,
  type: row.incident_type,
  severity: row.severity,
  status: row.status,
  tripCode: row.trip_code ?? undefined,
  driverName: row.driver_name ?? undefined,
  vehicleName: row.vehicle_name ?? undefined,
  description: row.description ?? "",
  assigned_to: row.assigned_to ?? undefined,
}));

  listeners.forEach((listener) => listener(incidents));
}

export async function addIncident(
  incident: Incident,
  platformId: string
) {
  const { error } = await supabase
    .from("incidents")
    .insert({
      platform_id: platformId,
      incident_type: incident.type,
      severity: incident.severity,
      status: incident.status,
      trip_code: incident.tripCode,
      driver_name: incident.driverName,
      vehicle_name: incident.vehicleName,
      description: incident.description,
    });

  if (error) {
    console.error(error);
    return;
  }

  await notifyListeners(platformId);
}

export function subscribeToIncidents(
  platformId: string,
  listener: Listener
) {
  listeners.add(listener);

  notifyListeners(platformId);

  const channel = supabase
    .channel(`incidents-${platformId}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "incidents",
      },
      () => {
        notifyListeners(platformId);
      }
    )
    .subscribe();

  return () => {
    listeners.delete(listener);
    supabase.removeChannel(channel);
  };
}

export async function resolveIncident(
  id: string,
  platformId: string
) {
  const { error } = await supabase
    .from("incidents")
    .update({
      status: "Resolved",
      resolved_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("platform_id", platformId);

  if (error) {
    console.error(error);
    return;
  }

  await notifyListeners(platformId);
}