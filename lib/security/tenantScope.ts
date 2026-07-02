export type EqChain = {
  eq: (column: string, value: string) => EqChain;
};

export function assertPlatformScope(platformId?: string): string {
  const value = platformId?.trim();
  if (!value) {
    throw new Error("platformId is required for tenant-scoped trip mutation.");
  }

  return value;
}

export function applyEntityMutationScope<T extends EqChain>(
  query: T,
  entityId: string,
  platformId: string,
  idColumn = "id"
): T {
  return query.eq(idColumn, entityId).eq("platform_id", platformId) as T;
}

export function applyTripMutationScope<T extends EqChain>(
  query: T,
  tripId: string,
  platformId: string
): T {
  return applyEntityMutationScope(query, tripId, platformId);
}

export function applyEmergencyAlertMutationScope<T extends EqChain>(
  query: T,
  alertId: string,
  platformId: string
): T {
  return applyEntityMutationScope(query, alertId, platformId);
}
