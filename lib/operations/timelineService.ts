export type TimelineSeverity =
  | "info"
  | "success"
  | "warning"
  | "danger";

export interface TimelineEvent {
  id: string;
  tripId: string | null;
  tripCode: string | null;

  type:
    | "dispatch"
    | "driver"
    | "trip"
    | "gps"
    | "emergency"
    | "passenger"
    | "automation";

  title: string;
  description: string;

  severity: TimelineSeverity;

  createdAt: string;

  actor: string;
}

export async function getOperationsTimeline(): Promise<TimelineEvent[]> {
  // Production version will read from Supabase.
  // Returning an empty array keeps the service ready
  // while we integrate event recording in later steps.

  return [];
}