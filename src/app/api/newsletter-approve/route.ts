import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { createHmac } from "crypto";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

const SECRET = process.env.INTERNAL_API_SECRET!;
const RESEND_KEY = process.env.RESEND_API_KEY!;
const REINFOLIB_KEY = process.env.REINFOLIB_API_KEY!;
const FROM = "ネクソラ不動産 <noreply@next-aura.com>";
const SITE_URL = "https://market.next-aura.com";

const AREAS = [
  { code: "13", name: "東京都" },
  { code: "14", name: "神奈川県" },
  { code: "27", name: "大阪府" },
  { code: "23", name: "愛知県" },
  { code: "40", name: "福岡県" },
];

function verifyToken(date: string, token: string): boolean {
  const expected = createHmac("sha256", SECRET)
    .update(`newsletter-approve:${date}`)
    .digest("hex");
  return token === expected;
}

function getSubscribers(): string[] {
  const raw = process.env.NEWSLETTER_SUBSCRIBERS || "";
  return raw
    .split(",")
    .map((e) => e.trim())
    .filter((e) => e.includes("@"));
}

async function getLatestQuarter(): Promise<{ year: string; quarter: string }> {
  // 最大4四半期さかのぼって利用可能なデータを探す（東京都でプローブ）
  for (const offsetMonths of [3, 6, 9, 12]) {
    const d = new Date();
    d.setDate(d.getDate() - offsetMonths * 30);
    const year = d.getFullYear().toString();
    const quarter = (Math.floor(d.getMonth() / 3) + 1).toString();
    const params = new URLSearchParams({
      year, quarter, area: "13", from: `${year}${quarter}`, to: `${year}${quarter}`,
    });
    try {
      const res = await fetch(
        `https://www.reinfolib.mlit.go.jp/ex-api/external/XIT001?${params}`,
        { headers: { "Ocp-Apim-Subscription-Key": REINFOLIB_KEY }, signal: AbortSignal.timeout(10000) }
      );
      if (!res.ok) continue;
      const data = await res.json();
      if ((data.data || []).length > 100) return { year, quarter };
    } catch { continue; }
  }
  // フォールバック
  const d = new Date();
  d.setDate(d.getDate() - 270);
  return { year: d.getFullYear().toString(), quarter: (Math.floor(d.getMonth() / 3) + 1).toString() };
}

async function fetchAreaStats(areaCode: string, year: string, quarter: string) {
  const params = new URLSearchParams({
    year,
    quarter,
    area: areaCode,
    from: `${year}${quarter}`,
    to: `${year}${quarter}`,
  });
  const url = `https://www.reinfolib.mlit.go.jp/ex-api/external/XIT001?${params}`;

  try {
    const res = await fetch(url, {
      headers: { "Ocp-Apim-Subscription-Key": REINFOLIB_KEY },
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) return null;
    const data = await res.json();
    const transactions = data.data || [];
    const prices = transactions
      .map((t: Record<string, string>) => parseInt(t.TradePrice || "0"))
      .filter((p: number) => p > 0);
    if (prices.length === 0) return null;
    return {
      count: transactions.length,
      avgPrice: Math.floor(prices.reduce((a: number, b: number) => a + b, 0) / prices.length),
    };
  } catch {
    return null;
  }
}

function fmtPrice(yen: number): string {
  if (yen >= 100_000_000) return `${(yen / 100_000_000).toFixed(1)}億円`;
  return `${Math.floor(yen / 10_000).toLocaleString()}万円`;
}

const WEEKLY_COLUMNS = [
  ["今が売り時？ 不動産売却のベストタイミング", "不動産の売却は「いつ売るか」で数百万円の差が出ます。一般的に、1〜3月は転勤・入学シーズンで購入需要が高まり、売り手に有利な時期です。逆に、お盆や年末年始は市場が停滞しがち。ご自身の物件が今いくらか、まずはAI査定で確認してみませんか？"],
  ["住宅ローン金利の動向をチェック", "2025年以降、日銀の金融政策変更により住宅ローン金利が上昇傾向にあります。変動金利は依然として低水準ですが、固定金利との差は縮小中。購入を検討中なら、金利が上がる前に相場を把握しておくことが重要です。"],
  ["中古マンション vs 新築、どちらがお得？", "首都圏の新築マンション平均価格は1億円を超え、中古との価格差が拡大しています。築10年以内の中古マンションなら、新築の6〜7割の価格で同等の住環境を得られるケースも。エリアごとの相場を比較してみましょう。"],
  ["知っておきたい 不動産取引の諸費用", "不動産の購入には物件価格の6〜10%の諸費用がかかります。仲介手数料（最大3%+6万円）、登記費用、住宅ローン事務手数料、火災保険料など。売却時も3〜5%程度の費用が発生します。資金計画は余裕を持って立てましょう。"],
  ["エリア選びで失敗しない3つのポイント", "不動産購入で後悔しないためのポイント: (1) 通勤・通学の実際の所要時間を確認 (2) ハザードマップで災害リスクをチェック (3) 将来の再開発・人口動態を調査。相場ナビで気になるエリアのデータを無料で確認できます。"],
  ["築年数と資産価値の関係", "一般的にマンションは築20年で新築時の50〜60%まで価格が下がりますが、立地が良ければ築30年でも値崩れしにくい物件もあります。一方、一戸建ては築20年で建物価値がほぼゼロに。ただし土地の価値は残ります。"],
  ["2025年の不動産市場トレンド", "都心部のマンション価格は高止まり、郊外はエリアによる二極化が鮮明に。テレワーク定着で千葉・埼玉の駅近物件に注目が集まる一方、バス便エリアは下落傾向。最新の取引データで、あなたのエリアの動向を確認しましょう。"],
  ["不動産投資 利回りの見方", "表面利回りだけで判断するのは危険です。管理費・修繕積立金・固定資産税・空室リスクを差し引いた「実質利回り」で比較しましょう。都心のワンルームで表面4〜5%、実質2〜3%が目安。地方物件は高利回りでも空室リスクに注意。"],
  ["住み替えを成功させるコツ", "住み替えは「売り先行」か「買い先行」かで戦略が変わります。売り先行なら資金計画が立てやすく、買い先行なら理想の物件をじっくり探せます。まずは現在の物件価格をAI査定で把握してから計画を立てましょう。"],
  ["マンションの管理状態で価値が変わる", "「マンションは管理を買え」という格言があります。修繕積立金の積立状況、大規模修繕の履歴、管理組合の運営状態は資産価値に直結します。中古マンション購入時は、重要事項調査報告書を必ず確認しましょう。"],
  ["相続した不動産、どうする？", "相続不動産は「売却」「賃貸」「自己利用」の3択。空き家のまま放置すると固定資産税が最大6倍になる特定空家に指定されるリスクも。まずは現在の市場価値を確認し、最適な選択肢を検討しましょう。"],
  ["リフォームで資産価値は上がる？", "キッチン・浴室のリフォームは費用対効果が高く、売却時にプラス評価されやすい部分です。一方、間取り変更は好みが分かれるため、投資に見合わないことも。売却前リフォームは「最低限の清潔感」に絞るのが鉄則です。"],
];

function getWeeklyColumn(): [string, string] {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  const week = Math.ceil(((now.getTime() - start.getTime()) / 86400000 + start.getDay() + 1) / 7);
  return WEEKLY_COLUMNS[week % WEEKLY_COLUMNS.length] as [string, string];
}

function generateHtml(
  areaData: { name: string; stats: { count: number; avgPrice: number } | null }[],
  year: string,
  quarter: string
): string {
  const quarterLabel: Record<string, string> = { "1": "1-3月", "2": "4-6月", "3": "7-9月", "4": "10-12月" };
  const today = new Date().toLocaleDateString("ja-JP", { year: "numeric", month: "2-digit", day: "2-digit" });
  const [colTitle, colBody] = getWeeklyColumn();

  const validAreas = areaData.filter(({ stats }) => stats !== null);
  const rows = validAreas
    .map(({ name, stats }) =>
      `<tr>
        <td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;font-weight:500">${name}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;text-align:right;color:#64748b">${stats!.count.toLocaleString()}件</td>
        <td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;text-align:right;font-weight:bold;color:#d97706">${fmtPrice(stats!.avgPrice)}</td>
      </tr>`)
    .join("");

  return `
    <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:600px;margin:0 auto;background:#ffffff">
      <div style="background:linear-gradient(135deg,#0f172a,#1e3a5f);padding:28px 24px;text-align:center">
        <h1 style="color:#f59e0b;font-size:20px;margin:0 0 4px">不動産相場ナビ 週刊レター</h1>
        <p style="color:#94a3b8;font-size:12px;margin:0">${today}配信</p>
      </div>
      <div style="padding:24px">
        <h2 style="color:#1e293b;font-size:16px;margin:0 0 12px;border-left:3px solid #f59e0b;padding-left:10px">${colTitle}</h2>
        <p style="color:#475569;font-size:14px;line-height:1.8;margin:0 0 20px">${colBody}</p>
        <div style="background:#f0fdf4;border:1px solid #86efac;border-radius:12px;padding:20px;text-align:center;margin:0 0 24px">
          <p style="color:#1e293b;font-size:14px;font-weight:bold;margin:0 0 4px">お持ちの物件、今いくら？</p>
          <p style="color:#64748b;font-size:12px;margin:0 0 12px">AIが国交省データから推定価格を算出。無料・登録不要。</p>
          <a href="${SITE_URL}/estimate" style="display:inline-block;background:#16a34a;color:#fff;padding:10px 24px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:14px">無料AI査定を試す</a>
        </div>
        <h2 style="color:#1e293b;font-size:15px;margin:0 0 8px;border-left:3px solid #94a3b8;padding-left:10px">主要エリア相場（${year}年${quarterLabel[quarter] || quarter}）</h2>
        <table style="width:100%;border-collapse:collapse;margin-bottom:20px;font-size:13px">
          <thead><tr style="background:#f8fafc">
            <th style="padding:6px 12px;text-align:left;font-size:11px;color:#94a3b8">エリア</th>
            <th style="padding:6px 12px;text-align:right;font-size:11px;color:#94a3b8">件数</th>
            <th style="padding:6px 12px;text-align:right;font-size:11px;color:#94a3b8">平均</th>
          </tr></thead>
          <tbody>${rows}</tbody>
        </table>
        <div style="text-align:center;margin:0 0 24px">
          <a href="${SITE_URL}/search" style="display:inline-block;background:#f59e0b;color:#fff;padding:10px 24px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:14px">あなたのエリアの相場を調べる</a>
        </div>
      </div>
      <div style="background:#f8fafc;padding:16px 24px;text-align:center;border-top:1px solid #e2e8f0">
        <p style="color:#94a3b8;font-size:11px;margin:0 0 8px">
          <a href="${SITE_URL}" style="color:#f59e0b;text-decoration:none">不動産相場ナビ</a> | ネクソラ不動産
        </p>
        <p style="color:#94a3b8;font-size:11px;margin:0">
          <a href="${SITE_URL}/api/newsletter-unsubscribe?email=%%EMAIL%%" style="color:#94a3b8">配信停止</a>
        </p>
      </div>
    </div>`;
}

function resultPage(title: string, message: string, ok: boolean): string {
  const color = ok ? "#16a34a" : "#dc2626";
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${title}</title>
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <style>body{font-family:-apple-system,sans-serif;display:flex;justify-content:center;align-items:center;min-height:100vh;margin:0;background:#f8fafc}
    .card{background:#fff;border-radius:16px;padding:48px;text-align:center;box-shadow:0 4px 24px rgba(0,0,0,.08);max-width:400px}
    h1{color:${color};font-size:24px;margin:0 0 12px}p{color:#64748b;font-size:16px;margin:0}</style>
    </head><body><div class="card"><h1>${title}</h1><p>${message}</p></div></body></html>`;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");
  const date = searchParams.get("date");

  if (!token || !date || !verifyToken(date, token)) {
    return new NextResponse(
      resultPage("認証エラー", "無効なリンクです。", false),
      { status: 403, headers: { "Content-Type": "text/html; charset=utf-8" } }
    );
  }

  // Check if token date is within 7 days
  const tokenDate = new Date(date);
  const now = new Date();
  if (now.getTime() - tokenDate.getTime() > 7 * 24 * 60 * 60 * 1000) {
    return new NextResponse(
      resultPage("期限切れ", "承認リンクの有効期限が切れています。", false),
      { status: 410, headers: { "Content-Type": "text/html; charset=utf-8" } }
    );
  }

  const subscribers = getSubscribers();
  if (subscribers.length === 0) {
    return new NextResponse(
      resultPage("購読者なし", "配信対象の購読者がいません。", false),
      { status: 200, headers: { "Content-Type": "text/html; charset=utf-8" } }
    );
  }

  // Generate report
  const { year, quarter } = await getLatestQuarter();
  const areaData = await Promise.all(
    AREAS.map(async ({ code, name }) => ({
      name,
      stats: await fetchAreaStats(code, year, quarter),
    }))
  );

  // データがあるエリアが0なら送信しない
  const hasData = areaData.some(({ stats }) => stats !== null);
  if (!hasData) {
    return new NextResponse(
      resultPage("データなし", "現在配信可能な相場データがありません。次週をお待ちください。", false),
      { status: 200, headers: { "Content-Type": "text/html; charset=utf-8" } }
    );
  }

  const baseHtml = generateHtml(areaData, year, quarter);
  const todayStr = new Date()
    .toLocaleDateString("ja-JP", { month: "2-digit", day: "2-digit" });
  const subject = `【週刊】不動産相場レポート ${todayStr}号`;

  // Send to all subscribers
  const resend = new Resend(RESEND_KEY);
  let success = 0;
  for (const email of subscribers) {
    const unsubToken = createHmac("sha256", SECRET)
      .update(`newsletter-unsubscribe:${email}`)
      .digest("hex");
    const unsubUrl = `${SITE_URL}/api/newsletter-unsubscribe?email=${encodeURIComponent(email)}&token=${unsubToken}`;
    const html = baseHtml.replace("%%EMAIL%%", encodeURIComponent(email))
      .replace(
        `${SITE_URL}/api/newsletter-unsubscribe?email=${encodeURIComponent(email)}`,
        unsubUrl
      );
    try {
      await resend.emails.send({ from: FROM, to: email, subject, html });
      success++;
    } catch (e) {
      console.error(`[newsletter-approve] send error: ${email}`, e);
    }
  }

  return new NextResponse(
    resultPage(
      "配信完了",
      `${success}/${subscribers.length} 通のメールを送信しました。`,
      true
    ),
    { status: 200, headers: { "Content-Type": "text/html; charset=utf-8" } }
  );
}
