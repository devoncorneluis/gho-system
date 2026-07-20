export type SecurityRole =
  | "super_admin"
  | "platform_admin"
  | "dispatcher"
  | "driver"
  | "client"
  | "executive";

export type SecurityCapability =
  | "platform.read"
  | "platform.write"
  | "dispatch.read"
  | "dispatch.write"
  | "automation.execute"
  | "intelligence.read"
  | "security.audit.read"
  | "security.audit.write"
  | "session.invalidate";

const ROLE_CAPABILITIES: Record<SecurityRole, SecurityCapability[]> = {
  super_admin: [
    "platform.read",
    "platform.write",
    "dispatch.read",
    "dispatch.write",
    "automation.execute",
    "intelligence.read",
    "security.audit.read",
    "security.audit.write",
    "session.invalidate",
  ],
  platform_admin: [
    "platform.read",
    "platform.write",
    "dispatch.read",
    "dispatch.write",
    "automation.execute",
    "intelligence.read",
    "security.audit.read",
  ],
  dispatcher: ["dispatch.read", "dispatch.write", "automation.execute", "intelligence.read"],
  driver: ["dispatch.read"],
  client: ["dispatch.read"],
  executive: ["platform.read", "dispatch.read", "intelligence.read", "security.audit.read"],
};

export function getRoleCapabilities(role: SecurityRole): SecurityCapability[] {
  return ROLE_CAPABILITIES[role];
}

export function hasRoleCapability(role: SecurityRole, capability: SecurityCapability): boolean {
  return ROLE_CAPABILITIES[role].includes(capability);
}

export function mergeCapabilities(roles: SecurityRole[]): SecurityCapability[] {
  const merged = new Set<SecurityCapability>();
  for (const role of roles) {
    for (const capability of ROLE_CAPABILITIES[role]) {
      merged.add(capability);
    }
  }
  return [...merged];
}
