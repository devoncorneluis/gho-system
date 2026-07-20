import type {
  Company,
  Licensing,
  Platform,
  PlatformPermission,
  Subscription,
  SubscriptionTier,
  TenantSettings,
} from "../../types/platform";
import { buildBranding } from "./brandingEngine";
import { buildCompany } from "./companyEngine";
import { getPlatformConfiguration, mergePlatformConfiguration } from "./configurationEngine";
import { buildFeatureFlags } from "./featureFlagEngine";
import { buildLicensing } from "./licensingEngine";
import { getPermissionsForRole } from "./permissionsEngine";
import { buildSubscription } from "./subscriptionEngine";

export interface TenantBootstrapInput {
  platformId: string;
  companyId: string;
  platformName: string;
  companyName: string;
  tier: SubscriptionTier;
  timezone?: string;
  locale?: string;
}

export interface TenantBootstrapResult {
  platform: Platform;
  company: Company;
  subscription: Subscription;
  licensing: Licensing;
  permissions: PlatformPermission[];
}

function buildTenantSettings(input: TenantBootstrapInput): TenantSettings {
  return {
    timezone: input.timezone || "Africa/Johannesburg",
    locale: input.locale || "en-ZA",
    workingHours: {
      start: "06:00",
      end: "20:00",
      days: ["mon", "tue", "wed", "thu", "fri", "sat"],
    },
    notificationPolicy: {
      channels: ["operations_dashboard", "driver_dashboard", "email"],
      escalationOwners: {
        dispatcher: ["dispatch_team"],
        operations: ["operations_team"],
        safety: ["safety_team"],
        executive: ["executive_team"],
        system: ["automation_service"],
      },
    },
  };
}

export function bootstrapTenant(input: TenantBootstrapInput): TenantBootstrapResult {
  const company = buildCompany({
    id: input.companyId,
    name: input.companyName,
  });

  const subscription = buildSubscription({
    id: `${input.platformId}-sub`,
    tier: input.tier,
    status: "active",
  });

  const baseConfig = getPlatformConfiguration(subscription.tier);
  const tenantSettings = buildTenantSettings(input);
  const config = mergePlatformConfiguration(baseConfig, {
    workingHours: tenantSettings.workingHours,
    billing: {
      cycle: subscription.billingCycle,
    },
    notificationPolicy: {
      defaultChannels: tenantSettings.notificationPolicy.channels,
    },
  });

  const platform: Platform = {
    id: input.platformId,
    companyId: company.id,
    name: input.platformName,
    status: "active",
    branding: buildBranding({ appName: input.platformName }),
    tenantSettings,
    subscription,
    featureFlags: buildFeatureFlags(subscription.tier),
    configuration: config,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const licensing = buildLicensing({
    key: `${input.platformId}-license`,
    maxPlatforms: subscription.tier === "enterprise" ? 50 : 10,
    maxUsers: subscription.tier === "enterprise" ? 5000 : 500,
  });

  const permissions: PlatformPermission[] = [
    getPermissionsForRole("platform_admin"),
    getPermissionsForRole("dispatcher"),
    getPermissionsForRole("driver"),
    getPermissionsForRole("client"),
    getPermissionsForRole("executive"),
  ];

  return {
    platform,
    company,
    subscription,
    licensing,
    permissions,
  };
}
