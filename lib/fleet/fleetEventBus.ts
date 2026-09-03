import type { FleetEvent } from "./fleetEventEngine";

type Listener = (event: FleetEvent) => void;

const listeners = new Set<Listener>();

export function subscribeToFleetEvents(listener: Listener) {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}

export function publishFleetEvent(event: FleetEvent) {
  listeners.forEach((listener) => listener(event));
}