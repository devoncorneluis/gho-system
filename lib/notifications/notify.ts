import { supabase } from "../supabase";
import { NotificationType } from "./notificationTypes";
import { formatNotification } from "./notificationFormatter";

type NotifyArgs = {
  platformId: string;
  recipientId?: string | null;
  recipientRole?: string | null;
  type: NotificationType;
  entity: string;
};

export async function notify({
  platformId,
  recipientId,
  recipientRole,
  type,
  entity,
}: NotifyArgs) {
  const notification = formatNotification(type, entity);

  const { error } = await supabase
    .from("notifications")
    .insert({
      platform_id: platformId,
      recipient_id: recipientId ?? null,
      recipient_role: recipientRole ?? null,
      title: notification.title,
      message: notification.message,
      notification_type: type,
      is_read: false,
    });

  if (error) {
    throw error;
  }
}