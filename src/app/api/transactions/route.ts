import { NextRequest, NextResponse } from "next/server";
import { getTransactions } from "@/lib/api";
import { checkApiAuth } from "@/lib/apiAuth";
import { STRIPE_PRICE_IDS } from "@/lib/plans";
import { checkAndIncrementUsage } from "@/lib/usageLimit";
import Stripe from "stripe";

async function resolvePlan(email: string): Promise<string | null> {
  const stripeKey = (process.env.STRIPE_SECRET_KEY || "").trim();
  if (!stripeKey) return null;
  const stripe = new Stripe(stripeKey, { apiVersion: "2026-02-25.clover" });
  const customers = await stripe.customers.list({ email, limit: 1 });
  if (customers.data.length === 0) return null;
  const subscriptions = await stripe.subscriptions.list({
    customer: customers.data[0].id,
    status: "all",
    limit: 5,
  });
  const activeSub = subscriptions.data.find(
    (s) => s.status === "active" || s.status === "trialing"
  );
  if (!activeSub) return null;
  const priceId = activeSub.items.data[0]?.price?.id;
  let plan = activeSub.metadata?.plan || null;
  if (!plan && priceId) {
    const match = Object.entries(STRIPE_PRICE_IDS).find(([, id]) => id === priceId);
    if (match) plan = match[0];
  }
  return plan;
}

export async function GET(request: NextRequest) {
  const authError = checkApiAuth(request);
  if (authError) return authError;

  const params = request.nextUrl.searchParams;
  const year = params.get("year");
  const quarter = params.get("quarter");
  const area = params.get("area");
  const city = params.get("city");
  const email = params.get("email");

  if (!year || !quarter) {
    return NextResponse.json(
      { error: "year and quarter are required" },
      { status: 400 }
    );
  }
  if (!area && !city) {
    return NextResponse.json(
      { error: "area or city is required" },
      { status: 400 }
    );
  }

  // Usage limit check for free members (monthly limit: 3 searches)
  if (email) {
    const { result: usage } = await checkAndIncrementUsage(email, "search", {
      free: 3,    // free members: 3 searches/month
      guest: 999, // guests: unlimited (gated by frontend)
    });
    if (!usage.allowed) {
      return NextResponse.json({
        error: "月間利用上限",
        message: `無料プランの相場検索は月${usage.limit}回までです。スタンダードプランにアップグレードすると無制限でご利用いただけます。`,
        usage,
      }, { status: 429 });
    }
  }

  // フリーユーザーは直近1四半期のみ許可
  if (email) {
    const plan = await resolvePlan(email);
    if (!plan) {
      const currentYear = new Date().getFullYear();
      const currentQuarter = Math.ceil((new Date().getMonth() + 1) / 3);
      // 現在より古い年、または現在より前の四半期（同年）はブロック
      const requestedYear = parseInt(year, 10);
      const requestedQuarter = parseInt(quarter, 10);
      if (
        requestedYear < currentYear ||
        (requestedYear === currentYear && requestedQuarter < currentQuarter)
      ) {
        return NextResponse.json(
          { error: "直近1四半期以前のデータはスタンダードプラン以上でご利用いただけます。" },
          { status: 403 }
        );
      }
    }
  }

  try {
    const transactions = await getTransactions({
      year,
      quarter,
      area: area || undefined,
      city: city || undefined,
    });
    return NextResponse.json(transactions);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch transactions" },
      { status: 500 }
    );
  }
}
