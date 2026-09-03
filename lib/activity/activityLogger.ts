import { supabase } from "../supabase";

export type ActivityLog = {
  platformId: string;
  activityType: string;
  entityType: string;
  entityId?: string;
  entityName?: string;
  description: string;
  createdBy?: string;
  createdByName?: string;
  metadata?: Record<string, unknown>;
};

export async function logActivity(
  activity: ActivityLog
) {
  const { error } = await supabase
    .from("activity_logs")
    .insert({
      platform_id: activity.platformId,
      activity_type: activity.activityType,
      entity_type: activity.entityType,
      entity_id: activity.entityId,
      entity_name: activity.entityName,
      description: activity.description,
      created_by: activity.createdBy,
      created_by_name: activity.createdByName,
      metadata: activity.metadata ?? {},
    });

  if (error) {
    console.error(
      "Failed to write activity log",
      error
    );
  }
}