import { notify } from "./notify";

type NotifyDriverArgs = {
  platformId: string;
  driverId?: string | null;
  tripCode: string;
};

export async function notifyDriver({
  platformId,
  driverId,
  tripCode,
}: NotifyDriverArgs) {
  await notify({
    platformId,
    recipientId: driverId ?? null,
    recipientRole: "driver",
    type: "trip_assigned",
    entity: tripCode,
  });
}