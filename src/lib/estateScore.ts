/**
 * Estate scoring engine + REINFOLIB area helpers
 * Adds score (0-100) and 5-year forecast to realestate-market.
 * Reuses getTransactions() from ./api for XIT001 calls.
 */
import { getTransactions } from './api';

const SQM_PER_TSUBO = 3.30579;

// ─── Area map ───────────────────────────────────────────────────────────────

interface AreaCode {
  prefCode: string;
  cityCode: string;
  name: string;
}

export const ESTATE_AREA_MAP: Record<string, AreaCode> = {
  shibuya:   { prefCode: '13', cityCode: '13113', name: '渋谷区' },
  shinjuku:  { prefCode: '13', cityCode: '13104', name: '新宿区' },
  minato:    { prefCode: '13', cityCode: '13103', name: '港区' },
  chiyoda:   { prefCode: '13', cityCode: '13101', name: '千代田区' },
  chuo:      { prefCode: '13', cityCode: '13102', name: '中央区' },
  meguro:    { prefCode: '13', cityCode: '13110', name: '目黒区' },
  setagaya:  { prefCode: '13', cityCode: '13112', name: '世田谷区' },
  suginami:  { prefCode: '13', cityCode: '13115', name: '杉並区' },
  nakano:    { prefCode: '13', cityCode: '13114', name: '中野区' },
  toshima:   { prefCode: '13', cityCode: '13116', name: '豊島区' },
  bunkyo:    { prefCode: '13', cityCode: '13105', name: '文京区' },
  taito:     { prefCode: '13', cityCode: '13106', name: '台東区' },
  sumida:    { prefCode: '13', cityCode: '13107', name: '墨田区' },
  koto:      { prefCode: '13', cityCode: '13108', name: '江東区' },
  shinagawa: { prefCode: '13', cityCode: '13109', name: '品川区' },
  ota:       { prefCode: '13', cityCode: '13111', name: '大田区' },
  kita:      { prefCode: '13', cityCode: '13117', name: '北区' },
  arakawa:   { prefCode: '13', cityCode: '13118', name: '荒川区' },
  itabashi:  { prefCode: '13', cityCode: '13119', name: '板橋区' },
  nerima:    { prefCode: '13', cityCode: '13120', name: '練馬区' },
  adachi:    { prefCode: '13', cityCode: '13121', name: '足立区' },
  katsushika:{ prefCode: '13', cityCode: '13122', name: '葛飾区' },
  edogawa:   { prefCode: '13', cityCode: '13123', name: '江戸川区' },
  'saitama-urashin': { prefCode: '11', cityCode: '11101', name: 'さいたま市浦和区' },
  'saitama-omiya':   { prefCode: '11', cityCode: '11103', name: 'さいたま市大宮区' },
  'yokohama-nishi':    { prefCode: '14', cityCode: '14101', name: '横浜市西区' },
  'yokohama-naka':     { prefCode: '14', cityCode: '14102', name: '横浜市中区' },
  'kawasaki-nakahara': { prefCode: '14', cityCode: '14132', name: '川崎市中原区' },
  'osaka-kita':        { prefCode: '27', cityCode: '27127', name: '大阪市北区' },
  'osaka-tennoji':     { prefCode: '27', cityCode: '27109', name: '大阪市天王寺区' },
  'fukuoka-chuo':      { prefCode: '40', cityCode: '40131', name: '福岡市中央区' },
  'fukuoka-hakata':    { prefCode: '40', cityCode: '40133', name: '福岡市博多区' },
  'nagoya-naka':       { prefCode: '23', cityCode: '23106', name: '名古屋市中区' },
  'sapporo-chuo':      { prefCode: '01', cityCode: '01101', name: '札幌市中央区' },
};

const DYNAMIC_AREA_PATTERN = /^(\d{2})-(\d{5})$/;

export class EstateError extends Error {
  constructor(message: string, public readonly code: string, public readonly status?: number) {
    super(message);
    this.name = 'EstateError';
  }
}

export function resolveEstateArea(area: string): AreaCode {
  const key = area.trim().toLowerCase();
  if (ESTATE_AREA_MAP[key]) return ESTATE_AREA_MAP[key];
  const m = key.match(DYNAMIC_AREA_PATTERN);
  if (m) {
    const [, pref, city] = m;
    const n = Number(pref);
    if (n >= 1 && n <= 47 && city.slice(0, 2) === pref) {
      return { prefCode: pref, cityCode: city, name: `${pref}-${city}` };
    }
  }
  throw new EstateError(
    `Unknown area "${area}". Use a known slug or "{prefCode}-{cityCode}".`,
    'UNKNOWN_AREA'
  );
}

// ─── REINFOLIB helpers ──────────────────────────────────────────────────────

export interface TsuboPriceResult {
  area: string;
  areaName: string;
  tsuboPriceYen: number;
  tsuboPriceMan: number;
  sampleCount: number;
}

export async function getTsuboPrice(area: string): Promise<TsuboPriceResult> {
  const resolved = resolveEstateArea(area);
  const year = String(new Date().getFullYear() - 1);
  const txs = await getTransactions({ year, quarter: '2', city: resolved.cityCode });
  const prices = txs.map((t) => Number(t.UnitPrice)).filter((n) => Number.isFinite(n) && n > 0);
  if (prices.length === 0) {
    throw new EstateError(`${resolved.name} のデータが見つかりません`, 'NO_DATA');
  }
  const avgPerSqm = prices.reduce((a, b) => a + b, 0) / prices.length;
  const tsuboPriceYen = avgPerSqm * SQM_PER_TSUBO;
  return {
    area,
    areaName: resolved.name,
    tsuboPriceYen,
    tsuboPriceMan: Math.round(tsuboPriceYen / 10000),
    sampleCount: prices.length,
  };
}

export interface YearlyTsuboPoint {
  year: number;
  tsuboPriceMan: number;
  sampleCount: number;
}

export async function getYearlyTsuboHistory(
  area: string,
  startYear: number,
  endYear: number,
  quarter: 1 | 2 | 3 | 4 = 2,
): Promise<YearlyTsuboPoint[]> {
  resolveEstateArea(area);
  const resolved = resolveEstateArea(area);
  const out: YearlyTsuboPoint[] = [];
  for (let y = startYear; y <= endYear; y++) {
    try {
      const txs = await getTransactions({ year: String(y), quarter: String(quarter), city: resolved.cityCode });
      const prices = txs.map((t) => Number(t.UnitPrice)).filter((n) => Number.isFinite(n) && n > 0);
      if (prices.length === 0) continue;
      const avgPerSqm = prices.reduce((a, b) => a + b, 0) / prices.length;
      const tsuboPriceYen = avgPerSqm * SQM_PER_TSUBO;
      out.push({ year: y, tsuboPriceMan: Math.round(tsuboPriceYen / 10000), sampleCount: prices.length });
    } catch {
      // skip year on transient failure
    }
  }
  return out;
}

// ─── Scoring engine ──────────────────────────────────────────────────────────

const WEIGHTS = { price: 0.4, convenience: 0.3, future: 0.3 };

export interface ScoringInputs {
  propertyTsuboMan?: number;
  stationDistanceMin?: number;
  lineCount?: number;
  redevelopmentFlag?: boolean;
  populationTrend?: 'up' | 'flat' | 'down';
}

export interface ScoreBreakdown {
  priceFairness: { score: number; weight: number; tsuboPriceMan: number; areaAvgTsuboMan: number; deltaPercent: number; note: string };
  convenience: { score: number; weight: number; stationDistanceMin: number; lineCount: number; note: string };
  future: { score: number; weight: number; redevelopmentFlag: boolean; populationTrend: string; note: string };
}

export interface ScoreResult {
  overall: number;
  breakdown: ScoreBreakdown;
}

function scorePrice(propertyTsuboMan: number | undefined, areaAvg: number) {
  if (propertyTsuboMan === undefined) return { score: 50, delta: 0, note: '物件単価未指定のため中立値 (50) を使用' };
  if (areaAvg <= 0) return { score: 50, delta: 0, note: 'エリア平均が取得できないため中立値' };
  const delta = (propertyTsuboMan - areaAvg) / areaAvg;
  const score = Math.max(0, Math.min(100, Math.round(70 - delta * 100)));
  return { score, delta: Math.round(delta * 1000) / 10, note: delta < 0 ? 'エリア平均より割安' : delta > 0 ? 'エリア平均より割高' : 'エリア平均水準' };
}

function scoreConvenience(distanceMin: number, lineCount: number) {
  let base: number;
  if (distanceMin <= 5) base = 100;
  else if (distanceMin <= 10) base = 100 - (distanceMin - 5) * 6;
  else if (distanceMin <= 15) base = 70 - (distanceMin - 10) * 6;
  else if (distanceMin <= 20) base = 40 - (distanceMin - 15) * 6;
  else base = 10;
  const bonus = Math.min(15, Math.max(0, lineCount - 1) * 5);
  const score = Math.max(0, Math.min(100, Math.round(base + bonus)));
  return { score, note: `徒歩${distanceMin}分 / ${lineCount}路線` };
}

function scoreFuture(redevelopmentFlag: boolean, populationTrend: 'up' | 'flat' | 'down') {
  let score = 50;
  if (redevelopmentFlag) score += 25;
  if (populationTrend === 'up') score += 15;
  else if (populationTrend === 'down') score -= 15;
  score = Math.max(0, Math.min(100, score));
  const notes: string[] = [];
  if (redevelopmentFlag) notes.push('再開発エリア');
  notes.push(`人口${populationTrend === 'up' ? '増加' : populationTrend === 'down' ? '減少' : '横ばい'}`);
  return { score, note: notes.join(' / ') };
}

export async function computeEstateScore(area: string, inputs: ScoringInputs = {}): Promise<ScoreResult & { areaData: TsuboPriceResult }> {
  const areaData = await getTsuboPrice(area);
  const {
    propertyTsuboMan,
    stationDistanceMin = 10,
    lineCount = 1,
    redevelopmentFlag = false,
    populationTrend = 'flat',
  } = inputs;

  const price = scorePrice(propertyTsuboMan, areaData.tsuboPriceMan);
  const conv = scoreConvenience(stationDistanceMin, lineCount);
  const fut = scoreFuture(redevelopmentFlag, populationTrend);

  const overall = Math.round(price.score * WEIGHTS.price + conv.score * WEIGHTS.convenience + fut.score * WEIGHTS.future);

  return {
    overall,
    breakdown: {
      priceFairness: { score: price.score, weight: WEIGHTS.price, tsuboPriceMan: propertyTsuboMan ?? areaData.tsuboPriceMan, areaAvgTsuboMan: areaData.tsuboPriceMan, deltaPercent: price.delta, note: price.note },
      convenience: { score: conv.score, weight: WEIGHTS.convenience, stationDistanceMin, lineCount, note: conv.note },
      future: { score: fut.score, weight: WEIGHTS.future, redevelopmentFlag, populationTrend, note: fut.note },
    },
    areaData,
  };
}
