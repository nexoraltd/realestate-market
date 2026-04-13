import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { STRIPE_PRICE_IDS } from "@/lib/plans";

export const dynamic = "force-dynamic";

/**
 * GET /api/subscription?email=xxx
 * メールアドレスからStripe顧客を検索し、有効なサブスクリプション状態を返す。
 */
export async function GET(req: NextRequest) {
  try {
    const key = (process.env.STRIPE_SECRET_KEY || "").trim();
    if (!key) {
      return NextResponse.json({ error: "STRIPE_SECRET_KEY is not set" }, { status: 500 });
    }

    const stripe = new Stripe(key, {
      apiVersion: "2026-02-25.clover",
    });

    const email = req.nextUrl.searchParams.get("email");
    if (!email) {
      return NextResponse.json({ error: "email is required" }, { status: 400 });
    }

    // メールアドレスで顧客を検索
    const customers = await stripe.customers.list({ email, limit: 1 });

    if (customers.data.length === 0) {
      return NextResponse.json({
        active: false,
        plan: null,
        customer_id: null,
        trial: false,
        current_period_end: null,
      });
    }

    const customer = customers.data[0];

    // 有効なサブスクリプションを取得
    const subscriptions = await stripe.subscriptions.list({
      customer: customer.id,
      status: "all",
      limit: 5,
    });

    const activeSub = subscriptions.data.find(
      (s) => s.status === "active" || s.status === "trialing"
    );

    if (!activeSub) {
      // Customer exists but no subscription — free member
      return NextResponse.json({
        active: true,
        plan: "free",
        basePlan: "free",
        interval: null,
        customer_id: customer.id,
        trial: false,
        current_period_end: null,
      });
    }

    // プラン名をmetadataまたはprice IDから判定
    const priceId = activeSub.items.data[0]?.price?.id;
    let plan = activeSub.metadata?.plan || null;
    if (!plan && priceId) {
      const priceToplan = Object.entries(STRIPE_PRICE_IDS).find(([, id]) => id === priceId);
      if (priceToplan) plan = priceToplan[0];
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const periodEnd = (activeSub as any).current_period_end as number | null;

    // "standard-yearly" → interval付きでフロント送信、ベースプランも含める
    const isYearly = plan?.endsWith("-yearly") || false;
    const basePlan = plan?.replace("-yearly", "") || plan;

    return NextResponse.json({
      active: true,
      plan,
      basePlan,
      interval: isYearly ? "yearly" : "monthly",
      customer_id: customer.id,
      trial: activeSub.status === "trialing",
      status: activeSub.status,
      current_period_end: periodEnd
        ? new Date(periodEnd * 1000).toISOString()
        : null,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[subscription] error:", message);
    return NextResponse.json(
      { error: "サブスクリプション情報の取得に失敗しました" },
      { status: 500 }
    );
  }
}
