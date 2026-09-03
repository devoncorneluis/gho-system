import { supabase } from "../supabase";
import { ActivityType } from "./activityTypes";
import { formatActivityDescription } from "./activityFormatter";

type LogActivityArgs = {
  platformId: string;
  activityType: ActivityType;
  entityType: string;
  entityId: string;
  entityName: string;
  createdById?: string;
  createdByName?: string;
};

export async function logActivity({
  platformId,
  activityType,
  entityType,
  entityId,
  entityName,
  createdById,
  createdByName,
}: LogActivityArgs) {
  const description = formatActivityDescription(
    activityType,
    entityName
  );

  const { error } = await supabase
    .from("activity_logs")
    .insert({
      platform_id: platformId,
      activity_type: activityType,
      entity_type: entityType,
      entity_id: entityId,
      entity_name: entityName,
      description,
      created_by: createdById ?? null,
      created_by_name: createdByName ?? "System",
    });

  if (error) {
    console.error("Activity Log Error:", error);
    throw error;
  }
}