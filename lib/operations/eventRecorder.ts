import type { TimelineEvent } from "./timelineService";

const events: TimelineEvent[] = [];

export function recordTimelineEvent(
  event: Omit<TimelineEvent, "id" | "createdAt">
) {
  events.unshift({
    ...event,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  });
}

export function getRecordedTimelineEvents() {
  return events;
}

export function clearTimelineEvents() {
  events.length = 0;
}