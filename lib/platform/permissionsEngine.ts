import type { PlatformPermission } from "../../types/platform";

const ROLE_CAPABILITIES: Record<PlatformPermission["role"], string[]> = {
  super_admin: ["platform.manage", "billing.manage", "users.manage", "security.review"],
  platform_admin: ["platform.read", "platform.update", "dispatch.manage", "reports.view"],
  dispatcher: ["dispatch.manage", "trips.manage", "automation.actions"],
  driver: ["trips.view", "status.update"],
  client: ["portal.view", "trips.view"],
  executive: ["analytics.view", "executive.dashboard"],
};

export function getPermissionsForRole(role: PlatformPermission["role"]): PlatformPermission {
  return {
    role,
    capabilities: ROLE_CAPABILITIES[role],
  };
}

export function canAccessCapability(permissions: PlatformPermission[], capability: string): boolean {
  return permissions.some((permission) => permission.capabilities.includes(capability));
}

export function mergePermissions(...permissionSets: PlatformPermission[][]): PlatformPermission[] {
  const all = permissionSets.flat();
  const byRole = new Map<PlatformPermission["role"], Set<string>>();

  for (const permission of all) {
    if (!byRole.has(permission.role)) {
      byRole.set(permission.role, new Set());
    }
    for (const capability of permission.capabilities) {
      byRole.get(permission.role)?.add(capability);
    }
  }

  return [...byRole.entries()].map(([role, capabilities]) => ({
    role,
    capabilities: [...capabilities],
  }));
}
