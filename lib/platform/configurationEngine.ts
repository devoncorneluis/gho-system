import type { PlatformConfiguration, SubscriptionTier, TenantSettings } from "../../types/platform";

const BASE_WORKING_HOURS: TenantSettings["workingHours"] = {
  start: "06:00",
  end: "20:00",
  days: ["mon", "tue", "wed", "thu", "fri", "sat"],
};

const BASE_NOTIFICATION_CHANNELS: PlatformConfiguration["notificationPolicy"]["defaultChannels"] = [
  "operations_dashboard",
  "driver_dashboard",
  "client_portal",
  "executive_dashboard",
  "email",
];

const TIER_CONFIG: Record<SubscriptionTier, PlatformConfiguration> = {
  starter: {
    sla: {
      driverResponseMinutes: 7,
      pickupMinutes: 12,
    },
    thresholds: {
      delayMinutes: 8,
      riskScoreHigh: 65,
      riskScoreCritical: 85,
    },
    automation: {
      schedulerTickMs: 1500,
      evaluationIntervalMs: 12000,
    },
    notificationPolicy: {
      defaultChannels: BASE_NOTIFICATION_CHANNELS,
    },
    workingHours: BASE_WORKING_HOURS,
    billing: {
      cycle: "monthly",
    },
  },
  growth: {
    sla: {
      driverResponseMinutes: 5,
      pickupMinutes: 10,
    },
    thresholds: {
      delayMinutes: 6,
      riskScoreHigh: 60,
      riskScoreCritical: 80,
    },
    automation: {
      schedulerTickMs: 1000,
      evaluationIntervalMs: 10000,
    },
    notificationPolicy: {
      defaultChannels: [...BASE_NOTIFICATION_CHANNELS, "push"],
    },
    workingHours: BASE_WORKING_HOURS,
    billing: {
      cycle: "monthly",
    },
  },
  enterprise: {
    sla: {
      driverResponseMinutes: 4,
      pickupMinutes: 8,
    },
    thresholds: {
      delayMinutes: 5,
      riskScoreHigh: 55,
      riskScoreCritical: 75,
    },
    automation: {
      schedulerTickMs: 750,
      evaluationIntervalMs: 8000,
    },
    notificationPolicy: {
      defaultChannels: [...BASE_NOTIFICATION_CHANNELS, "push", "sms"],
    },
    workingHours: {
      ...BASE_WORKING_HOURS,
      days: ["mon", "tue", "wed", "thu", "fri", "sat", "sun"],
    },
    billing: {
      cycle: "yearly",
    },
  },
};

export function getPlatformConfiguration(tier: SubscriptionTier): PlatformConfiguration {
  return TIER_CONFIG[tier];
}

export function mergePlatformConfiguration(
  base: PlatformConfiguration,
  overrides?: Partial<PlatformConfiguration>
): PlatformConfiguration {
  if (!overrides) return base;

  return {
    ...base,
    ...overrides,
    sla: {
      ...base.sla,
      ...(overrides.sla || {}),
    },
    thresholds: {
      ...base.thresholds,
      ...(overrides.thresholds || {}),
    },
    automation: {
      ...base.automation,
      ...(overrides.automation || {}),
    },
    notificationPolicy: {
      ...base.notificationPolicy,
      ...(overrides.notificationPolicy || {}),
      defaultChannels:
        overrides.notificationPolicy?.defaultChannels ||
        base.notificationPolicy.defaultChannels,
    },
    workingHours: {
      ...base.workingHours,
      ...(overrides.workingHours || {}),
      days: overrides.workingHours?.days || base.workingHours.days,
    },
    billing: {
      ...base.billing,
      ...(overrides.billing || {}),
    },
  };
}
