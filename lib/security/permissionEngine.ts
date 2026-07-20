import type { SecurityCapability, SecurityRole } from "./roleEngine";
import { mergeCapabilities } from "./roleEngine";

export interface PermissionContext {
  userId: string;
  platformId: string;
  tenantId: string;
  roles: SecurityRole[];
}

export interface PermissionDecision {
  allowed: boolean;
  reason: string;
}

export function authorizeCapability(
  context: PermissionContext,
  capability: SecurityCapability,
  requestedPlatformId: string
): PermissionDecision {
  if (context.platformId !== requestedPlatformId) {
    return {
      allowed: false,
      reason: "Platform isolation violation.",
    };
  }

  const capabilities = mergeCapabilities(context.roles);
  const allowed = capabilities.includes(capability);
  return {
    allowed,
    reason: allowed ? "Authorized." : "Missing capability.",
  };
}

export function authorizeAnyCapability(
  context: PermissionContext,
  capabilities: SecurityCapability[],
  requestedPlatformId: string
): PermissionDecision {
  for (const capability of capabilities) {
    const decision = authorizeCapability(context, capability, requestedPlatformId);
    if (decision.allowed) {
      return {
        allowed: true,
        reason: `Authorized via ${capability}.`,
      };
    }
  }

  return {
    allowed: false,
    reason: "No required capability granted.",
  };
}
