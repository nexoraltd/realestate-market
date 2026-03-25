import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { STRIPE_PRICE_IDS } from "@/lib/plans";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const key = (process.env.STRIPE_SECRET_KEY || "").trim();
    const stripe = new Stripe(key, {
      apiVersion: "2026-02-25.clover",
    });

    const { plan, email } = await req.json();

    const priceId = STRIPE_PRICE_IDS[plan];
    if (!priceId) {
      return NextResponse.json({ error: "無効なプランです" }, { status: 400 });
    }

    const origin = req.headers.get("origin") || "http://localhost:3002";

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      customer_email: email || undefined,
      success_url: `${origin}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/pricing`,
      locale: "ja",
      subscription_data: {
        trial_period_days: 14,
      },
      metadata: { plan },
    });

    return NextResponse.json({ url: session.url });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[checkout] error:", message);
    return NextResponse.json({ error: "チェックアウト作成に失敗しました", detail: message }, { status: 500 });
  }
}
