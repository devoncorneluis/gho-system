import { subscribeTable } from "./realtimeManager";

export function subscribeActivity(
  callback: () => void
) {
  return subscribeTable(
    "activity_logs",
    callback
  );
}