import { auth, currentUser } from "@clerk/nextjs/server";
import { supabaseAdmin } from "./supabase";

/**
 * Clerk-backed auth resolver for API routes.
 *
 * Returns the authenticated user's primary email, or null if not signed in.
 * Also ensures a row exists in `realestate_users` keyed by email
 * with `clerk_user_id` set — preserving existing premium / stripe data.
 */
export async function getAuthEmail(): Promise<string | null> {
  const { userId } = await auth();
  if (!userId) return null;

  const user = await currentUser();
  const email =
    user?.emailAddresses?.find((e) => e.id === user.primaryEmailAddressId)
      ?.emailAddress ?? user?.emailAddresses?.[0]?.emailAddress ?? null;

  if (!email) return null;

  // Best-effort: link Clerk userId to the existing realestate_users row.
  // Premium status (plan, stripe_customer_id, current_period_end) is preserved
  // because we match on email, never overwriting those columns.
  try {
    await supabaseAdmin
      .from("realestate_users")
      .upsert(
        { email, clerk_user_id: userId, plan: "free" },
        { onConflict: "email", ignoreDuplicates: false }
      )
      // Avoid clobbering plan if already set by webhook — only patch clerk_user_id
      .select();
    await supabaseAdmin
      .from("realestate_users")
      .update({ clerk_user_id: userId })
      .eq("email", email);
  } catch (err) {
    console.error("[clerkAuth] linking error (non-fatal):", err);
  }

  return email;
}

/**
 * Returns the authenticated user's Clerk userId, or null if not signed in.
 */
export async function getAuthUserId(): Promise<string | null> {
  const { userId } = await auth();
  return userId ?? null;
}
