import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-02-25.clover",
});

const PRICE_IDS: Record<string, string> = {
  standard: "price_1TESR9HRmdlq3dCd5oE0LfDQ",
  professional: "price_1TESSCHRmdlq3dCdKIjdznwZ",
};

export async function POST(req: NextRequest) {
  try {
    const { plan, email } = await req.json();

    const priceId = PRICE_IDS[plan];
    if (!priceId) {
      return NextResponse.json({ error: "無効なプランです" }, { status: 400 });
    }

    const origin = req.headers.get("origin") || "http://localhost:3002";

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
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
  } catch (err) {
    console.error("[checkout] error:", err);
    return NextResponse.json({ error: "チェックアウト作成に失敗しました" }, { status: 500 });
  }
}
