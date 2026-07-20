import type {
  Branding,
  Company,
  FeatureFlag,
  Licensing,
  Platform,
  PlatformConfiguration,
  PlatformEvent,
  PlatformHealth,
  PlatformPermission,
  Subscription,
  TenantSettings,
} from "../../types/platform";

export type {
  Branding,
  Company,
  FeatureFlag,
  Licensing,
  Platform,
  PlatformConfiguration,
  PlatformEvent,
  PlatformHealth,
  PlatformPermission,
  Subscription,
  TenantSettings,
};

export interface PlatformContext {
  platform: Platform;
  company: Company;
  licensing: Licensing;
  permissions: PlatformPermission[];
}

export interface PlatformSnapshot {
  context: PlatformContext;
  health: PlatformHealth;
  recentEvents: PlatformEvent[];
}
