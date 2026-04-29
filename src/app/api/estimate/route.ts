import { NextRequest, NextResponse } from "next/server";
import { getTransactions, Transaction } from "@/lib/api";
import { checkAndIncrementUsage } from "@/lib/usageLimit";

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

function parseStationMin(s: string | undefined): number {
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

// Period string "20241" → year number 2024, "20243" → quarter index 2024.5
function periodToYear(period: string): number {
  return parseInt(period.substring(0, 4), 10);
}

// Period to fractional year for quarterly resolution: "20243" → 2024.5
function periodToQuarterYear(period: string): number {
  const year = parseInt(period.substring(0, 4), 10);
  const quarter = parseInt(period.substring(4), 10) || 1;
  return year + (quarter - 1) * 0.25;
}

// Remove outliers using IQR method
function removeOutliers(values: number[]): number[] {
  if (values.length < 4) return values;
  const sorted = [...values].sort((a, b) => a - b);
  const q1 = percentile(sorted, 25);
  const q3 = percentile(sorted, 75);
  const iqr = q3 - q1;
  const lower = q1 - 1.5 * iqr;
  const upper = q3 + 1.5 * iqr;
  return values.filter((v) => v >= lower && v <= upper);
}

// Weighted linear regression: recent data points get higher weight
// weights decay exponentially: newest=1.0, oldest=decayFactor^n
function weightedLinearRegression(
  points: { x: number; y: number }[],
  decayFactor = 0.85
): { slope: number; intercept: number } {
  const n = points.length;
  if (n < 2) return { slope: 0, intercept: points[0]?.y || 0 };

  // Sort by x ascending, assign weights (newest = highest weight)
  const sorted = [...points].sort((a, b) => a.x - b.x);
  const weights = sorted.map((_, i) => Math.pow(decayFactor, n - 1 - i));

  const sumW = weights.reduce((s, w) => s + w, 0);
  const sumWX = sorted.reduce((s, p, i) => s + weights[i] * p.x, 0);
  const sumWY = sorted.reduce((s, p, i) => s + weights[i] * p.y, 0);
  const sumWXY = sorted.reduce((s, p, i) => s + weights[i] * p.x * p.y, 0);
  const sumWX2 = sorted.reduce((s, p, i) => s + weights[i] * p.x * p.x, 0);

  const denom = sumW * sumWX2 - sumWX * sumWX;
  if (denom === 0) return { slope: 0, intercept: sumWY / sumW };

  const slope = (sumW * sumWXY - sumWX * sumWY) / denom;
  const intercept = (sumWY - slope * sumWX) / sumW;

  return { slope, intercept };
}

// Annual depreciation rate by property type
const DEPRECIATION_RATE: Record<string, number> = {
  mansion: 0.015, // 1.5%/year for mansions
  house: 0.02,    // 2.0%/year for houses
  land: 0,        // no depreciation for land
};

// Clamp value between min and max
function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

// Calculate asset score breakdown
function calcAssetScore(
  annualGrowthRate: number,
  stationMin: number,
  totalTransactions: number,
  recentTransactions: number,
  midPricePerSqm: number,
  areaMedianPerSqm: number
): {
  total: number;
  grade: string;
  breakdown: Record<string, { score: number; label: string; weight: number }>;
} {
  // 1. Price trend score (weight 30%)
  // -5% or worse = 0, +5% or better = 100
  const trendScore = clamp(Math.round((annualGrowthRate + 0.05) / 0.10 * 100), 0, 100);

  // 2. Station access score (weight 20%)
  // 1min = 100, 20min+ = 20
  let stationScore = 80;
  if (stationMin >= 0 && stationMin < 999) {
    stationScore = clamp(Math.round(100 - (stationMin - 1) * (80 / 19)), 20, 100);
  }

  // 3. Area demand score (weight 20%)
  // Based on total transactions over 5 years: 500+ = 100, <10 = 10
  const demandScore = clamp(Math.round(Math.min(totalTransactions / 500, 1) * 90 + 10), 10, 100);

  // 4. Price gap (affordability) score (weight 15%)
  // How much below area median: 20% below = 100, 20% above = 0
  let gapScore = 50;
  if (areaMedianPerSqm > 0 && midPricePerSqm > 0) {
    const gap = (areaMedianPerSqm - midPricePerSqm) / areaMedianPerSqm;
    gapScore = clamp(Math.round((gap + 0.2) / 0.4 * 100), 0, 100);
  }

  // 5. Liquidity score (weight 15%)
  // Recent (last 1 year) transactions: 100+ = 100, <5 = 10
  const liquidityScore = clamp(Math.round(Math.min(recentTransactions / 100, 1) * 90 + 10), 10, 100);

  const breakdown = {
    priceTrend: { score: trendScore, label: "価格トレンド", weight: 30 },
    stationAccess: { score: stationScore, label: "駅アクセス", weight: 20 },
    areaDemand: { score: demandScore, label: "エリア需要", weight: 20 },
    priceGap: { score: gapScore, label: "割安度", weight: 15 },
    liquidity: { score: liquidityScore, label: "流動性", weight: 15 },
  };

  const total = Math.round(
    Object.values(breakdown).reduce((s, b) => s + b.score * (b.weight / 100), 0)
  );

  const grade = total >= 90 ? "S" : total >= 75 ? "A" : total >= 60 ? "B" : total >= 40 ? "C" : "D";

  return { total, grade, breakdown };
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const email = body.email || null; // optional: sent from frontend for logged-in users

  // Usage limit check for free members (monthly limit: 1 estimate)
  if (email) {
    const { result: usage, tier } = await checkAndIncrementUsage(email, "estimate", {
      free: 1,   // free members: 1 estimate/month
      guest: 999, // guests: unlimited (gated by frontend)
    });
    if (!usage.allowed) {
      return NextResponse.json({
        error: "月間利用上限",
        message: `無料プランのAI査定は月${usage.limit}回までです。スタンダードプランにアップグレードすると無制限でご利用いただけます。`,
        usage,
        tier,
      }, { status: 429 });
    }
  }

  const {
    type,
    area: prefCode,
    city,
    floorArea,
    buildingAge,
    stationMin,
    floorPlan,
  } = body;

  if (!type || !prefCode || !floorArea) {
    return NextResponse.json({ error: "type, area, floorArea are required" }, { status: 400 });
  }

  const targetType = TYPE_MAP[type];
  if (!targetType) {
    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  }

  const currentYear = new Date().getFullYear();
  // Fetch last 5 years × 4 quarters for trend analysis
  const years = Array.from({ length: 5 }, (_, i) => String(currentYear - 1 - i));
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
      if (age === 0) return true;
      return Math.abs(age - buildingAge) <= 15;
    });
    if (ageFiltered.length < 5) ageFiltered = areaFiltered;
  }

  // For mansion: apply station distance filter (±10 min)
  let stationFiltered = ageFiltered;
  if (stationMin !== undefined && stationMin >= 0) {
    stationFiltered = ageFiltered.filter((r) => {
      const min = parseStationMin(r.TimeToNearestStation);
      if (min === 999) return true;
      return Math.abs(min - stationMin) <= 10;
    });
    if (stationFiltered.length < 5) stationFiltered = ageFiltered;
  }

  // Filter by floor plan (optional)
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

  // --- Existing: Calculate current estimate ---
  // Use only recent 2 years for current price estimate
  const recentYears = new Set([String(currentYear - 1), String(currentYear - 2)]);
  const recentComparable = comparable.filter((r) => recentYears.has(String(periodToYear(r.Period))));
  const estimateBase = recentComparable.length >= 3 ? recentComparable : comparable;

  const pricesPerSqm = estimateBase
    .map((r) => parsePrice(r.TradePrice) / parseArea(r.TotalFloorArea || r.Area))
    .sort((a, b) => a - b);

  const p25 = percentile(pricesPerSqm, 25);
  const p50 = percentile(pricesPerSqm, 50);
  const p75 = percentile(pricesPerSqm, 75);

  const estimateLow = Math.round((p25 * targetArea) / 10000) * 10000;
  const estimateMid = Math.round((p50 * targetArea) / 10000) * 10000;
  const estimateHigh = Math.round((p75 * targetArea) / 10000) * 10000;

  // Representative samples
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

  // --- Future Price Prediction (v2: quarterly, weighted, depreciation-adjusted) ---

  // Step 1: Group by quarter → median price per sqm (with IQR outlier removal)
  const quarterGroups: Record<string, number[]> = {};
  comparable.forEach((r) => {
    const period = r.Period;
    if (!period) return;
    const ppsm = parsePrice(r.TradePrice) / parseArea(r.TotalFloorArea || r.Area);
    if (!quarterGroups[period]) quarterGroups[period] = [];
    quarterGroups[period].push(ppsm);
  });

  // Compute quarterly medians with outlier removal
  const quarterlyData = Object.entries(quarterGroups)
    .map(([period, prices]) => {
      const cleaned = removeOutliers(prices);
      cleaned.sort((a, b) => a - b);
      return {
        period,
        quarterYear: periodToQuarterYear(period),
        year: periodToYear(period),
        medianPricePerSqm: Math.round(percentile(cleaned, 50)),
        count: cleaned.length,
      };
    })
    .filter((q) => q.count >= 2) // need at least 2 transactions per quarter
    .sort((a, b) => a.quarterYear - b.quarterYear);

  // Step 2: Weighted linear regression on quarterly data (recent quarters weighted more)
  const regressionPoints = quarterlyData.map((q) => ({
    x: q.quarterYear,
    y: q.medianPricePerSqm,
  }));
  const reg = weightedLinearRegression(regressionPoints, 0.90);

  // Step 3: Calculate annual growth rate from regression
  const currentPricePerSqm = p50;
  const basePrice = reg.slope * currentYear + reg.intercept;
  const annualGrowthRate = basePrice > 0 ? reg.slope / basePrice : 0;

  // Step 4: Data-driven scenario spread from actual quarterly volatility
  // Calculate quarter-over-quarter growth rates
  const qoqGrowthRates: number[] = [];
  for (let i = 1; i < quarterlyData.length; i++) {
    const prev = quarterlyData[i - 1].medianPricePerSqm;
    const curr = quarterlyData[i].medianPricePerSqm;
    if (prev > 0) {
      // Annualize: quarterly rate * 4
      qoqGrowthRates.push(((curr - prev) / prev) * 4);
    }
  }

  // Standard deviation of annualized growth rates → scenario spread
  let spreadPct = 0.02; // fallback: ±2%
  if (qoqGrowthRates.length >= 3) {
    const mean = qoqGrowthRates.reduce((s, r) => s + r, 0) / qoqGrowthRates.length;
    const variance = qoqGrowthRates.reduce((s, r) => s + (r - mean) ** 2, 0) / qoqGrowthRates.length;
    const stdDev = Math.sqrt(variance);
    // Use 1 standard deviation, clamped to reasonable range (0.5% ~ 5%)
    spreadPct = clamp(stdDev, 0.005, 0.05);
  }

  const pessimisticRate = annualGrowthRate - spreadPct;
  const optimisticRate = annualGrowthRate + spreadPct;

  // Step 5: Building depreciation adjustment
  const depreciationRate = DEPRECIATION_RATE[type] || 0;
  const currentAge = buildingAge !== undefined && buildingAge >= 0 ? buildingAge : 0;

  // Step 6: Generate forecast with depreciation
  const forecast = Array.from({ length: 10 }, (_, i) => {
    const yr = currentYear + 1 + i;
    const yearsOut = i + 1;
    const futureAge = currentAge + yearsOut;

    // Market appreciation (compound growth)
    const stdMarket = currentPricePerSqm * Math.pow(1 + annualGrowthRate, yearsOut);
    const pessMarket = currentPricePerSqm * Math.pow(1 + pessimisticRate, yearsOut);
    const optMarket = currentPricePerSqm * Math.pow(1 + optimisticRate, yearsOut);

    // Depreciation factor: diminishing over time (older buildings depreciate less)
    // Formula: effective rate decreases as building ages (log curve)
    const depFactor = depreciationRate > 0
      ? Math.max(0.5, 1 - depreciationRate * yearsOut * (30 / (30 + futureAge)))
      : 1;

    return {
      year: yr,
      pessimistic: Math.max(Math.round(pessMarket * depFactor * targetArea), 0),
      standard: Math.max(Math.round(stdMarket * depFactor * targetArea), 0),
      optimistic: Math.max(Math.round(optMarket * depFactor * targetArea), 0),
    };
  });

  // Build historical trend (annual aggregation for display)
  const yearGroups: Record<number, number[]> = {};
  quarterlyData.forEach((q) => {
    if (!yearGroups[q.year]) yearGroups[q.year] = [];
    yearGroups[q.year].push(q.medianPricePerSqm);
  });
  const historicalTrend = Object.entries(yearGroups)
    .map(([yr, prices]) => ({
      year: parseInt(yr, 10),
      avgPricePerSqm: Math.round(prices.reduce((s, p) => s + p, 0) / prices.length),
    }))
    .sort((a, b) => a.year - b.year);

  const prediction = {
    historicalTrend: historicalTrend.map((h) => ({
      year: h.year,
      avgPricePerSqm: h.avgPricePerSqm,
      totalPrice: Math.round(h.avgPricePerSqm * targetArea),
    })),
    annualGrowthRate: {
      pessimistic: pessimisticRate,
      standard: annualGrowthRate,
      optimistic: optimisticRate,
    },
    forecast,
    // Metadata for transparency
    metadata: {
      quarterlyDataPoints: quarterlyData.length,
      spreadMethod: qoqGrowthRates.length >= 3 ? "data-driven" : "fixed",
      spreadPct: Math.round(spreadPct * 1000) / 1000,
      depreciationApplied: depreciationRate > 0,
      depreciationRate,
    },
  };

  // --- NEW: Asset Score ---
  const recentOneYear = comparable.filter((r) => {
    const yr = periodToYear(r.Period);
    return yr === currentYear - 1;
  });

  // Area-wide median (all types, unfiltered) for gap calculation
  const allPricesPerSqm = typed
    .filter((r) => parsePrice(r.TradePrice) > 0 && parseArea(r.TotalFloorArea || r.Area) > 0)
    .map((r) => parsePrice(r.TradePrice) / parseArea(r.TotalFloorArea || r.Area))
    .sort((a, b) => a - b);
  const areaMedianPerSqm = allPricesPerSqm.length > 0 ? percentile(allPricesPerSqm, 50) : p50;

  const assetScore = calcAssetScore(
    annualGrowthRate,
    stationMin !== undefined && stationMin >= 0 ? stationMin : 999,
    comparable.length,
    recentOneYear.length,
    p50,
    areaMedianPerSqm
  );

  return NextResponse.json({
    count: estimateBase.length,
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
    prediction,
    assetScore,
  });
}
