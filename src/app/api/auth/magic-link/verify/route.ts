import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { STRIPE_PRICE_IDS } from "@/lib/plans";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const params = req.nextUrl.searchParams;
    const token = params.get("token");
    const email = params.get("email");

    if (!token || !email) {
      return NextResponse.json({ error: "無効なリンクです" }, { status: 400 });
    }

    const stripe = new Stripe((process.env.STRIPE_SECRET_KEY || "").trim(), {
      apiVersion: "2026-02-25.clover",
    });

    const customers = await stripe.customers.list({ email, limit: 1 });
    if (customers.data.length === 0) {
      return NextResponse.json({ error: "アカウントが見つかりません" }, { status: 404 });
    }

    const customer = customers.data[0];
    const storedToken = customer.metadata?.magic_token;
    const expiry = customer.metadata?.magic_token_exp;

    if (!storedToken || storedToken !== token) {
      return NextResponse.json({ error: "リンクが無効です" }, { status: 401 });
    }

    if (!expiry || new Date(expiry) < new Date()) {
      return NextResponse.json({ error: "リンクの有効期限が切れています" }, { status: 401 });
    }

    // One-time use: clear token
    await stripe.customers.update(customer.id, {
      metadata: { ...customer.metadata, magic_token: "", magic_token_exp: "" },
    });

    const subscriptions = await stripe.subscriptions.list({
      customer: customer.id,
      status: "all",
      limit: 5,
    });

    const activeSub = subscriptions.data.find(
      (s) => s.status === "active" || s.status === "trialing"
    );

    if (!activeSub) {
      return NextResponse.json({
        active: true,
        plan: "free",
        customer_id: customer.id,
        trial: false,
        current_period_end: null,
      });
    }

    const priceId = activeSub.items.data[0]?.price?.id;
    let plan = activeSub.metadata?.plan || null;
    if (!plan && priceId) {
      const entry = Object.entries(STRIPE_PRICE_IDS).find(([, id]) => id === priceId);
      if (entry) plan = entry[0];
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const periodEnd = (activeSub as any).current_period_end as number | null;

    return NextResponse.json({
      active: true,
      plan,
      customer_id: customer.id,
      trial: activeSub.status === "trialing",
      status: activeSub.status,
      current_period_end: periodEnd ? new Date(periodEnd * 1000).toISOString() : null,
    });
  } catch (err) {
    console.error("[auth/magic-link/verify] error:", err);
    return NextResponse.json({ error: "認証に失敗しました" }, { status: 500 });
  }
}
