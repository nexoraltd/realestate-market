import { NextRequest, NextResponse } from "next/server";
import { getTransactions, Transaction } from "@/lib/api";
import { checkApiAuth } from "@/lib/apiAuth";
import { getPermissions } from "@/lib/planPermissions";
import Stripe from "stripe";
import { STRIPE_PRICE_IDS } from "@/lib/plans";

export const dynamic = "force-dynamic";

function toCSV(rows: Transaction[]): string {
  if (rows.length === 0) return "";

  const headers = [
    "取引時期", "種別", "都道府県", "市区町村", "地区名",
    "取引価格(円)", "坪単価(円)", "面積(㎡)", "建築年",
    "構造", "用途", "最寄り駅", "駅距離(分)",
    "間取り", "土地の形状", "容積率", "建蔽率",
  ];

  const escape = (v: string) => `"${(v || "").replace(/"/g, '""')}"`;

  const dataRows = rows.map((r) =>
    [
      escape(r.Period),
      escape(r.Type),
      escape(r.Prefecture),
      escape(r.Municipality),
      escape(r.DistrictName),
      escape(r.TradePrice),
      escape(r.UnitPrice),
      escape(r.Area),
      escape(r.BuildingYear),
      escape(r.Structure),
      escape(r.Use),
      escape(r.NearestStation),
      escape(r.TimeToNearestStation),
      escape(r.FloorPlan),
      escape(r.LandShape),
      escape(r.FloorAreaRatio),
      escape(r.CoverageRatio),
    ].join(",")
  );

  return "\uFEFF" + [headers.join(","), ...dataRows].join("\r\n");
}

/**
 * 現在の月のキーを返す（例: "2026-03"）
 */
function currentMonthKey(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

/**
 * Stripe顧客メタデータからCSVダウンロード数を取得・更新
 */
async function getAndIncrementCsvCount(
  stripe: Stripe,
  email: string
): Promise<{ used: number; customerId: string | null }> {
  const customers = await stripe.customers.list({ email, limit: 1 });
  if (customers.data.length === 0) {
    return { used: 0, customerId: null };
  }

  const customer = customers.data[0];
  const monthKey = currentMonthKey();
  const metaKey = `csv_downloads_${monthKey}`;
  const currentCount = Number(customer.metadata?.[metaKey] || "0");

  return { used: currentCount, customerId: customer.id };
}

async function incrementCsvCount(
  stripe: Stripe,
  customerId: string,
  currentCount: number
): Promise<void> {
  const monthKey = currentMonthKey();
  const metaKey = `csv_downloads_${monthKey}`;

  await stripe.customers.update(customerId, {
    metadata: { [metaKey]: String(currentCount + 1) },
  });
}

/**
 * メールアドレスからプランを判定
 */
async function resolvePlan(
  stripe: Stripe,
  email: string
): Promise<string | null> {
  const customers = await stripe.customers.list({ email, limit: 1 });
  if (customers.data.length === 0) return null;

  const customer = customers.data[0];
  const subscriptions = await stripe.subscriptions.list({
    customer: customer.id,
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
  const year = params.get("year") || "2024";
  const email = params.get("email");

  if (!area) {
    return NextResponse.json({ error: "area is required" }, { status: 400 });
  }

  // プランベースのCSVダウンロード制限チェック
  const stripeKey = (process.env.STRIPE_SECRET_KEY || "").trim();
  if (stripeKey && email) {
    const stripe = new Stripe(stripeKey, {
      apiVersion: "2026-02-25.clover",
    });

    const plan = await resolvePlan(stripe, email);
    const perms = getPermissions(plan);

    if (perms.csvMonthlyLimit !== -1) {
      const { used, customerId } = await getAndIncrementCsvCount(stripe, email);

      if (used >= perms.csvMonthlyLimit) {
        return NextResponse.json(
          {
            error: "csv_limit_reached",
            message: `今月のCSVダウンロード上限（${perms.csvMonthlyLimit}件）に達しました。プロフェッショナルプランにアップグレードすると無制限にダウンロードできます。`,
            used,
            limit: perms.csvMonthlyLimit,
          },
          { status: 429 }
        );
      }

      // ダウンロード成功後にカウントをインクリメント（後で行う）
      // customerId を後で使うためにリクエストコンテキストに保存
      const quarters = ["1", "2", "3", "4"];
      const allRows: Transaction[] = [];

      await Promise.all(
        quarters.map(async (quarter) => {
          try {
            const rows = await getTransactions({ year, quarter, area });
            allRows.push(...rows);
          } catch {
            // 一部の四半期でデータなしの場合はスキップ
          }
        })
      );

      // データ取得成功後にカウントをインクリメント
      if (customerId) {
        await incrementCsvCount(stripe, customerId, used);
      }

      const csv = toCSV(allRows);
      const filename = `realestate_${area}_${year}.csv`;

      return new NextResponse(csv, {
        status: 200,
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`,
          "X-Csv-Downloads-Used": String(used + 1),
          "X-Csv-Downloads-Limit": String(perms.csvMonthlyLimit),
        },
      });
    }
  }

  // プロフェッショナルプランまたはStripe未設定の場合：制限なし
  const quarters = ["1", "2", "3", "4"];
  const allRows: Transaction[] = [];

  await Promise.all(
    quarters.map(async (quarter) => {
      try {
        const rows = await getTransactions({ year, quarter, area });
        allRows.push(...rows);
      } catch {
        // 一部の四半期でデータなしの場合はスキップ
      }
    })
  );

  const csv = toCSV(allRows);
  const filename = `realestate_${area}_${year}.csv`;

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`,
    },
  });
}
