import type { Branding } from "../../types/platform";

const DEFAULT_BRANDING: Branding = {
  primaryColor: "#061B33",
  secondaryColor: "#1E3A5F",
  appName: "GHO",
};

export function buildBranding(overrides?: Partial<Branding>): Branding {
  return {
    ...DEFAULT_BRANDING,
    ...(overrides || {}),
  };
}

export function validateBranding(branding: Branding): { valid: boolean; issues: string[] } {
  const issues: string[] = [];
  if (!branding.primaryColor.startsWith("#")) {
    issues.push("primaryColor must be a hex value.");
  }
  if (!branding.secondaryColor.startsWith("#")) {
    issues.push("secondaryColor must be a hex value.");
  }
  if (!branding.appName.trim()) {
    issues.push("appName is required.");
  }
  return {
    valid: issues.length === 0,
    issues,
  };
}
