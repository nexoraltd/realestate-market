import { supabaseAdmin } from "./supabase";

export interface UsageCheckResult {
  allowed: boolean;
  used: number;
  limit: number;
  remaining: number;
}

/**
 * Check and increment usage for a free-tier user.
 * Reads from Supabase realestate_users (fast single query vs 2+ Stripe API calls).
 * Paid users bypass limits. Guest (no email) = controlled by frontend.
 */
export async function checkAndIncrementUsage(
  email: string | null,
  feature: "estimate" | "search",
  limits: { free: number; guest: number }
): Promise<{ result: UsageCheckResult; tier: string }> {
  if (!email) {
    return {
      result: { allowed: true, used: 0, limit: limits.guest, remaining: limits.guest },
      tier: "guest",
    };
  }

  const { data: user } = await supabaseAdmin
    .from("realestate_users")
    .select("plan, usage_search, usage_estimate, usage_month")
    .eq("email", email)
    .single();

  if (!user) {
    // Unknown email → treat as guest
    return {
      result: { allowed: true, used: 0, limit: limits.guest, remaining: limits.guest },
      tier: "guest",
    };
  }

  // Paid users have no limits
  if (user.plan !== "free") {
    return {
      result: { allowed: true, used: 0, limit: -1, remaining: -1 },
      tier: "paid",
    };
  }

  const currentMonth = new Date().toISOString().slice(0, 7); // "YYYY-MM"
  const monthChanged = user.usage_month !== currentMonth;
  const usageCol = feature === "search" ? "usage_search" : "usage_estimate";
  const used = monthChanged ? 0 : (user[usageCol] as number);
  const limit = limits.free;

  if (used >= limit) {
    return {
      result: { allowed: false, used, limit, remaining: 0 },
      tier: "free",
    };
  }

  // Increment (and reset other col if month changed)
  const updateData: Record<string, unknown> = {
    [usageCol]: used + 1,
    usage_month: currentMonth,
    updated_at: new Date().toISOString(),
  };
  if (monthChanged) {
    const otherCol = feature === "search" ? "usage_estimate" : "usage_search";
    updateData[otherCol] = 0;
  }

  await supabaseAdmin
    .from("realestate_users")
    .update(updateData)
    .eq("email", email);

  const remaining = limit - used - 1;
  return {
    result: { allowed: true, used: used + 1, limit, remaining },
    tier: "free",
  };
}
