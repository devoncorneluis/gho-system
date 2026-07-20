import type { EventTimelinePoint } from "./observabilityTypes";
import { listTelemetryEvents, seedDemoTelemetryEvents } from "./telemetryEngine";

function toBucketIso(value: string): string {
  const d = new Date(value);
  d.setMinutes(0, 0, 0);
  return d.toISOString();
}

export function getEventTimeline(platformId = "platform-demo", maxBuckets = 12): EventTimelinePoint[] {
  seedDemoTelemetryEvents(platformId);
  const events = listTelemetryEvents(platformId);

  const buckets = new Map<string, EventTimelinePoint>();

  for (const event of events) {
    const bucketIso = toBucketIso(event.happenedAt);
    const current = buckets.get(bucketIso) ?? {
      bucketIso,
      total: 0,
      blocked: 0,
      caution: 0,
      failed: 0,
    };

    current.total += 1;
    if (event.outcome === "blocked") current.blocked += 1;
    if (event.outcome === "caution") current.caution += 1;
    if (event.outcome === "failed") current.failed += 1;

    buckets.set(bucketIso, current);
  }

  return [...buckets.values()]
    .sort((a, b) => (a.bucketIso < b.bucketIso ? -1 : 1))
    .slice(-maxBuckets);
}
