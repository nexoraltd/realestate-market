"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import TransactionTable from "@/components/TransactionTable";
import PaywallOverlay from "@/components/PaywallOverlay";
import { PREFECTURES } from "@/lib/prefectures";
import { fetchWithAuth } from "@/lib/fetchWithAuth";

interface Transaction {
  Type: string;
  Region: string;
  MunicipalityCode: string;
  Prefecture: string;
  Municipality: string;
  DistrictName: string;
  TradePrice: string;
  PricePerUnit: string;
  FloorPlan: string;
  Area: string;
  UnitPrice: string;
  LandShape: string;
  Frontage: string;
  TotalFloorArea: string;
  BuildingYear: string;
  Structure: string;
  Use: string;
  Purpose: string;
  Direction: string;
  Classification: string;
  Breadth: string;
  CityPlanning: string;
  CoverageRatio: string;
  FloorAreaRatio: string;
  Period: string;
  Renovation: string;
  Remarks: string;
  PriceCategory: string;
  DistrictCode: string;
  NearestStation: string;
  TimeToNearestStation: string;
}

const QUARTER_LABELS: Record<string, string> = {
  "1": "第1四半期 (1-3月)",
  "2": "第2四半期 (4-6月)",
  "3": "第3四半期 (7-9月)",
  "4": "第4四半期 (10-12月)",
};

const FREE_LIMIT = 5;

const PRICE_RANGES = [
  { label: "全て", min: 0, max: Infinity },
  { label: "~1,000万", min: 0, max: 10000000 },
  { label: "1,000~3,000万", min: 10000000, max: 30000000 },
  { label: "3,000~5,000万", min: 30000000, max: 50000000 },
  { label: "5,000万~1億", min: 50000000, max: 100000000 },
  { label: "1億~", min: 100000000, max: Infinity },
];

const BUILDING_AGE_RANGES = [
  { label: "全て", maxAge: Infinity },
  { label: "新築~5年", maxAge: 5 },
  { label: "~10年", maxAge: 10 },
  { label: "~20年", maxAge: 20 },
  { label: "~30年", maxAge: 30 },
  { label: "30年超", maxAge: Infinity, minAge: 30 },
];

export default function SearchResults() {
  const params = useSearchParams();
  const area = params.get("area");
  const city = params.get("city");
  const year = params.get("year");
  const quarter = params.get("quarter");

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Filters
  const [typeFilter, setTypeFilter] = useState("all");
  const [floorPlanFilter, setFloorPlanFilter] = useState("all");
  const [priceRange, setPriceRange] = useState(0);
  const [ageRange, setAgeRange] = useState(0);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const prefName =
    PREFECTURES.find((p) => p.code === area)?.name || area || "";

  useEffect(() => {
    if (!area || !year || !quarter) return;

    setLoading(true);
    setError("");

    const query = new URLSearchParams({ year, quarter });
    if (city) query.set("city", city);
    else if (area) query.set("area", area);

    fetchWithAuth(`/api/transactions?${query.toString()}`)
      .then((r) => {
        if (!r.ok) throw new Error("取得に失敗しました");
        return r.json();
      })
      .then((data) => {
        setTransactions(Array.isArray(data) ? data : []);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [area, city, year, quarter]);

  // Derived filter options
  const types = useMemo(
    () => Array.from(new Set(transactions.map((t) => t.Type).filter(Boolean))),
    [transactions]
  );

  const floorPlans = useMemo(
    () =>
      Array.from(new Set(transactions.map((t) => t.FloorPlan).filter(Boolean))).sort(),
    [transactions]
  );

  // Apply filters
  const filtered = useMemo(() => {
    let result = transactions;

    if (typeFilter !== "all") {
      result = result.filter((t) => t.Type === typeFilter);
    }

    if (floorPlanFilter !== "all") {
      result = result.filter((t) => t.FloorPlan === floorPlanFilter);
    }

    const pr = PRICE_RANGES[priceRange];
    if (pr && priceRange !== 0) {
      result = result.filter((t) => {
        const p = Number(t.TradePrice);
        return p >= pr.min && p < pr.max;
      });
    }

    const ar = BUILDING_AGE_RANGES[ageRange];
    if (ar && ageRange !== 0) {
      const currentYear = new Date().getFullYear();
      result = result.filter((t) => {
        if (!t.BuildingYear) return false;
        const match = t.BuildingYear.match(/(\d{4})/);
        if (!match) return false;
        const builtYear = Number(match[1]);
        const age = currentYear - builtYear;
        if (ar.minAge !== undefined) return age >= ar.minAge;
        return age <= ar.maxAge;
      });
    }

    return result;
  }, [transactions, typeFilter, floorPlanFilter, priceRange, ageRange]);

  const activeFilterCount =
    (typeFilter !== "all" ? 1 : 0) +
    (floorPlanFilter !== "all" ? 1 : 0) +
    (priceRange !== 0 ? 1 : 0) +
    (ageRange !== 0 ? 1 : 0);

  if (!area || !year || !quarter) {
    return (
      <div className="text-center py-20">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-blue-50 flex items-center justify-center">
          <svg className="w-10 h-10 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" strokeLinecap="round" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-slate-700 mb-2">
          条件を指定して検索してください
        </h2>
        <p className="text-slate-500">
          上のフォームから都道府県・期間を選んで「相場を検索」をクリック
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="text-center py-20">
        <div className="inline-block w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
        <p className="mt-4 text-slate-500">
          {prefName}のデータを取得中...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-50 flex items-center justify-center">
          <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <circle cx="12" cy="12" r="10" />
            <path d="M12 8v4M12 16h.01" strokeLinecap="round" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-red-600 mb-2">
          データの取得に失敗しました
        </h2>
        <p className="text-slate-500">{error}</p>
      </div>
    );
  }

  const freeTransactions = filtered.slice(0, FREE_LIMIT);
  const totalCount = transactions.length;
  const filteredCount = filtered.length;
  const isLimited = filteredCount > FREE_LIMIT;

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">
            {prefName}の不動産取引価格
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            {year}年 {QUARTER_LABELS[quarter] || quarter} の取引データ
            <span className="ml-2 text-blue-600 font-semibold">
              {totalCount.toLocaleString()}件
            </span>
            {activeFilterCount > 0 && (
              <span className="ml-2 text-amber-600">
                (フィルタ適用: {filteredCount.toLocaleString()}件)
              </span>
            )}
          </p>
        </div>
        {isLimited && (
          <div className="hidden md:block bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-xs text-amber-800">
            無料プラン: {FREE_LIMIT}件まで表示中
            <Link href="/pricing" className="ml-2 font-bold underline">
              全件表示 &rarr;
            </Link>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <button
          onClick={() => setFiltersOpen(!filtersOpen)}
          className="w-full flex items-center justify-between px-5 py-3 hover:bg-slate-50 transition"
        >
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
            </svg>
            <span className="text-sm font-semibold text-slate-700">
              フィルタ
            </span>
            {activeFilterCount > 0 && (
              <span className="bg-amber-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {activeFilterCount}
              </span>
            )}
          </div>
          <svg
            className={`w-4 h-4 text-slate-400 transition-transform ${filtersOpen ? "rotate-180" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {filtersOpen && (
          <div className="px-5 pb-5 border-t border-slate-100 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Type filter */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">
                  物件種別
                </label>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                >
                  <option value="all">全て ({totalCount})</option>
                  {types.map((type) => (
                    <option key={type} value={type}>
                      {type} ({transactions.filter((t) => t.Type === type).length})
                    </option>
                  ))}
                </select>
              </div>

              {/* Floor plan filter */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">
                  間取り
                </label>
                <select
                  value={floorPlanFilter}
                  onChange={(e) => setFloorPlanFilter(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                >
                  <option value="all">全て</option>
                  {floorPlans.map((fp) => (
                    <option key={fp} value={fp}>
                      {fp}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price range */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">
                  価格帯
                </label>
                <select
                  value={priceRange}
                  onChange={(e) => setPriceRange(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                >
                  {PRICE_RANGES.map((pr, i) => (
                    <option key={i} value={i}>
                      {pr.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Building age */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">
                  築年数
                </label>
                <select
                  value={ageRange}
                  onChange={(e) => setAgeRange(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                >
                  {BUILDING_AGE_RANGES.map((ar, i) => (
                    <option key={i} value={i}>
                      {ar.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {activeFilterCount > 0 && (
              <button
                onClick={() => {
                  setTypeFilter("all");
                  setFloorPlanFilter("all");
                  setPriceRange(0);
                  setAgeRange(0);
                }}
                className="mt-3 text-xs text-slate-500 hover:text-red-500 transition font-medium"
              >
                フィルタをクリア
              </button>
            )}
          </div>
        )}
      </div>

      {/* Stats - limited info free */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-5 border border-slate-100">
          <div className="text-xs text-slate-500 mb-1">取引件数</div>
          <div className="text-2xl font-extrabold text-slate-800">{filteredCount.toLocaleString()}<span className="text-sm font-normal text-slate-500 ml-1">件</span></div>
        </div>
        <PaywallOverlay feature="平均価格">
          <div className="bg-white rounded-xl shadow-sm p-5 border border-slate-100">
            <div className="text-xs text-slate-500 mb-1">平均取引価格</div>
            <div className="text-2xl font-extrabold text-slate-800">****<span className="text-sm font-normal text-slate-500 ml-1">万円</span></div>
          </div>
        </PaywallOverlay>
        <PaywallOverlay feature="中央値">
          <div className="bg-white rounded-xl shadow-sm p-5 border border-slate-100">
            <div className="text-xs text-slate-500 mb-1">中央値</div>
            <div className="text-2xl font-extrabold text-slate-800">****<span className="text-sm font-normal text-slate-500 ml-1">万円</span></div>
          </div>
        </PaywallOverlay>
        <PaywallOverlay feature="最高価格">
          <div className="bg-white rounded-xl shadow-sm p-5 border border-slate-100">
            <div className="text-xs text-slate-500 mb-1">最高価格</div>
            <div className="text-2xl font-extrabold text-slate-800">****<span className="text-sm font-normal text-slate-500 ml-1">万円</span></div>
          </div>
        </PaywallOverlay>
      </div>

      {/* Chart - Paywall */}
      <PaywallOverlay feature="種別ごとの平均取引価格">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-100">
          <h3 className="font-bold text-lg mb-4 text-slate-800">
            種別ごとの平均取引価格
          </h3>
          <div className="w-full h-80 bg-slate-100 rounded-lg" />
        </div>
      </PaywallOverlay>

      {/* Trend Chart - Paywall */}
      <PaywallOverlay feature="相場トレンド分析">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-100">
          <h3 className="font-bold text-lg mb-4 text-slate-800">
            価格推移トレンド
          </h3>
          <div className="w-full h-72 bg-slate-100 rounded-lg" />
        </div>
      </PaywallOverlay>

      {/* CSV Download - Paywall */}
      <PaywallOverlay feature="CSVダウンロード">
        <div className="bg-white rounded-xl shadow-sm p-4 border border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-800">データをダウンロード</h3>
            <p className="text-sm text-slate-500">
              {filteredCount.toLocaleString()}件の取引データをCSVでエクスポート
            </p>
          </div>
          <button className="bg-slate-800 text-white px-5 py-2.5 rounded-lg font-bold text-sm">
            CSV ダウンロード
          </button>
        </div>
      </PaywallOverlay>

      {/* Table - Limited */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-lg text-slate-800">
            取引事例一覧
          </h3>
          {isLimited && (
            <span className="text-xs text-slate-400">
              {FREE_LIMIT}件 / {filteredCount.toLocaleString()}件 を表示中
            </span>
          )}
        </div>
        <TransactionTable transactions={freeTransactions} />

        {/* Upsell */}
        {isLimited && (
          <div className="mt-6 bg-gradient-to-r from-slate-800 to-slate-700 rounded-xl p-6 text-white text-center">
            <p className="font-bold text-lg mb-2">
              残り {(filteredCount - FREE_LIMIT).toLocaleString()}件のデータがあります
            </p>
            <p className="text-slate-300 text-sm mb-4">
              スタンダードプランで全件表示・CSVダウンロード・トレンド分析が利用可能
            </p>
            <Link
              href="/pricing"
              className="inline-block bg-amber-500 hover:bg-amber-600 text-white font-bold py-2.5 px-8 rounded-lg transition"
            >
              プランを見る
            </Link>
          </div>
        )}
      </div>

      {/* SEO */}
      <div className="bg-slate-50 rounded-xl p-6 text-sm text-slate-600">
        <h3 className="font-bold mb-2">
          {prefName}の不動産相場について
        </h3>
        <p>
          {prefName}における{year}年{QUARTER_LABELS[quarter]}の不動産取引データを表示しています。
          このデータは国土交通省の不動産取引価格情報に基づいており、実際に行われた取引の価格を加工して作成しています。
          売却や購入の際の参考価格としてご活用ください。より正確な査定をご希望の方は、
          お気軽にお問い合わせください。
        </p>
      </div>
    </div>
  );
}
