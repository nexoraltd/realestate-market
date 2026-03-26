import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

export const dynamic = "force-dynamic";

/**
 * GET /api/checkout-session?session_id=xxx
 * Stripe Checkout Session IDからメールアドレスとプラン情報を取得する。
 * ダッシュボードでの自動認証に使用。
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

    const sessionId = req.nextUrl.searchParams.get("session_id");
    if (!sessionId) {
      return NextResponse.json({ error: "session_id is required" }, { status: 400 });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (!session.customer_email) {
      return NextResponse.json({ error: "メールアドレスが見つかりません" }, { status: 404 });
    }

    return NextResponse.json({
      email: session.customer_email,
      plan: session.metadata?.plan || "standard",
      status: session.status,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[checkout-session] error:", message);
    return NextResponse.json(
      { error: "セッション情報の取得に失敗しました" },
      { status: 500 }
    );
  }
}
