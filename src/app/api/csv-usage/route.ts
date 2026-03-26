import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { STRIPE_PRICE_IDS } from "@/lib/plans";
import { getPermissions } from "@/lib/planPermissions";
import { checkApiAuth } from "@/lib/apiAuth";

export const dynamic = "force-dynamic";

function currentMonthKey(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

/**
 * GET /api/csv-usage?email=xxx
 * 現在の月のCSVダウンロード使用状況を返す
 */
export async function GET(req: NextRequest) {
  const authError = checkApiAuth(req);
  if (authError) return authError;

  const email = req.nextUrl.searchParams.get("email");
  if (!email) {
    return NextResponse.json({ error: "email is required" }, { status: 400 });
  }

  const stripeKey = (process.env.STRIPE_SECRET_KEY || "").trim();
  if (!stripeKey) {
    return NextResponse.json({ used: 0, limit: -1, remaining: -1 });
  }

  const stripe = new Stripe(stripeKey, {
    apiVersion: "2026-02-25.clover",
  });

  try {
    const customers = await stripe.customers.list({ email, limit: 1 });
    if (customers.data.length === 0) {
      return NextResponse.json({ used: 0, limit: 100, remaining: 100 });
    }

    const customer = customers.data[0];

    // プラン判定
    const subscriptions = await stripe.subscriptions.list({
      customer: customer.id,
      status: "all",
      limit: 5,
    });

    const activeSub = subscriptions.data.find(
      (s) => s.status === "active" || s.status === "trialing"
    );

    let plan: string | null = null;
    if (activeSub) {
      const priceId = activeSub.items.data[0]?.price?.id;
      plan = activeSub.metadata?.plan || null;
      if (!plan && priceId) {
        const match = Object.entries(STRIPE_PRICE_IDS).find(([, id]) => id === priceId);
        if (match) plan = match[0];
      }
    }

    const perms = getPermissions(plan);
    const monthKey = currentMonthKey();
    const metaKey = `csv_downloads_${monthKey}`;
    const used = Number(customer.metadata?.[metaKey] || "0");

    if (perms.csvMonthlyLimit === -1) {
      return NextResponse.json({ used, limit: -1, remaining: -1 });
    }

    return NextResponse.json({
      used,
      limit: perms.csvMonthlyLimit,
      remaining: Math.max(0, perms.csvMonthlyLimit - used),
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[csv-usage] error:", message);
    return NextResponse.json(
      { error: "CSV使用状況の取得に失敗しました" },
      { status: 500 }
    );
  }
}
