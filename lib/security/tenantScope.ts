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

export function applyTripMutationScope<T extends EqChain>(
  query: T,
  tripId: string,
  platformId: string
): T {
  return query.eq("id", tripId).eq("platform_id", platformId) as T;
}
