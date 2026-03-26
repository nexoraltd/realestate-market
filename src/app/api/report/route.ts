import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { checkApiAuth } from "@/lib/apiAuth";
import { getTransactions, Transaction } from "@/lib/api";
import { STRIPE_PRICE_IDS } from "@/lib/plans";
import { PREFECTURES } from "@/lib/prefectures";

export const dynamic = "force-dynamic";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function areaCodeToName(code: string): string {
  const pref = PREFECTURES.find((p) => p.code === code);
  return pref ? pref.name : code;
}

function median(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid];
}

// ---------------------------------------------------------------------------
// POST /api/report
// ---------------------------------------------------------------------------

export async function POST(req: NextRequest) {
  // 1. Internal API auth
  const authError = checkApiAuth(req);
  if (authError) return authError;

  // 2. Parse body
  let body: { email?: string; areas?: string[]; years?: string[]; types?: string[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { email, areas, years, types } = body;

  if (!email || !areas || !Array.isArray(areas) || areas.length === 0) {
    return NextResponse.json(
      { error: "email and areas[] are required" },
      { status: 400 },
    );
  }
  if (!years || !Array.isArray(years) || years.length === 0) {
    return NextResponse.json(
      { error: "years[] is required" },
      { status: 400 },
    );
  }

  // 3. Verify professional plan subscription via Stripe
  try {
    const stripeKey = (process.env.STRIPE_SECRET_KEY || "").trim();
    if (!stripeKey) {
      return NextResponse.json(
        { error: "STRIPE_SECRET_KEY is not set" },
        { status: 500 },
      );
    }

    const stripe = new Stripe(stripeKey, {
      apiVersion: "2026-02-25.clover",
    });

    const customers = await stripe.customers.list({ email, limit: 1 });
    if (customers.data.length === 0) {
      return NextResponse.json(
        { error: "No customer found. Professional plan required." },
        { status: 403 },
      );
    }

    const customer = customers.data[0];
    const subscriptions = await stripe.subscriptions.list({
      customer: customer.id,
      status: "all",
      limit: 10,
    });

    const activeSub = subscriptions.data.find(
      (s) => s.status === "active" || s.status === "trialing",
    );

    if (!activeSub) {
      return NextResponse.json(
        { error: "No active subscription. Professional plan required." },
        { status: 403 },
      );
    }

    const priceId = activeSub.items.data[0]?.price?.id;
    if (priceId !== STRIPE_PRICE_IDS.professional) {
      return NextResponse.json(
        { error: "Professional plan required for custom reports." },
        { status: 403 },
      );
    }

    // 4. Fetch transaction data for each area / year / quarter
    const quarters = ["1", "2", "3", "4"];

    type AreaReport = {
      code: string;
      name: string;
      summary: {
        totalTransactions: number;
        avgPrice: number;
        medianPrice: number;
        minPrice: number;
        maxPrice: number;
      };
      byType: { type: string; count: number; avgPrice: number }[];
      byYear: { year: string; count: number; avgPrice: number }[];
    };

    const areaReports: AreaReport[] = [];

    for (const area of areas) {
      // Build all fetch promises for this area (years x quarters)
      const fetchPromises: Promise<{ year: string; transactions: Transaction[] }>[] = [];

      for (const year of years) {
        for (const quarter of quarters) {
          fetchPromises.push(
            getTransactions({ year, quarter, area })
              .then((transactions) => ({ year, transactions }))
              .catch(() => ({ year, transactions: [] as Transaction[] })),
          );
        }
      }

      const results = await Promise.all(fetchPromises);

      // Combine all transactions for this area
      let allTransactions = results.flatMap((r) => r.transactions);

      // Filter by types if specified
      if (types && types.length > 0) {
        allTransactions = allTransactions.filter((t) => types.includes(t.Type));
      }

      // Parse prices
      const prices = allTransactions
        .map((t) => Number(t.TradePrice))
        .filter((p) => !isNaN(p) && p > 0);

      // Summary
      const totalTransactions = allTransactions.length;
      const avgPrice =
        prices.length > 0
          ? Math.round(prices.reduce((a, b) => a + b, 0) / prices.length)
          : 0;
      const medianPrice = Math.round(median(prices));
      const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
      const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;

      // By Type breakdown
      const typeMap = new Map<string, { count: number; total: number }>();
      for (const t of allTransactions) {
        const price = Number(t.TradePrice);
        if (isNaN(price) || price <= 0) continue;
        const entry = typeMap.get(t.Type) || { count: 0, total: 0 };
        entry.count += 1;
        entry.total += price;
        typeMap.set(t.Type, entry);
      }
      const byType = Array.from(typeMap.entries())
        .map(([type, { count, total }]) => ({
          type,
          count,
          avgPrice: Math.round(total / count),
        }))
        .sort((a, b) => b.count - a.count);

      // By Year breakdown
      const yearMap = new Map<string, { count: number; total: number }>();
      for (const r of results) {
        for (const t of r.transactions) {
          if (types && types.length > 0 && !types.includes(t.Type)) continue;
          const price = Number(t.TradePrice);
          if (isNaN(price) || price <= 0) continue;
          const entry = yearMap.get(r.year) || { count: 0, total: 0 };
          entry.count += 1;
          entry.total += price;
          yearMap.set(r.year, entry);
        }
      }
      const byYear = Array.from(yearMap.entries())
        .map(([year, { count, total }]) => ({
          year,
          count,
          avgPrice: Math.round(total / count),
        }))
        .sort((a, b) => a.year.localeCompare(b.year));

      areaReports.push({
        code: area,
        name: areaCodeToName(area),
        summary: {
          totalTransactions,
          avgPrice,
          medianPrice,
          minPrice,
          maxPrice,
        },
        byType,
        byYear,
      });
    }

    // 5. Build comparison across areas
    const priceRanking = areaReports
      .map((a) => ({ area: a.name, avgPrice: a.summary.avgPrice }))
      .sort((a, b) => b.avgPrice - a.avgPrice);

    const volumeRanking = areaReports
      .map((a) => ({ area: a.name, count: a.summary.totalTransactions }))
      .sort((a, b) => b.count - a.count);

    return NextResponse.json({
      generatedAt: new Date().toISOString(),
      areas: areaReports,
      comparison: {
        priceRanking,
        volumeRanking,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[report] error:", message);
    return NextResponse.json(
      { error: "レポート生成に失敗しました" },
      { status: 500 },
    );
  }
}
