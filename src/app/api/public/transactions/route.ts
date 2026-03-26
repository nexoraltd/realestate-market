import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getTransactions } from "@/lib/api";
import { STRIPE_PRICE_IDS } from "@/lib/plans";

export const dynamic = "force-dynamic";

const stripe = new Stripe((process.env.STRIPE_SECRET_KEY || "").trim(), {
  apiVersion: "2026-02-25.clover",
});

const DAILY_RATE_LIMIT = 100;

/**
 * APIキーからStripe顧客を検索し、プロフェッショナルプランを検証
 */
async function authenticateApiKey(
  apiKey: string
): Promise<{ customer: Stripe.Customer } | { error: string; status: number }> {
  // Stripe顧客をメタデータのapi_keyで検索
  const customers = await stripe.customers.search({
    query: `metadata["api_key"]:"${apiKey}"`,
  });

  if (customers.data.length === 0) {
    return { error: "Invalid API key", status: 401 };
  }

  const customer = customers.data[0];
  if (customer.deleted) {
    return { error: "Invalid API key", status: 401 };
  }

  // プロフェッショナルプランのアクティブサブスクリプションを確認
  const subscriptions = await stripe.subscriptions.list({
    customer: customer.id,
    status: "active",
  });

  const hasPro = subscriptions.data.some((sub) =>
    sub.items.data.some(
      (item) => item.price.id === STRIPE_PRICE_IDS.professional
    )
  );

  if (!hasPro) {
    return { error: "Professional plan required", status: 403 };
  }

  return { customer: customer as Stripe.Customer };
}

/**
 * レートリミットチェック（1日100リクエスト）
 * 顧客メタデータで api_calls_YYYY-MM-DD をトラッキング
 */
async function checkRateLimit(
  customer: Stripe.Customer
): Promise<{ allowed: boolean; remaining: number }> {
  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  const metaKey = `api_calls_${today}`;
  const currentCount = parseInt(customer.metadata?.[metaKey] || "0", 10);

  if (currentCount >= DAILY_RATE_LIMIT) {
    return { allowed: false, remaining: 0 };
  }

  // カウントをインクリメント
  await stripe.customers.update(customer.id, {
    metadata: { ...customer.metadata, [metaKey]: String(currentCount + 1) },
  });

  return { allowed: true, remaining: DAILY_RATE_LIMIT - currentCount - 1 };
}

/**
 * GET /api/public/transactions
 * 外部APIエンドポイント — x-api-key ヘッダーで認証
 * Query params: area (必須), year, quarter, city
 */
export async function GET(request: NextRequest) {
  const apiKey = request.headers.get("x-api-key");
  if (!apiKey) {
    return NextResponse.json(
      { error: "x-api-key header is required" },
      { status: 401 }
    );
  }

  try {
    // APIキー認証 & プラン検証
    const authResult = await authenticateApiKey(apiKey);
    if ("error" in authResult) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    const { customer } = authResult;

    // レートリミットチェック
    const rateLimit = await checkRateLimit(customer);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Daily rate limit exceeded (100 requests/day)" },
        { status: 429 }
      );
    }

    // クエリパラメータ取得
    const params = request.nextUrl.searchParams;
    const area = params.get("area");
    const year = params.get("year");
    const quarter = params.get("quarter");
    const city = params.get("city");

    if (!area) {
      return NextResponse.json(
        { error: "area is required" },
        { status: 400 }
      );
    }

    if (!year || !quarter) {
      return NextResponse.json(
        { error: "year and quarter are required" },
        { status: 400 }
      );
    }

    const transactions = await getTransactions({
      year,
      quarter,
      area,
      city: city || undefined,
    });

    return NextResponse.json(transactions, {
      headers: {
        "X-RateLimit-Remaining": String(rateLimit.remaining),
        "X-RateLimit-Limit": String(DAILY_RATE_LIMIT),
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
