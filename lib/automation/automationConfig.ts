export interface AutomationConfig {
  schedulerTickMs: number;
  thresholds: {
    driverResponseOverdueMinutes: number;
    pickupOverdueMinutes: number;
    vehicleIdleMinutes: number;
    gpsOfflineMinutes: number;
    routeDeviationMinutes: number;
    tripDelayMinutes: number;
  };
  notificationDefaults: {
    audienceByOwner: Record<"dispatcher" | "operations" | "safety" | "executive" | "system", string[]>;
  };
}

export const DEFAULT_AUTOMATION_CONFIG: AutomationConfig = {
  schedulerTickMs: 1000,
  thresholds: {
    driverResponseOverdueMinutes: 5,
    pickupOverdueMinutes: 5,
    vehicleIdleMinutes: 15,
    gpsOfflineMinutes: 6,
    routeDeviationMinutes: 10,
    tripDelayMinutes: 5,
  },
  notificationDefaults: {
    audienceByOwner: {
      dispatcher: ["dispatch_team"],
      operations: ["operations_team"],
      safety: ["safety_team"],
      executive: ["executive_team"],
      system: ["automation_service"],
    },
  },
};

export function buildAutomationConfig(overrides?: Partial<AutomationConfig>): AutomationConfig {
  if (!overrides) return DEFAULT_AUTOMATION_CONFIG;

  return {
    ...DEFAULT_AUTOMATION_CONFIG,
    ...overrides,
    thresholds: {
      ...DEFAULT_AUTOMATION_CONFIG.thresholds,
      ...(overrides.thresholds || {}),
    },
    notificationDefaults: {
      ...DEFAULT_AUTOMATION_CONFIG.notificationDefaults,
      ...(overrides.notificationDefaults || {}),
      audienceByOwner: {
        ...DEFAULT_AUTOMATION_CONFIG.notificationDefaults.audienceByOwner,
        ...(overrides.notificationDefaults?.audienceByOwner || {}),
      },
    },
  };
}
