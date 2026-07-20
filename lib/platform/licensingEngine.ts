import type { Licensing } from "../../types/platform";

export interface LicenseInput {
  key: string;
  maxPlatforms: number;
  maxUsers: number;
  expiresAt?: string;
}

export function buildLicensing(input: LicenseInput): Licensing {
  return {
    key: input.key,
    status: "valid",
    maxPlatforms: input.maxPlatforms,
    maxUsers: input.maxUsers,
    issuedAt: new Date().toISOString(),
    expiresAt: input.expiresAt,
  };
}

export function evaluateLicenseStatus(license: Licensing, nowIso = new Date().toISOString()): Licensing["status"] {
  if (!license.expiresAt) return license.status;
  const expiry = new Date(license.expiresAt).getTime();
  const now = new Date(nowIso).getTime();
  if (Number.isNaN(expiry) || Number.isNaN(now)) return license.status;
  return expiry < now ? "expired" : license.status;
}

export function canProvisionPlatform(license: Licensing, activePlatformCount: number): boolean {
  return license.status === "valid" && activePlatformCount < license.maxPlatforms;
}
