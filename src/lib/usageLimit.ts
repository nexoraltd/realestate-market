import Stripe from "stripe";

let _stripe: Stripe | null = null;
function getStripe(): Stripe {
  if (!_stripe) {
    _stripe = new Stripe((process.env.STRIPE_SECRET_KEY || "").trim(), {
      apiVersion: "2026-02-25.clover",
    });
  }
  return _stripe;
}

/** Monthly usage key format: estimate_2026-04 or search_2026-04 */
function usageKey(feature: string): string {
  const now = new Date();
  const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  return `${feature}_${month}`;
}

export interface UsageCheckResult {
  allowed: boolean;
  used: number;
  limit: number;
  remaining: number;
}

/**
 * Check and increment usage for a free-tier customer.
 * Returns null if the user is not a free member (paid users bypass limits).
 * Stores usage counts in Stripe customer metadata.
 */
export async function checkAndIncrementUsage(
  email: string | null,
  feature: "estimate" | "search",
  limits: { free: number; guest: number }
): Promise<{ result: UsageCheckResult; tier: string }> {
  // No email = guest (no limit tracking, controlled by frontend)
  if (!email) {
    return {
      result: { allowed: true, used: 0, limit: limits.guest, remaining: limits.guest },
      tier: "guest",
    };
  }

  // Look up customer
  const customers = await getStripe().customers.list({ email, limit: 1 });
  if (customers.data.length === 0) {
    return {
      result: { allowed: true, used: 0, limit: limits.guest, remaining: limits.guest },
      tier: "guest",
    };
  }

  const customer = customers.data[0];

  // Check for active subscription → paid users have no limits
  const subscriptions = await getStripe().subscriptions.list({
    customer: customer.id,
    status: "all",
    limit: 5,
  });
  const activeSub = subscriptions.data.find(
    (s) => s.status === "active" || s.status === "trialing"
  );
  if (activeSub) {
    return {
      result: { allowed: true, used: 0, limit: -1, remaining: -1 },
      tier: "paid",
    };
  }

  // Free member — check usage count
  const key = usageKey(feature);
  const used = parseInt(customer.metadata?.[key] || "0", 10);
  const limit = limits.free;
  const remaining = Math.max(0, limit - used);

  if (used >= limit) {
    return {
      result: { allowed: false, used, limit, remaining: 0 },
      tier: "free",
    };
  }

  // Increment usage
  await getStripe().customers.update(customer.id, {
    metadata: {
      ...customer.metadata,
      [key]: String(used + 1),
    },
  });

  return {
    result: { allowed: true, used: used + 1, limit, remaining: remaining - 1 },
    tier: "free",
  };
}
