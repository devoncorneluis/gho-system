import type { FeatureFlag, Platform, SubscriptionTier } from "../../types/platform";

const BASE_FLAGS: FeatureFlag[] = [
  {
    key: "executive_dashboard",
    enabled: false,
    description: "Enable executive analytics dashboard.",
  },
  {
    key: "ai_dispatch",
    enabled: false,
    description: "Enable AI-assisted dispatch recommendations.",
  },
  {
    key: "route_playback",
    enabled: true,
    description: "Enable historical route playback.",
  },
  {
    key: "client_portal",
    enabled: false,
    description: "Enable customer-facing client portal.",
  },
  {
    key: "automation_control_tower",
    enabled: false,
    description: "Enable operations control tower automation UI.",
  },
  {
    key: "intelligence_delay_alerts",
    enabled: true,
    description: "Enable intelligence delay alerting.",
  },
];

const TIER_OVERRIDES: Record<SubscriptionTier, Partial<Record<FeatureFlag["key"], boolean>>> = {
  starter: {
    executive_dashboard: false,
    ai_dispatch: false,
    client_portal: false,
    automation_control_tower: false,
  },
  growth: {
    executive_dashboard: true,
    ai_dispatch: true,
    client_portal: true,
    automation_control_tower: true,
  },
  enterprise: {
    executive_dashboard: true,
    ai_dispatch: true,
    client_portal: true,
    automation_control_tower: true,
    route_playback: true,
  },
};

export function buildFeatureFlags(tier: SubscriptionTier, overrides?: Partial<Record<FeatureFlag["key"], boolean>>): FeatureFlag[] {
  const tierOverride = TIER_OVERRIDES[tier];
  return BASE_FLAGS.map((flag) => ({
    ...flag,
    enabled: overrides?.[flag.key] ?? tierOverride[flag.key] ?? flag.enabled,
  }));
}

export function isFeatureEnabled(flags: FeatureFlag[], key: FeatureFlag["key"]): boolean {
  return flags.find((flag) => flag.key === key)?.enabled ?? false;
}

export function isExecutiveDashboardEnabled(platform: Platform): boolean {
  return isFeatureEnabled(platform.featureFlags, "executive_dashboard");
}

export function isAiDispatchEnabled(platform: Platform): boolean {
  return isFeatureEnabled(platform.featureFlags, "ai_dispatch");
}

export function isRoutePlaybackEnabled(platform: Platform): boolean {
  return isFeatureEnabled(platform.featureFlags, "route_playback");
}

export function isClientPortalEnabled(platform: Platform): boolean {
  return isFeatureEnabled(platform.featureFlags, "client_portal");
}
