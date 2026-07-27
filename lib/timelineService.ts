import { supabase } from "./supabase";
export interface TimelineEvent {
  id: string;
  title: string;
  description: string;
  actor: string;
  createdAt: string;
  severity: "info" | "success" | "warning" | "danger";
}

const EVENT_CONFIG: Record<
  string,
  {
    title: string;
    severity: TimelineEvent["severity"];
  }
> = {
  trip_created: {
    title: "Trip Created",
    severity: "info",
  },
  trip_approved: {
    title: "Trip Approved",
    severity: "success",
  },
  trip_dispatched: {
    title: "Trip Dispatched",
    severity: "success",
  },
  driver_assigned: {
    title: "Driver Assigned",
    severity: "info",
  },
  driver_reassigned: {
    title: "Driver Reassigned",
    severity: "warning",
  },
  driver_accepted: {
    title: "Driver Accepted",
    severity: "success",
  },
  driver_declined: {
    title: "Driver Declined",
    severity: "danger",
  },
  trip_started: {
    title: "Trip Started",
    severity: "info",
  },
  trip_completed: {
    title: "Trip Completed",
    severity: "success",
  },
  trip_cancelled: {
    title: "Trip Cancelled",
    severity: "danger",
  },
  emergency_raised: {
    title: "Emergency Raised",
    severity: "danger",
  },
  emergency_resolved: {
    title: "Emergency Resolved",
    severity: "success",
  },
};

export async function getOperationsTimeline(): Promise<TimelineEvent[]> {
  const { data, error } = await supabase
    .from("trip_events")
    .select(
      `
        id,
        event_type,
        event_data,
        created_at,
        created_by
      `
    )
    .order("created_at", { ascending: false })
    .limit(50);

  if (error || !data) {
    console.error("Timeline load failed", error);
    return [];
  }

  return data.map((event) => {
    const config = EVENT_CONFIG[event.event_type] ?? {
      title: event.event_type.replace(/_/g, " "),
      severity: "info" as const,
    };

    const details = (event.event_data ?? {}) as Record<string, unknown>;

    return {
      id: event.id,
      title: config.title,
      description:
        typeof details.description === "string"
          ? details.description
          : JSON.stringify(details),
      actor: event.created_by ?? "System",
      createdAt: event.created_at,
      severity: config.severity,
    };
  });
}