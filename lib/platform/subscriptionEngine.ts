import type { Subscription, SubscriptionTier } from "../../types/platform";

export interface SubscriptionInput {
  id: string;
  tier: SubscriptionTier;
  status?: Subscription["status"];
  billingCycle?: Subscription["billingCycle"];
  seats?: number;
  renewsAt?: string;
}

export function buildSubscription(input: SubscriptionInput): Subscription {
  return {
    id: input.id,
    tier: input.tier,
    status: input.status || "trialing",
    billingCycle: input.billingCycle || "monthly",
    seats: input.seats ?? 25,
    startedAt: new Date().toISOString(),
    renewsAt: input.renewsAt,
  };
}

export function canUseEnterpriseCapabilities(subscription: Subscription): boolean {
  return subscription.tier === "enterprise" && subscription.status === "active";
}

export function isSubscriptionActive(subscription: Subscription): boolean {
  return subscription.status === "active" || subscription.status === "trialing";
}
