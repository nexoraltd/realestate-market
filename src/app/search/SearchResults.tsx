"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import StatsCards from "@/components/StatsCards";
import PriceChart from "@/components/PriceChart";
import TransactionTable from "@/components/TransactionTable";
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
        <div className="text-6xl mb-4">🔍</div>
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
        <div className="inline-block w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
        <p className="mt-4 text-gray-500">
          {prefName}のデータを取得中...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <div className="text-4xl mb-4">⚠️</div>
        <h2 className="text-xl font-bold text-red-600 mb-2">
          データの取得に失敗しました
        </h2>
        <p className="text-gray-500">
          {error}
          <br />
          APIキーが未設定の場合はデモデータが表示されません。
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Title */}
      <div>
        <h2 className="text-2xl font-bold text-[#1a365d]">
          {prefName}の不動産取引価格
        </h2>
        <p className="text-gray-500 text-sm mt-1">
          {year}年 {QUARTER_LABELS[quarter] || quarter} の取引データ
        </p>
      </div>

      {/* Stats */}
      <StatsCards transactions={transactions} />

      {/* Chart */}
      <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
        <h3 className="font-bold text-lg mb-4 text-[#1a365d]">
          種別ごとの平均取引価格
        </h3>
        <PriceChart transactions={transactions} />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
        <h3 className="font-bold text-lg mb-4 text-[#1a365d]">
          取引事例一覧
        </h3>
        <TransactionTable transactions={transactions} />
      </div>

      {/* SEO */}
      <div className="bg-gray-50 rounded-xl p-6 text-sm text-gray-600">
        <h3 className="font-bold mb-2">
          {prefName}の不動産相場について
        </h3>
        <p>
          {prefName}における{year}年{QUARTER_LABELS[quarter]}の不動産取引データを表示しています。
          このデータは国土交通省の不動産取引価格情報に基づいており、実際に行われた取引の価格です。
          売却や購入の際の参考価格としてご活用ください。より正確な査定をご希望の方は、
          お気軽にお問い合わせください。
        </p>
      </div>
    </div>
  );
}
