import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getTransactions, Transaction } from "@/lib/api";

export const dynamic = "force-dynamic";

function median(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid];
}

/**
 * GET /api/report-download?session_id=xxx
 * Stripe Checkout Session を検証し、購入済みならレポートデータを返す
 */
export async function GET(req: NextRequest) {
  try {
    const key = (process.env.STRIPE_SECRET_KEY || "").trim();
    if (!key) {
      return NextResponse.json({ error: "STRIPE_SECRET_KEY is not set" }, { status: 500 });
    }

    const stripe = new Stripe(key, { apiVersion: "2026-02-25.clover" });

    const sessionId = req.nextUrl.searchParams.get("session_id");
    if (!sessionId) {
      return NextResponse.json({ error: "session_id is required" }, { status: 400 });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== "paid") {
      return NextResponse.json({ error: "支払いが完了していません" }, { status: 402 });
    }

    if (session.metadata?.product !== "area_report") {
      return NextResponse.json({ error: "無効なセッションです" }, { status: 400 });
    }

    const area = session.metadata.area;
    const areaName = session.metadata.areaName;

    if (!area || !areaName) {
      return NextResponse.json({ error: "エリア情報が見つかりません" }, { status: 400 });
    }

    // 過去5年分のデータを取得
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 5 }, (_, i) => String(currentYear - 4 + i));
    const quarters = ["1", "2", "3", "4"];

    const fetchPromises: Promise<{ year: string; transactions: Transaction[] }>[] = [];
    for (const year of years) {
      for (const quarter of quarters) {
        fetchPromises.push(
          getTransactions({ year, quarter, area })
            .then((transactions) => ({ year, transactions }))
            .catch(() => ({ year, transactions: [] as Transaction[] }))
        );
      }
    }

    const results = await Promise.all(fetchPromises);
    const allTransactions = results.flatMap((r) => r.transactions);

    const prices = allTransactions
      .map((t) => Number(t.TradePrice))
      .filter((p) => !isNaN(p) && p > 0);

    // 種別別集計
    const typeMap = new Map<string, { count: number; total: number }>();
    for (const t of allTransactions) {
      const price = Number(t.TradePrice);
      if (isNaN(price) || price <= 0) continue;
      const entry = typeMap.get(t.Type) || { count: 0, total: 0 };
      entry.count += 1;
      entry.total += price;
      typeMap.set(t.Type, entry);
    }

    // 年度別集計
    const yearMap = new Map<string, { count: number; total: number }>();
    for (const r of results) {
      for (const t of r.transactions) {
        const price = Number(t.TradePrice);
        if (isNaN(price) || price <= 0) continue;
        const entry = yearMap.get(r.year) || { count: 0, total: 0 };
        entry.count += 1;
        entry.total += price;
        yearMap.set(r.year, entry);
      }
    }

    return NextResponse.json({
      areaName,
      area,
      summary: {
        totalTransactions: allTransactions.length,
        avgPrice: prices.length > 0 ? Math.round(prices.reduce((a, b) => a + b, 0) / prices.length) : 0,
        medianPrice: Math.round(median(prices)),
        minPrice: prices.length > 0 ? Math.min(...prices) : 0,
        maxPrice: prices.length > 0 ? Math.max(...prices) : 0,
      },
      byType: Array.from(typeMap.entries())
        .map(([type, { count, total }]) => ({ type, count, avgPrice: Math.round(total / count) }))
        .sort((a, b) => b.count - a.count),
      byYear: Array.from(yearMap.entries())
        .map(([year, { count, total }]) => ({ year, count, avgPrice: Math.round(total / count) }))
        .sort((a, b) => a.year.localeCompare(b.year)),
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[report-download] error:", message);
    return NextResponse.json({ error: "レポート生成に失敗しました" }, { status: 500 });
  }
}
