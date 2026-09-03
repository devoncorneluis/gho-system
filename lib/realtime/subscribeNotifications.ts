import { subscribeTable } from "./realtimeManager";

export function subscribeNotifications(
  callback: () => void
) {
  return subscribeTable(
    "notifications",
    callback
  );
}