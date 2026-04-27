import { NextRequest, NextResponse } from 'next/server';
import { computeEstateScore, EstateError } from '@/lib/estateScore';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ area: string }> }
) {
  const { area } = await params;

  const sp = req.nextUrl.searchParams;
  const propertyTsuboMan = sp.get('propertyTsuboMan') ? Number(sp.get('propertyTsuboMan')) : undefined;
  const stationDistanceMin = sp.get('stationDistanceMin') ? Number(sp.get('stationDistanceMin')) : undefined;
  const lineCount = sp.get('lineCount') ? Number(sp.get('lineCount')) : undefined;
  const redevelopmentFlag = sp.get('redevelopment') === 'true';
  const populationTrend = (sp.get('populationTrend') as 'up' | 'flat' | 'down') || undefined;

  try {
    const result = await computeEstateScore(area, {
      propertyTsuboMan,
      stationDistanceMin,
      lineCount,
      redevelopmentFlag,
      populationTrend,
    });
    return NextResponse.json({
      area,
      score: result.overall,
      breakdown: result.breakdown,
      areaData: result.areaData,
      generatedAt: new Date().toISOString(),
      dataSource: 'REINFOLIB',
    });
  } catch (e) {
    if (e instanceof EstateError) {
      const status = e.code === 'UNKNOWN_AREA' ? 404 : e.code === 'NO_DATA' ? 404 : 500;
      return NextResponse.json({ error: e.code, message: e.message }, { status });
    }
    const msg = e instanceof Error ? e.message : 'unknown error';
    return NextResponse.json({ error: 'INTERNAL_ERROR', message: msg }, { status: 500 });
  }
}
