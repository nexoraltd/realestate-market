import { NextRequest, NextResponse } from 'next/server';
import { resolveEstateArea, getYearlyTsuboHistory, EstateError, YearlyTsuboPoint } from '@/lib/estateScore';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const FORECAST_HORIZON_YEARS = 5;
const HISTORY_START = 2020;
const HISTORY_END = 2024;

const DISCLAIMER =
  '本予測は REINFOLIB の実取引データに対する単純な線形回帰による推定値です。' +
  '将来の市況・金利・人口動態を保証するものではありません。投資判断はご自身の責任で行ってください。';

interface Regression {
  slope: number;
  intercept: number;
  rmse: number;
  rSquared: number;
}

function linearRegression(points: YearlyTsuboPoint[], baseYear: number): Regression {
  const n = points.length;
  if (n < 2) {
    const only = points[0]?.tsuboPriceMan ?? 0;
    return { slope: 0, intercept: only, rmse: 0, rSquared: 0 };
  }
  const xs = points.map((p) => p.year - baseYear);
  const ys = points.map((p) => p.tsuboPriceMan);
  const meanX = xs.reduce((a, b) => a + b, 0) / n;
  const meanY = ys.reduce((a, b) => a + b, 0) / n;
  const ssXX = xs.reduce((a, x) => a + (x - meanX) ** 2, 0);
  const ssXY = xs.reduce((a, x, i) => a + (x - meanX) * (ys[i] - meanY), 0);
  const slope = ssXX === 0 ? 0 : ssXY / ssXX;
  const intercept = meanY - slope * meanX;
  const ssRes = ys.reduce((a, y, i) => a + (y - (intercept + slope * xs[i])) ** 2, 0);
  const ssTot = ys.reduce((a, y) => a + (y - meanY) ** 2, 0);
  const rmse = Math.sqrt(ssRes / n);
  const rSquared = ssTot === 0 ? 1 : 1 - ssRes / ssTot;
  return { slope, intercept, rmse, rSquared };
}

function classifyConfidence(totalSamples: number, rSquared: number): 'low' | 'medium' | 'high' {
  if (totalSamples < 10 || rSquared < 0.3) return 'low';
  if (totalSamples < 30 || rSquared < 0.6) return 'medium';
  return 'high';
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ area: string }> }
) {
  const { area } = await params;

  let resolved: { prefCode: string; cityCode: string; name: string };
  try {
    resolved = resolveEstateArea(area);
  } catch (e) {
    if (e instanceof EstateError) {
      return NextResponse.json({ error: e.code, message: e.message }, { status: 404 });
    }
    throw e;
  }

  try {
    const points = await getYearlyTsuboHistory(area, HISTORY_START, HISTORY_END, 2);

    if (points.length === 0) {
      return NextResponse.json(
        { error: 'NO_DATA', message: `${resolved.name} の ${HISTORY_START}-${HISTORY_END} に取引データがありません`, dataSource: 'REINFOLIB' },
        { status: 404 }
      );
    }

    const baseYear = points[points.length - 1].year;
    const basePrice = points[points.length - 1].tsuboPriceMan;
    const reg = linearRegression(points, baseYear);
    const totalSamples = points.reduce((a, p) => a + p.sampleCount, 0);
    const confidence = classifyConfidence(totalSamples, reg.rSquared);

    const projectedMid = reg.intercept + reg.slope * FORECAST_HORIZON_YEARS;
    const sigma = Math.max(reg.rmse, basePrice * 0.05);
    const widening = confidence === 'low' ? 1.5 : confidence === 'medium' ? 1.2 : 1.0;
    const band = sigma * widening;

    return NextResponse.json({
      area,
      areaName: resolved.name,
      basePrice,
      forecastLow: Math.max(0, Math.round(projectedMid - band)),
      forecastMid: Math.max(0, Math.round(projectedMid)),
      forecastHigh: Math.max(0, Math.round(projectedMid + band)),
      annualGrowthRate: basePrice > 0 ? Number(((reg.slope / basePrice) * 100).toFixed(2)) : 0,
      dataPoints: points.map((p) => ({ year: p.year, tsuboPrice: p.tsuboPriceMan })),
      confidence,
      horizonYears: FORECAST_HORIZON_YEARS,
      baseYear,
      forecastYear: baseYear + FORECAST_HORIZON_YEARS,
      disclaimer: DISCLAIMER,
      dataSource: 'REINFOLIB',
      generatedAt: new Date().toISOString(),
    });
  } catch (e) {
    if (e instanceof EstateError) {
      return NextResponse.json({ error: e.code, message: e.message }, { status: 500 });
    }
    const msg = e instanceof Error ? e.message : 'unknown error';
    return NextResponse.json({ error: 'INTERNAL_ERROR', message: msg }, { status: 500 });
  }
}
