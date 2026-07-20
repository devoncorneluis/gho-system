import type { SecurityCapability, SecurityRole } from "./roleEngine";

export interface SecurityPolicy {
  id: string;
  description: string;
  roles: SecurityRole[];
  capabilities: SecurityCapability[];
  enforcePlatformIsolation: boolean;
  requireSessionValidation: boolean;
}

export const SECURITY_POLICIES: SecurityPolicy[] = [
  {
    id: "dispatch-write-policy",
    description: "Only dispatcher/admin roles can update dispatch resources.",
    roles: ["dispatcher", "platform_admin", "super_admin"],
    capabilities: ["dispatch.write"],
    enforcePlatformIsolation: true,
    requireSessionValidation: true,
  },
  {
    id: "automation-execution-policy",
    description: "Automation actions require execution capability.",
    roles: ["dispatcher", "platform_admin", "super_admin"],
    capabilities: ["automation.execute"],
    enforcePlatformIsolation: true,
    requireSessionValidation: true,
  },
  {
    id: "audit-read-policy",
    description: "Audit records are restricted to admins and executives.",
    roles: ["executive", "platform_admin", "super_admin"],
    capabilities: ["security.audit.read"],
    enforcePlatformIsolation: true,
    requireSessionValidation: true,
  },
];

export function getSecurityPolicy(policyId: string): SecurityPolicy | undefined {
  return SECURITY_POLICIES.find((policy) => policy.id === policyId);
}
