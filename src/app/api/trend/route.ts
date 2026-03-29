import { NextRequest, NextResponse } from "next/server";
import { getTransactions } from "@/lib/api";
import { checkApiAuth } from "@/lib/apiAuth";
import { STRIPE_PRICE_IDS } from "@/lib/plans";
import Stripe from "stripe";

export const dynamic = "force-dynamic";

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

export async function GET(req: NextRequest) {
  const authError = checkApiAuth(req);
  if (authError) return authError;

  const params = req.nextUrl.searchParams;
  const area = params.get("area");
  const type = params.get("type") || "all";
  const email = params.get("email");

  if (!area) {
    return NextResponse.json({ error: "area is required" }, { status: 400 });
  }

  // プラン確認（emailがあればStripeで検証）
  let yearCount = 5; // デフォルト（後方互換）
  if (email) {
    const plan = await resolvePlan(email);
    if (!plan) {
      return NextResponse.json(
        { error: "トレンド分析はスタンダードプラン以上でご利用いただけます。" },
        { status: 403 }
      );
    }
    yearCount = 20; // 有料プランは20年
  }

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: yearCount }, (_, i) => String(currentYear - i));
  const quarters = ["1", "2", "3", "4"];

  const TYPE_MAP: Record<string, string> = {
    mansion: "中古マンション等",
    house: "宅地(土地と建物)",
    land: "宅地(土地)",
    forest: "林地",
  };

  const allRows: { TradePrice: string; Type: string; Period: string }[] = [];

  await Promise.all(
    years.flatMap((year) =>
      quarters.map(async (quarter) => {
        try {
          const rows = await getTransactions({ year, quarter, area });
          allRows.push(
            ...rows.map((r) => ({
              TradePrice: r.TradePrice,
              Type: r.Type,
              Period: r.Period,
            }))
          );
        } catch {
          // skip
        }
      })
    )
  );

  const filtered =
    type === "all"
      ? allRows
      : allRows.filter((r) => r.Type === TYPE_MAP[type]);

  return NextResponse.json(filtered);
}
