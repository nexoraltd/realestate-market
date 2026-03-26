"use client";

import { useState } from "react";
import Link from "next/link";

const SAMPLE_DATA = [
  {
    type: "中古マンション",
    location: "東京都 港区 赤坂",
    price: "8,500万円",
    floorPlan: "3LDK",
    area: "75.2m²",
    totalFloor: "85.3m²",
    buildYear: "2015年",
    age: "築11年",
    station: "赤坂駅",
    walk: "3分",
    structure: "RC造",
    floor: "12階/15階建",
    direction: "南",
    cityPlanning: "商業地域",
    coverage: "80%",
    far: "600%",
    period: "2025年 第1四半期",
    unitPrice: "113.0万円/m²",
  },
  {
    type: "中古マンション",
    location: "大阪府 中央区 心斎橋",
    price: "4,200万円",
    floorPlan: "2LDK",
    area: "62.8m²",
    totalFloor: "68.1m²",
    buildYear: "2018年",
    age: "築8年",
    station: "心斎橋駅",
    walk: "5分",
    structure: "SRC造",
    floor: "8階/20階建",
    direction: "南西",
    cityPlanning: "商業地域",
    coverage: "80%",
    far: "800%",
    period: "2025年 第1四半期",
    unitPrice: "66.9万円/m²",
  },
  {
    type: "戸建て",
    location: "神奈川県 横浜市 青葉区",
    price: "6,780万円",
    floorPlan: "4LDK",
    area: "125.0m²",
    totalFloor: "110.5m²",
    buildYear: "2020年",
    age: "築6年",
    station: "たまプラーザ駅",
    walk: "8分",
    structure: "木造",
    floor: "2階建",
    direction: "東南",
    cityPlanning: "第一種低層住居専用",
    coverage: "50%",
    far: "100%",
    period: "2025年 第1四半期",
    unitPrice: "54.2万円/m²",
  },
  {
    type: "土地",
    location: "愛知県 名古屋市 千種区",
    price: "3,850万円",
    floorPlan: "-",
    area: "165.3m²",
    totalFloor: "-",
    buildYear: "-",
    age: "-",
    station: "覚王山駅",
    walk: "6分",
    structure: "-",
    floor: "-",
    direction: "南",
    cityPlanning: "第一種住居地域",
    coverage: "60%",
    far: "200%",
    period: "2025年 第1四半期",
    unitPrice: "23.3万円/m²",
  },
  {
    type: "中古マンション",
    location: "福岡県 福岡市 中央区",
    price: "3,980万円",
    floorPlan: "3LDK",
    area: "70.5m²",
    totalFloor: "78.2m²",
    buildYear: "2017年",
    age: "築9年",
    station: "天神駅",
    walk: "7分",
    structure: "RC造",
    floor: "6階/14階建",
    direction: "南",
    cityPlanning: "商業地域",
    coverage: "80%",
    far: "600%",
    period: "2025年 第1四半期",
    unitPrice: "56.5万円/m²",
  },
];

const BLUR_ROWS = [1, 2, 3, 4]; // 0-indexed: 1行だけ見せて残りはブラー

export default function DetailedDataPreview() {
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);

  return (
    <section className="py-16 md:py-20 bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-full px-4 py-1.5 mb-4">
            <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
            </svg>
            <span className="text-blue-600 text-xs font-semibold">データプレビュー</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-slate-800 mb-3">
            こんなデータが見られます
          </h2>
          <p className="text-slate-500 text-sm max-w-2xl mx-auto">
            間取り・築年数・最寄駅・徒歩分数まで
            <br className="hidden md:block" />
            物件探しに必要な情報を一覧で確認できます
          </p>
        </div>

        {/* Data field badges */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {[
            { icon: "🏠", label: "物件種別", color: "bg-blue-50 text-blue-700 border-blue-100" },
            { icon: "📍", label: "所在地", color: "bg-emerald-50 text-emerald-700 border-emerald-100" },
            { icon: "💰", label: "取引価格", color: "bg-amber-50 text-amber-700 border-amber-100" },
            { icon: "🏗", label: "間取り", color: "bg-purple-50 text-purple-700 border-purple-100" },
            { icon: "📐", label: "面積", color: "bg-pink-50 text-pink-700 border-pink-100" },
            { icon: "📅", label: "築年数", color: "bg-orange-50 text-orange-700 border-orange-100" },
            { icon: "🚉", label: "最寄駅", color: "bg-cyan-50 text-cyan-700 border-cyan-100" },
            { icon: "🚶", label: "徒歩分数", color: "bg-teal-50 text-teal-700 border-teal-100" },
            { icon: "🏢", label: "構造", color: "bg-indigo-50 text-indigo-700 border-indigo-100" },
            { icon: "🗺", label: "用途地域", color: "bg-rose-50 text-rose-700 border-rose-100" },
            { icon: "📊", label: "坪単価", color: "bg-violet-50 text-violet-700 border-violet-100" },
            { icon: "🔄", label: "建ぺい率/容積率", color: "bg-lime-50 text-lime-700 border-lime-100" },
          ].map(({ icon, label, color }) => (
            <span
              key={label}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border ${color}`}
            >
              <span>{icon}</span>
              {label}
            </span>
          ))}
        </div>

        {/* Sample table */}
        <div className="relative bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
          {/* Table header bar */}
          <div className="bg-slate-800 text-white px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <span className="font-bold text-sm">取引データ サンプル</span>
            </div>
            <span className="text-xs text-slate-400">全国 500万件+ の取引データ</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  {[
                    "種別",
                    "所在地",
                    "取引価格",
                    "間取り",
                    "面積",
                    "築年数",
                    "最寄駅",
                    "徒歩",
                    "構造",
                    "坪単価",
                    "用途地域",
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-3 py-3 text-left font-bold text-slate-600 whitespace-nowrap text-xs uppercase tracking-wider"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {SAMPLE_DATA.map((row, i) => {
                  const isBlurred = BLUR_ROWS.includes(i);

                  return (
                    <tr
                      key={i}
                      className={`border-t border-slate-100 transition ${
                        isBlurred ? "relative" : "hover:bg-blue-50/50"
                      }`}
                      onMouseEnter={() => setHoveredRow(i)}
                      onMouseLeave={() => setHoveredRow(null)}
                    >
                      <td className="px-3 py-3 whitespace-nowrap">
                        <span
                          className={`inline-block text-xs px-2.5 py-1 rounded-md font-medium ${
                            row.type === "中古マンション"
                              ? "bg-blue-100 text-blue-800"
                              : row.type === "戸建て"
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {row.type}
                        </span>
                      </td>
                      <td className={`px-3 py-3 whitespace-nowrap font-medium text-slate-700 ${isBlurred ? "blur-sm select-none" : ""}`}>
                        {row.location}
                      </td>
                      <td className={`px-3 py-3 whitespace-nowrap font-bold text-slate-800 ${isBlurred ? "blur-sm select-none" : ""}`}>
                        {row.price}
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap">
                        <span className="bg-purple-50 text-purple-700 text-xs font-semibold px-2 py-0.5 rounded">
                          {row.floorPlan}
                        </span>
                      </td>
                      <td className={`px-3 py-3 whitespace-nowrap ${isBlurred ? "blur-sm select-none" : ""}`}>
                        {row.area}
                      </td>
                      <td className={`px-3 py-3 whitespace-nowrap ${isBlurred ? "blur-sm select-none" : ""}`}>
                        <span className="text-orange-600 font-medium">{row.age}</span>
                      </td>
                      <td className={`px-3 py-3 whitespace-nowrap ${isBlurred ? "blur-sm select-none" : ""}`}>
                        <span className="inline-flex items-center gap-1">
                          <svg className="w-3 h-3 text-cyan-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                          </svg>
                          {row.station}
                        </span>
                      </td>
                      <td className={`px-3 py-3 whitespace-nowrap ${isBlurred ? "blur-sm select-none" : ""}`}>
                        <span className="text-teal-600 font-semibold">{row.walk}</span>
                      </td>
                      <td className={`px-3 py-3 whitespace-nowrap text-xs ${isBlurred ? "blur-sm select-none" : ""}`}>
                        {row.structure}
                      </td>
                      <td className={`px-3 py-3 whitespace-nowrap text-xs font-medium ${isBlurred ? "blur-sm select-none" : ""}`}>
                        {row.unitPrice}
                      </td>
                      <td className={`px-3 py-3 whitespace-nowrap text-xs ${isBlurred ? "blur-sm select-none" : ""}`}>
                        {row.cityPlanning}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Paywall overlay on blurred rows */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-white via-white/95 to-transparent h-32 pointer-events-none" />
          <div className="absolute bottom-4 left-0 right-0 flex justify-center pointer-events-auto">
            <div className="bg-white shadow-xl rounded-2xl border border-slate-200 px-6 py-4 text-center max-w-md">
              <div className="flex items-center justify-center gap-2 mb-2">
                <svg className="w-5 h-5 text-amber-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span className="font-bold text-slate-800 text-sm">
                  全データにアクセスするには
                </span>
              </div>
              <p className="text-xs text-slate-500 mb-3">
                500万件超の取引データ・CSV出力・トレンド分析を利用可能
              </p>
              <Link
                href="/pricing"
                className="inline-block bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm py-2.5 px-6 rounded-xl transition shadow-md hover:shadow-lg"
              >
                プランを見る →
              </Link>
            </div>
          </div>
        </div>

        {/* Detailed card examples */}
        <div className="mt-12 grid md:grid-cols-3 gap-6">
          {/* Card 1: What buyers get */}
          <div className="bg-white rounded-xl border border-slate-100 p-6 shadow-sm hover:shadow-md transition">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center mb-4">
              <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="font-bold text-slate-800 mb-2">購入検討者</h3>
            <p className="text-sm text-slate-500 mb-4">
              希望エリアの過去取引をもとに、相場を把握して適正価格を見極めましょう。
            </p>
            <ul className="space-y-2 text-sm">
              {["間取り別の相場比較", "最寄駅・徒歩分数でフィルタ", "築年数と価格の相関", "エリア内の価格推移トレンド"].map((item) => (
                <li key={item} className="flex items-center gap-2 text-slate-600">
                  <svg className="w-4 h-4 text-blue-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Card 2: What sellers get */}
          <div className="bg-white rounded-xl border border-slate-100 p-6 shadow-sm hover:shadow-md transition">
            <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center mb-4">
              <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="font-bold text-slate-800 mb-2">売却検討者</h3>
            <p className="text-sm text-slate-500 mb-4">
              周辺の成約事例を確認して、納得感のある売出価格を設定しましょう。
            </p>
            <ul className="space-y-2 text-sm">
              {["同じ間取りの成約価格一覧", "築年数別の価格下落率", "駅距離による価格差", "最新四半期の取引実績"].map((item) => (
                <li key={item} className="flex items-center gap-2 text-slate-600">
                  <svg className="w-4 h-4 text-emerald-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Card 3: What pros get */}
          <div className="bg-white rounded-xl border border-slate-100 p-6 shadow-sm hover:shadow-md transition">
            <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center mb-4">
              <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="font-bold text-slate-800 mb-2">不動産業者・投資家</h3>
            <p className="text-sm text-slate-500 mb-4">
              大量のデータをCSVで取得し、独自の分析やレポートに活用できます。
            </p>
            <ul className="space-y-2 text-sm">
              {["20年分の取引データ一括取得", "CSVエクスポート無制限", "エリア×間取りクロス分析", "カスタムレポート生成"].map((item) => (
                <li key={item} className="flex items-center gap-2 text-slate-600">
                  <svg className="w-4 h-4 text-amber-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
