"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import StatsCards from "@/components/StatsCards";
import PriceChart from "@/components/PriceChart";
import TrendChart from "@/components/TrendChart";
import TransactionTable from "@/components/TransactionTable";
import PaywallOverlay from "@/components/PaywallOverlay";
import { PREFECTURES } from "@/lib/prefectures";

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
}

const QUARTER_LABELS: Record<string, string> = {
  "1": "第1四半期 (1-3月)",
  "2": "第2四半期 (4-6月)",
  "3": "第3四半期 (7-9月)",
  "4": "第4四半期 (10-12月)",
};

const FREE_LIMIT = 20;

export default function SearchResults() {
  const params = useSearchParams();
  const area = params.get("area");
  const city = params.get("city");
  const year = params.get("year");
  const quarter = params.get("quarter");

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const prefName =
    PREFECTURES.find((p) => p.code === area)?.name || area || "";

  useEffect(() => {
    if (!area || !year || !quarter) return;

    setLoading(true);
    setError("");

    const query = new URLSearchParams({ year, quarter });
    if (city) query.set("city", city);
    else if (area) query.set("area", area);

    fetch(`/api/transactions?${query.toString()}`)
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

  if (!area || !year || !quarter) {
    return (
      <div className="text-center py-20">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-blue-50 flex items-center justify-center">
          <svg className="w-10 h-10 text-[#2b6cb0]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" strokeLinecap="round" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-gray-700 mb-2">
          条件を指定して検索してください
        </h2>
        <p className="text-gray-500">
          上のフォームから都道府県・期間を選んで「相場を検索」をクリック
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="text-center py-20">
        <div className="inline-block w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
        <p className="mt-4 text-gray-500">
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
        <p className="text-gray-500">{error}</p>
      </div>
    );
  }

  const freeTransactions = transactions.slice(0, FREE_LIMIT);
  const totalCount = transactions.length;
  const isLimited = totalCount > FREE_LIMIT;

  return (
    <div className="space-y-8">
      {/* Title */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#1a365d]">
            {prefName}の不動産取引価格
          </h2>
          <p className="text-gray-500 text-sm mt-1">
            {year}年 {QUARTER_LABELS[quarter] || quarter} の取引データ
            <span className="ml-2 text-[#2b6cb0] font-medium">
              {totalCount.toLocaleString()}件
            </span>
          </p>
        </div>
        {isLimited && (
          <div className="hidden md:block bg-orange-50 border border-orange-200 rounded-lg px-3 py-2 text-xs text-orange-800">
            無料プラン: {FREE_LIMIT}件まで表示中
            <a href="/#pricing" className="ml-2 font-bold underline">
              全件表示 &rarr;
            </a>
          </div>
        )}
      </div>

      {/* Stats */}
      <StatsCards transactions={transactions} />

      {/* Chart - Free */}
      <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
        <h3 className="font-bold text-lg mb-4 text-[#1a365d]">
          種別ごとの平均取引価格
        </h3>
        <PriceChart transactions={transactions} />
      </div>

      {/* Trend Chart - Paywall */}
      <PaywallOverlay feature="相場トレンド分析">
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
          <h3 className="font-bold text-lg mb-4 text-[#1a365d]">
            価格推移トレンド
          </h3>
          <TrendChart transactions={transactions} />
        </div>
      </PaywallOverlay>

      {/* CSV Download - Paywall */}
      <PaywallOverlay feature="CSVダウンロード">
        <div className="bg-white rounded-xl shadow-md p-4 border border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-[#1a365d]">データをダウンロード</h3>
            <p className="text-sm text-gray-500">
              {totalCount.toLocaleString()}件の取引データをCSVでエクスポート
            </p>
          </div>
          <button className="bg-[#1a365d] text-white px-5 py-2.5 rounded-lg font-bold text-sm">
            CSV ダウンロード
          </button>
        </div>
      </PaywallOverlay>

      {/* Table - Limited */}
      <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-lg text-[#1a365d]">
            取引事例一覧
          </h3>
          {isLimited && (
            <span className="text-xs text-gray-400">
              {FREE_LIMIT}件 / {totalCount.toLocaleString()}件 を表示中
            </span>
          )}
        </div>
        <TransactionTable transactions={freeTransactions} />

        {/* Upsell */}
        {isLimited && (
          <div className="mt-6 bg-gradient-to-r from-[#1a365d] to-[#2b6cb0] rounded-xl p-6 text-white text-center">
            <p className="font-bold text-lg mb-2">
              残り {(totalCount - FREE_LIMIT).toLocaleString()}件のデータがあります
            </p>
            <p className="text-blue-200 text-sm mb-4">
              スタンダードプランで全件表示・CSVダウンロード・トレンド分析が利用可能
            </p>
            <a
              href="/#pricing"
              className="inline-block bg-[#ed8936] hover:bg-orange-500 text-white font-bold py-2.5 px-8 rounded-lg transition"
            >
              プランを見る
            </a>
          </div>
        )}
      </div>

      {/* SEO */}
      <div className="bg-gray-50 rounded-xl p-6 text-sm text-gray-600">
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
