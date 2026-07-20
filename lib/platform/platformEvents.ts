import type { PlatformEvent } from "../../types/platform";

export interface PlatformEventInput {
  platformId: string;
  type: PlatformEvent["type"];
  source: PlatformEvent["source"];
  payload?: Record<string, unknown>;
}

export function createPlatformEvent(input: PlatformEventInput): PlatformEvent {
  return {
    id: `${input.type}-${Date.now()}`,
    platformId: input.platformId,
    type: input.type,
    source: input.source,
    payload: input.payload || {},
    createdAt: new Date().toISOString(),
  };
}

export function appendPlatformEvent(events: PlatformEvent[], event: PlatformEvent): PlatformEvent[] {
  return [event, ...events].slice(0, 100);
}
