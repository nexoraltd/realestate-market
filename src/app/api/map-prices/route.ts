import { NextResponse } from "next/server";
import { getTransactions } from "@/lib/api";
import { MAJOR_CITIES } from "@/lib/major-cities";

// ISR: 毎日1回再生成
export const revalidate = 86400;

const PREF_CODES = [
  "01","02","03","04","05","06","07","08","09","10",
  "11","12","13","14","15","16","17","18","19","20",
  "21","22","23","24","25","26","27","28","29","30",
  "31","32","33","34","35","36","37","38","39","40",
  "41","42","43","44","45","46","47",
];

function getRecentPeriods(n: number): { year: string; quarter: string }[] {
  const now = new Date();
  const periods: { year: string; quarter: string }[] = [];
  let year = now.getFullYear();
  // 直近データは1四半期遅延があるため1つ前から
  let quarter = Math.ceil((now.getMonth() + 1) / 3) - 1;
  if (quarter < 1) { quarter = 4; year -= 1; }

  for (let i = 0; i < n; i++) {
    periods.push({ year: String(year), quarter: String(quarter) });
    quarter -= 1;
    if (quarter < 1) { quarter = 4; year -= 1; }
  }
  return periods;
}

// 建物あり取引のみ対象（土地のみ・農地・林地は除外）
const RESIDENTIAL_TYPES = new Set([
  "宅地(土地と建物)",
  "中古マンション等",
]);

async function fetchAvgPrice(params: { area?: string; city?: string }, periods: { year: string; quarter: string }[]): Promise<number | null> {
  const prices: number[] = [];
  for (const { year, quarter } of periods) {
    try {
      const rows = await getTransactions({ year, quarter, ...params });
      for (const r of rows) {
        if (!RESIDENTIAL_TYPES.has(r.Type)) continue; // 農地・林地を除外
        const p = Number(r.TradePrice);
        if (p > 0) prices.push(Math.round(p / 10000));
      }
    } catch {
      // skip
    }
  }
  if (prices.length === 0) return null;
  return Math.round(prices.reduce((a, b) => a + b, 0) / prices.length);
}

export interface MapPricesResponse {
  prefectures: Record<string, number>;  // prefCode -> avgPrice(万円)
  cities: Record<string, number>;       // cityCode -> avgPrice(万円)
}

export async function GET() {
  const periods = getRecentPeriods(2);

  // 都道府県 & 都市を並列取得
  const [prefResults, cityResults] = await Promise.all([
    // 都道府県レベル
    Promise.all(
      PREF_CODES.map(async (code) => {
        const avg = await fetchAvgPrice({ area: code }, periods);
        return [code, avg] as [string, number | null];
      })
    ),
    // 都市レベル
    Promise.all(
      MAJOR_CITIES.map(async (city) => {
        const avg = await fetchAvgPrice({ city: city.code }, periods);
        return [city.code, avg] as [string, number | null];
      })
    ),
  ]);

  const prefectures: Record<string, number> = {};
  for (const [code, avg] of prefResults) {
    if (avg !== null) prefectures[code] = avg;
  }

  const cities: Record<string, number> = {};
  for (const [code, avg] of cityResults) {
    if (avg !== null) cities[code] = avg;
  }

  return NextResponse.json({ prefectures, cities } satisfies MapPricesResponse, {
    headers: { "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=3600" },
  });
}
