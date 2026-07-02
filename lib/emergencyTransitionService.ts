import {
  applyEmergencyAlertMutationScope,
  assertPlatformScope,
} from "./security/tenantScope";

export type EmergencyTransition = "acknowledge" | "assign" | "resolve";

type TransitionContext = {
  assignedAgent?: string;
  resolutionNotes?: string;
};

type EmergencyTransitionPayload = {
  updateData: Record<string, unknown>;
  auditAction: string;
  auditDetails: Record<string, unknown>;
};

export type EmergencyTransitionInput = {
  alertId: string;
  platformId?: string;
  actorUserId?: string | null;
  assignedAgent?: string;
  resolutionNotes?: string;
};

export type EmergencyTransitionDependencies = {
  mutateAlert?: (
    alertId: string,
    platformId: string,
    updateData: Record<string, unknown>
  ) => Promise<void>;
  auditLogger?: (event: {
    platform_id?: string | null;
    user_id?: string | null;
    entity_type: string;
    entity_id: string;
    action: string;
    details?: Record<string, unknown>;
  }) => Promise<void>;
  now?: () => string;
};

function validateAssignedAgent(value?: string): string {
  const normalized = value?.trim();
  if (!normalized) {
    throw new Error("assignedAgent is required for assign transition.");
  }

  return normalized;
}

function validateResolutionNotes(value?: string): string {
  const normalized = value?.trim();
  if (!normalized) {
    throw new Error("resolutionNotes is required for resolve transition.");
  }

  return normalized;
}

export function buildEmergencyTransitionPayload(
  transition: EmergencyTransition,
  occurredAt: string,
  context?: TransitionContext
): EmergencyTransitionPayload {
  if (transition === "acknowledge") {
    return {
      updateData: {
        status: "Acknowledged",
        acknowledged_at: occurredAt,
      },
      auditAction: "emergency_alert_acknowledged",
      auditDetails: {
        status_to: "Acknowledged",
      },
    };
  }

  if (transition === "assign") {
    const assignedAgent = validateAssignedAgent(context?.assignedAgent);

    return {
      updateData: {
        status: "Response Assigned",
        assigned_agent: assignedAgent,
      },
      auditAction: "emergency_alert_assigned",
      auditDetails: {
        status_to: "Response Assigned",
        assigned_agent: assignedAgent,
      },
    };
  }

  const resolutionNotes = validateResolutionNotes(context?.resolutionNotes);

  return {
    updateData: {
      status: "Resolved",
      resolved_at: occurredAt,
      resolution_notes: resolutionNotes,
    },
    auditAction: "emergency_alert_resolved",
    auditDetails: {
      status_to: "Resolved",
      resolution_notes: resolutionNotes,
    },
  };
}

async function mutateEmergencyAlert(
  alertId: string,
  platformId: string,
  updateData: Record<string, unknown>
): Promise<void> {
  const { supabase } = await import("./supabase");

  const { error } = await applyEmergencyAlertMutationScope(
    supabase
      .from("emergency_alerts")
      .update(updateData),
    alertId,
    platformId
  );

  if (error) {
    throw error;
  }
}

export async function transitionEmergencyAlert(
  transition: EmergencyTransition,
  input: EmergencyTransitionInput,
  dependencies?: EmergencyTransitionDependencies
): Promise<void> {
  const scopedPlatformId = assertPlatformScope(input.platformId);
  const occurredAt = dependencies?.now?.() ?? new Date().toISOString();
  const payload = buildEmergencyTransitionPayload(transition, occurredAt, {
    assignedAgent: input.assignedAgent,
    resolutionNotes: input.resolutionNotes,
  });

  const mutateAlert = dependencies?.mutateAlert ?? mutateEmergencyAlert;
  const auditLogger = dependencies?.auditLogger
    ?? (await import("./auditService")).logAuditEvent;

  await mutateAlert(input.alertId, scopedPlatformId, payload.updateData);
  await auditLogger({
    platform_id: scopedPlatformId,
    user_id: input.actorUserId ?? null,
    entity_type: "emergency_alert",
    entity_id: input.alertId,
    action: payload.auditAction,
    details: payload.auditDetails,
  });
}
