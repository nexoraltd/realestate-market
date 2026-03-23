"use client";

import { useState } from "react";
import Link from "next/link";
import { PREFECTURE_GEO, getPriceColor } from "@/lib/prefecture-geo";

const FLOOR_PLAN_TABS = [
  { key: "all", label: "全て" },
  { key: "1K", label: "1K/1DK" },
  { key: "2LDK", label: "2LDK" },
  { key: "3LDK", label: "3LDK" },
  { key: "4LDK", label: "4LDK+" },
];

interface AreaData {
  code: string;
  trend: string;
  // Sample data per floor plan category
  floorPlanData: Record<
    string,
    { avgPrice: number; avgAge: number; avgStation: string; avgWalk: number; count: number }
  >;
}

const POPULAR: AreaData[] = [
  {
    code: "13",
    trend: "+2.3%",
    floorPlanData: {
      all: { avgPrice: 7690, avgAge: 18, avgStation: "新宿", avgWalk: 8, count: 12450 },
      "1K": { avgPrice: 2850, avgAge: 12, avgStation: "渋谷", avgWalk: 6, count: 3200 },
      "2LDK": { avgPrice: 5980, avgAge: 15, avgStation: "品川", avgWalk: 7, count: 2800 },
      "3LDK": { avgPrice: 8450, avgAge: 20, avgStation: "池袋", avgWalk: 9, count: 3600 },
      "4LDK": { avgPrice: 12800, avgAge: 22, avgStation: "世田谷", avgWalk: 12, count: 2850 },
    },
  },
  {
    code: "27",
    trend: "+1.8%",
    floorPlanData: {
      all: { avgPrice: 3245, avgAge: 20, avgStation: "梅田", avgWalk: 9, count: 8920 },
      "1K": { avgPrice: 1580, avgAge: 14, avgStation: "難波", avgWalk: 5, count: 2100 },
      "2LDK": { avgPrice: 2890, avgAge: 18, avgStation: "天王寺", avgWalk: 8, count: 2300 },
      "3LDK": { avgPrice: 3780, avgAge: 22, avgStation: "心斎橋", avgWalk: 10, count: 2800 },
      "4LDK": { avgPrice: 5200, avgAge: 25, avgStation: "堺", avgWalk: 14, count: 1720 },
    },
  },
  {
    code: "14",
    trend: "+1.5%",
    floorPlanData: {
      all: { avgPrice: 4830, avgAge: 19, avgStation: "横浜", avgWalk: 10, count: 7650 },
      "1K": { avgPrice: 2100, avgAge: 13, avgStation: "川崎", avgWalk: 6, count: 1850 },
      "2LDK": { avgPrice: 3950, avgAge: 17, avgStation: "横浜", avgWalk: 8, count: 2100 },
      "3LDK": { avgPrice: 5680, avgAge: 21, avgStation: "藤沢", avgWalk: 11, count: 2200 },
      "4LDK": { avgPrice: 7450, avgAge: 24, avgStation: "鎌倉", avgWalk: 15, count: 1500 },
    },
  },
  {
    code: "23",
    trend: "+0.9%",
    floorPlanData: {
      all: { avgPrice: 3120, avgAge: 21, avgStation: "名古屋", avgWalk: 11, count: 6890 },
      "1K": { avgPrice: 1350, avgAge: 15, avgStation: "栄", avgWalk: 5, count: 1600 },
      "2LDK": { avgPrice: 2680, avgAge: 19, avgStation: "金山", avgWalk: 9, count: 1800 },
      "3LDK": { avgPrice: 3580, avgAge: 23, avgStation: "千種", avgWalk: 12, count: 2100 },
      "4LDK": { avgPrice: 4950, avgAge: 26, avgStation: "覚王山", avgWalk: 14, count: 1390 },
    },
  },
  {
    code: "40",
    trend: "+2.1%",
    floorPlanData: {
      all: { avgPrice: 2890, avgAge: 19, avgStation: "博多", avgWalk: 9, count: 5420 },
      "1K": { avgPrice: 1280, avgAge: 12, avgStation: "天神", avgWalk: 5, count: 1350 },
      "2LDK": { avgPrice: 2450, avgAge: 17, avgStation: "博多", avgWalk: 8, count: 1480 },
      "3LDK": { avgPrice: 3380, avgAge: 21, avgStation: "西新", avgWalk: 10, count: 1590 },
      "4LDK": { avgPrice: 4680, avgAge: 24, avgStation: "大濠", avgWalk: 13, count: 1000 },
    },
  },
  {
    code: "26",
    trend: "+1.2%",
    floorPlanData: {
      all: { avgPrice: 3560, avgAge: 25, avgStation: "四条", avgWalk: 10, count: 3890 },
      "1K": { avgPrice: 1750, avgAge: 18, avgStation: "河原町", avgWalk: 6, count: 980 },
      "2LDK": { avgPrice: 3120, avgAge: 22, avgStation: "烏丸", avgWalk: 8, count: 1050 },
      "3LDK": { avgPrice: 4280, avgAge: 27, avgStation: "北山", avgWalk: 11, count: 1100 },
      "4LDK": { avgPrice: 5800, avgAge: 30, avgStation: "嵯峨", avgWalk: 15, count: 760 },
    },
  },
  {
    code: "11",
    trend: "+1.4%",
    floorPlanData: {
      all: { avgPrice: 3050, avgAge: 20, avgStation: "大宮", avgWalk: 12, count: 5280 },
      "1K": { avgPrice: 1380, avgAge: 14, avgStation: "浦和", avgWalk: 7, count: 1200 },
      "2LDK": { avgPrice: 2650, avgAge: 18, avgStation: "大宮", avgWalk: 10, count: 1400 },
      "3LDK": { avgPrice: 3580, avgAge: 22, avgStation: "川越", avgWalk: 13, count: 1580 },
      "4LDK": { avgPrice: 4800, avgAge: 25, avgStation: "所沢", avgWalk: 16, count: 1100 },
    },
  },
  {
    code: "04",
    trend: "+1.7%",
    floorPlanData: {
      all: { avgPrice: 1850, avgAge: 18, avgStation: "仙台", avgWalk: 10, count: 3120 },
      "1K": { avgPrice: 980, avgAge: 12, avgStation: "仙台", avgWalk: 5, count: 780 },
      "2LDK": { avgPrice: 1620, avgAge: 16, avgStation: "長町", avgWalk: 8, count: 850 },
      "3LDK": { avgPrice: 2180, avgAge: 20, avgStation: "泉中央", avgWalk: 11, count: 920 },
      "4LDK": { avgPrice: 3050, avgAge: 23, avgStation: "八木山", avgWalk: 15, count: 570 },
    },
  },
];

export default function PopularAreas() {
  const [activeTab, setActiveTab] = useState("all");
  const currentYear = new Date().getFullYear() - 1;

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-6">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-800 mb-2">
            人気エリアの相場
          </h2>
          <p className="text-slate-500 text-sm">
            よく検索されているエリアの最新取引価格
          </p>
        </div>

        {/* Floor plan filter tabs */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex bg-slate-100 rounded-xl p-1 gap-1">
            {FLOOR_PLAN_TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  activeTab === tab.key
                    ? "bg-white text-slate-800 shadow-sm"
                    : "text-slate-500 hover:text-slate-700 hover:bg-white/50"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {POPULAR.map(({ code, trend, floorPlanData }) => {
            const pref = PREFECTURE_GEO.find((p) => p.code === code);
            if (!pref) return null;

            const data = floorPlanData[activeTab] || floorPlanData["all"];
            const color = getPriceColor(data.avgPrice);

            return (
              <Link
                key={code}
                href={`/search?area=${code}&year=${currentYear}&quarter=1`}
                className="card-hover group bg-white rounded-xl border border-slate-100 hover:border-slate-300 overflow-hidden"
              >
                {/* Header */}
                <div className="px-5 pt-4 pb-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-xs shadow-sm"
                      style={{ backgroundColor: color }}
                    >
                      {pref.name.replace(/[都道府県]$/, "").slice(0, 2)}
                    </div>
                    <div>
                      <div className="font-bold text-slate-800 group-hover:text-blue-600 transition">
                        {pref.name}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {pref.region}地方 · {data.count.toLocaleString()}件
                      </div>
                    </div>
                  </div>
                  <div className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">
                    {trend}
                  </div>
                </div>

                {/* Price */}
                <div className="px-5 pb-3">
                  <div className="text-xs text-slate-400 mb-0.5">
                    {activeTab === "all" ? "平均取引価格" : `${FLOOR_PLAN_TABS.find(t => t.key === activeTab)?.label} 平均`}
                  </div>
                  <div className="text-xl font-extrabold text-slate-800">
                    {data.avgPrice.toLocaleString()}
                    <span className="text-sm font-normal text-slate-500 ml-0.5">万円</span>
                  </div>
                </div>

                {/* Detail chips */}
                <div className="px-5 pb-4">
                  <div className="flex flex-wrap gap-1.5">
                    <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 text-[10px] font-medium px-2 py-1 rounded-md">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      築{data.avgAge}年
                    </span>
                    <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 text-[10px] font-medium px-2 py-1 rounded-md">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                      </svg>
                      {data.avgStation}駅
                    </span>
                    <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 text-[10px] font-medium px-2 py-1 rounded-md">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                      徒歩{data.avgWalk}分
                    </span>
                  </div>
                </div>

                {/* Bottom bar */}
                <div className="bg-slate-50 px-5 py-2.5 text-[11px] text-slate-400 group-hover:text-blue-500 transition flex items-center justify-between">
                  <span>詳細データを見る</span>
                  <svg className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="text-center mt-8">
          <Link
            href="/search"
            className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700 transition"
          >
            全都道府県の相場を見る
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
