import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

export const dynamic = "force-dynamic";

/**
 * POST /api/report-checkout
 * エリア別レポートの単品購入用 Stripe Checkout セッション作成
 *
 * Body: { area: string, areaName: string, email?: string }
 * Returns: { url: string }
 */
export async function POST(req: NextRequest) {
  try {
    const key = (process.env.STRIPE_SECRET_KEY || "").trim();
    if (!key) {
      return NextResponse.json({ error: "STRIPE_SECRET_KEY is not set" }, { status: 500 });
    }

    const stripe = new Stripe(key, { apiVersion: "2026-02-25.clover" });

    const { area, areaName, email } = await req.json();

    if (!area || !areaName) {
      return NextResponse.json({ error: "area and areaName are required" }, { status: 400 });
    }

    const origin = req.headers.get("origin") || "http://localhost:3002";

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "jpy",
            unit_amount: 980,
            product_data: {
              name: `${areaName} 不動産相場レポート`,
              description: `${areaName}の過去5年間の取引データ分析レポート（種別別・年度別集計、価格推移）`,
            },
          },
          quantity: 1,
        },
      ],
      customer_email: email || undefined,
      success_url: `${origin}/report/download?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/search`,
      locale: "ja",
      metadata: { area, areaName, product: "area_report" },
    });

    return NextResponse.json({ url: session.url });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[report-checkout] error:", message);
    return NextResponse.json({ error: "チェックアウト作成に失敗しました" }, { status: 500 });
  }
}
