import { NextRequest, NextResponse } from "next/server";
import { getTransactions, Transaction } from "@/lib/api";

export const dynamic = "force-dynamic";

const TYPE_MAP: Record<string, string> = {
  mansion: "中古マンション等",
  house: "宅地(土地と建物)",
  land: "宅地(土地)",
};

function parsePrice(s: string): number {
  const n = parseInt(s.replace(/,/g, ""), 10);
  return isNaN(n) ? 0 : n;
}

function parseArea(s: string): number {
  const n = parseFloat(s);
  return isNaN(n) ? 0 : n;
}

function parseAge(buildingYear: string): number {
  // e.g. "昭和63年" or "平成5年" or "2010年" or "令和3年"
  if (!buildingYear) return 0;
  const currentYear = new Date().getFullYear();

  let year = 0;
  if (buildingYear.startsWith("昭和")) {
    const y = parseInt(buildingYear.replace("昭和", "").replace("年", ""), 10);
    year = 1925 + y;
  } else if (buildingYear.startsWith("平成")) {
    const y = parseInt(buildingYear.replace("平成", "").replace("年", ""), 10);
    year = 1988 + y;
  } else if (buildingYear.startsWith("令和")) {
    const y = parseInt(buildingYear.replace("令和", "").replace("年", ""), 10);
    year = 2018 + y;
  } else if (buildingYear.startsWith("大正")) {
    const y = parseInt(buildingYear.replace("大正", "").replace("年", ""), 10);
    year = 1911 + y;
  } else {
    const y = parseInt(buildingYear.replace("年", ""), 10);
    year = isNaN(y) ? 0 : y;
  }
  return year > 0 ? currentYear - year : 0;
}

function parseStationMin(s: string): number {
  if (!s) return 999;
  const n = parseInt(s, 10);
  return isNaN(n) ? 999 : n;
}

function percentile(sorted: number[], p: number): number {
  if (sorted.length === 0) return 0;
  const idx = (p / 100) * (sorted.length - 1);
  const lower = Math.floor(idx);
  const upper = Math.ceil(idx);
  if (lower === upper) return sorted[lower];
  return sorted[lower] + (sorted[upper] - sorted[lower]) * (idx - lower);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const {
    type,        // "mansion" | "house" | "land"
    area: prefCode,  // prefecture code e.g. "13"
    city,        // city code (optional)
    floorArea,   // number (m²)
    buildingAge, // number (years, 0 for land)
    stationMin,  // number (minutes, -1 = unknown)
    floorPlan,   // string e.g. "2LDK" (optional)
  } = body;

  if (!type || !prefCode || !floorArea) {
    return NextResponse.json({ error: "type, area, floorArea are required" }, { status: 400 });
  }

  const targetType = TYPE_MAP[type];
  if (!targetType) {
    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  }

  const currentYear = new Date().getFullYear();
  // Fetch last 2 years × 4 quarters
  const years = [String(currentYear - 1), String(currentYear - 2)];
  const quarters = ["1", "2", "3", "4"];

  const allRows: Transaction[] = [];

  await Promise.all(
    years.flatMap((year) =>
      quarters.map(async (quarter) => {
        try {
          const rows = await getTransactions({
            year,
            quarter,
            area: prefCode,
            ...(city ? { city } : {}),
          });
          allRows.push(...rows);
        } catch {
          // skip failed quarters
        }
      })
    )
  );

  // Filter by type
  const typed = allRows.filter((r) => r.Type === targetType);

  // Filter by floor area: ±50%
  const targetArea = parseFloat(floorArea);
  const areaFiltered = typed.filter((r) => {
    const a = parseArea(r.TotalFloorArea || r.Area);
    if (a === 0) return false;
    const ratio = a / targetArea;
    return ratio >= 0.5 && ratio <= 1.5;
  });

  // For mansion/house: apply age filter (±15 years)
  let ageFiltered = areaFiltered;
  if (type !== "land" && buildingAge !== undefined && buildingAge >= 0) {
    ageFiltered = areaFiltered.filter((r) => {
      const age = parseAge(r.BuildingYear);
      if (age === 0) return true; // unknown age: include
      return Math.abs(age - buildingAge) <= 15;
    });
    // If too few results, relax
    if (ageFiltered.length < 5) ageFiltered = areaFiltered;
  }

  // For mansion: apply station distance filter (±10 min)
  let stationFiltered = ageFiltered;
  if (stationMin !== undefined && stationMin >= 0) {
    stationFiltered = ageFiltered.filter((r) => {
      const min = parseStationMin(r.TimeToNearestStation);
      if (min === 999) return true; // unknown: include
      return Math.abs(min - stationMin) <= 10;
    });
    if (stationFiltered.length < 5) stationFiltered = ageFiltered;
  }

  // Filter by floor plan (optional, fuzzy match on prefix)
  let planFiltered = stationFiltered;
  if (floorPlan && floorPlan !== "") {
    const filtered = stationFiltered.filter((r) => {
      if (!r.FloorPlan) return false;
      return r.FloorPlan.startsWith(floorPlan) || r.FloorPlan === floorPlan;
    });
    if (filtered.length >= 5) planFiltered = filtered;
  }

  // Extract valid price per sqm
  const comparable = planFiltered.filter((r) => {
    const price = parsePrice(r.TradePrice);
    const area = parseArea(r.TotalFloorArea || r.Area);
    return price > 0 && area > 0;
  });

  if (comparable.length < 3) {
    return NextResponse.json({
      error: "データ不足",
      message: "該当エリアの類似物件データが不足しています。条件を広げてお試しください。",
      count: comparable.length,
    }, { status: 422 });
  }

  // Calculate price per sqm
  const pricesPerSqm = comparable
    .map((r) => parsePrice(r.TradePrice) / parseArea(r.TotalFloorArea || r.Area))
    .sort((a, b) => a - b);

  const p25 = percentile(pricesPerSqm, 25);
  const p50 = percentile(pricesPerSqm, 50);
  const p75 = percentile(pricesPerSqm, 75);

  const estimateLow = Math.round((p25 * targetArea) / 10000) * 10000;
  const estimateMid = Math.round((p50 * targetArea) / 10000) * 10000;
  const estimateHigh = Math.round((p75 * targetArea) / 10000) * 10000;

  // Representative comparable samples (up to 5, sorted by recency)
  const samples = comparable
    .sort((a, b) => (b.Period > a.Period ? 1 : -1))
    .slice(0, 5)
    .map((r) => ({
      period: r.Period,
      municipality: r.Municipality,
      district: r.DistrictName,
      price: parsePrice(r.TradePrice),
      area: parseArea(r.TotalFloorArea || r.Area),
      pricePerSqm: Math.round(parsePrice(r.TradePrice) / parseArea(r.TotalFloorArea || r.Area)),
      buildingYear: r.BuildingYear || null,
      station: r.NearestStation || null,
      stationMin: r.TimeToNearestStation || null,
      floorPlan: r.FloorPlan || null,
    }));

  return NextResponse.json({
    count: comparable.length,
    estimate: {
      low: estimateLow,
      mid: estimateMid,
      high: estimateHigh,
    },
    pricePerSqm: {
      low: Math.round(p25),
      mid: Math.round(p50),
      high: Math.round(p75),
    },
    samples,
  });
}
