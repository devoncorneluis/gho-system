export type SubscriptionTier = "starter" | "growth" | "enterprise";

export interface Company {
  id: string;
  name: string;
  legalName?: string;
  contactEmail?: string;
  country?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Branding {
  primaryColor: string;
  secondaryColor: string;
  logoUrl?: string;
  faviconUrl?: string;
  appName: string;
}

export interface TenantSettings {
  timezone: string;
  locale: string;
  workingHours: {
    start: string;
    end: string;
    days: Array<"mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun">;
  };
  notificationPolicy: {
    channels: Array<"operations_dashboard" | "driver_dashboard" | "client_portal" | "executive_dashboard" | "email" | "sms" | "push">;
    escalationOwners: Record<"dispatcher" | "operations" | "safety" | "executive" | "system", string[]>;
  };
}

export interface FeatureFlag {
  key:
    | "executive_dashboard"
    | "ai_dispatch"
    | "route_playback"
    | "client_portal"
    | "automation_control_tower"
    | "intelligence_delay_alerts";
  enabled: boolean;
  description: string;
}

export interface Subscription {
  id: string;
  tier: SubscriptionTier;
  status: "active" | "trialing" | "past_due" | "cancelled";
  billingCycle: "monthly" | "quarterly" | "yearly";
  seats: number;
  startedAt: string;
  renewsAt?: string;
}

export interface Licensing {
  key: string;
  status: "valid" | "expired" | "suspended";
  maxPlatforms: number;
  maxUsers: number;
  issuedAt: string;
  expiresAt?: string;
}

export interface PlatformConfiguration {
  sla: {
    driverResponseMinutes: number;
    pickupMinutes: number;
  };
  thresholds: {
    delayMinutes: number;
    riskScoreHigh: number;
    riskScoreCritical: number;
  };
  automation: {
    schedulerTickMs: number;
    evaluationIntervalMs: number;
  };
  notificationPolicy: {
    defaultChannels: Array<"operations_dashboard" | "driver_dashboard" | "client_portal" | "executive_dashboard" | "email" | "sms" | "push">;
  };
  workingHours: TenantSettings["workingHours"];
  billing: {
    cycle: Subscription["billingCycle"];
  };
}

export interface Platform {
  id: string;
  companyId: string;
  name: string;
  status: "active" | "maintenance" | "suspended";
  branding: Branding;
  tenantSettings: TenantSettings;
  subscription: Subscription;
  featureFlags: FeatureFlag[];
  configuration: PlatformConfiguration;
  createdAt: string;
  updatedAt: string;
}

export interface PlatformPermission {
  role: "super_admin" | "platform_admin" | "dispatcher" | "driver" | "client" | "executive";
  capabilities: string[];
}

export interface PlatformHealthCheck {
  component: "database" | "realtime" | "maps" | "automation" | "intelligence" | "queues";
  status: "healthy" | "degraded" | "down";
  latencyMs?: number;
  message?: string;
  checkedAt: string;
}

export interface PlatformHealth {
  platformId: string;
  overallStatus: "healthy" | "degraded" | "down";
  checks: PlatformHealthCheck[];
  checkedAt: string;
}

export interface PlatformEvent {
  id: string;
  platformId: string;
  type:
    | "platform_created"
    | "platform_updated"
    | "subscription_changed"
    | "feature_flag_changed"
    | "license_updated"
    | "health_degraded"
    | "health_restored";
  source: "system" | "admin" | "automation" | "billing";
  payload: Record<string, unknown>;
  createdAt: string;
}
