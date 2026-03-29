import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

export const dynamic = "force-dynamic";

/**
 * POST /api/portal
 * Stripe Customer Portal セッションを作成し、URLを返す。
 * フロントエンドから customer_id を受け取る。
 */
export async function POST(req: NextRequest) {
  try {
    const key = (process.env.STRIPE_SECRET_KEY || "").trim();
    const stripe = new Stripe(key, {
      apiVersion: "2026-02-25.clover",
    });

    const { customer_id } = await req.json();

    if (!customer_id) {
      return NextResponse.json(
        { error: "customer_id が必要です" },
        { status: 400 }
      );
    }

    const origin = req.headers.get("origin") || "https://market.next-aura.com";

    const session = await stripe.billingPortal.sessions.create({
      customer: customer_id,
      return_url: `${origin}/dashboard`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[portal] error:", message);
    return NextResponse.json(
      { error: "ポータルセッションの作成に失敗しました", detail: message },
      { status: 500 }
    );
  }
}
