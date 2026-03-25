"use client";

import { useState } from "react";
import SearchForm from "@/components/SearchForm";
import TrendChart from "@/components/TrendChart";
import { fetchWithAuth } from "@/lib/fetchWithAuth";
import SubscriptionPanel from "@/components/SubscriptionPanel";

const prefectures: Record<string, string> = {
  "01": "北海道", "02": "青森県", "03": "岩手県", "04": "宮城県", "05": "秋田県",
  "06": "山形県", "07": "福島県", "08": "茨城県", "09": "栃木県", "10": "群馬県",
  "11": "埼玉県", "12": "千葉県", "13": "東京都", "14": "神奈川県", "15": "新潟県",
  "16": "富山県", "17": "石川県", "18": "福井県", "19": "山梨県", "20": "長野県",
  "21": "岐阜県", "22": "静岡県", "23": "愛知県", "24": "三重県", "25": "滋賀県",
  "26": "京都府", "27": "大阪府", "28": "兵庫県", "29": "奈良県", "30": "和歌山県",
  "31": "鳥取県", "32": "島根県", "33": "岡山県", "34": "広島県", "35": "山口県",
  "36": "徳島県", "37": "香川県", "38": "愛媛県", "39": "高知県", "40": "福岡県",
  "41": "佐賀県", "42": "長崎県", "43": "熊本県", "44": "大分県", "45": "宮崎県",
  "46": "鹿児島県", "47": "沖縄県",
};

type Tab = "search" | "csv" | "trend" | "compare";

const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
  {
    id: "search",
    label: "詳細データ検索",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
      </svg>
    ),
  },
  {
    id: "csv",
    label: "CSVダウンロード",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
      </svg>
    ),
  },
  {
    id: "trend",
    label: "トレンド分析",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
      </svg>
    ),
  },
  {
    id: "compare",
    label: "エリア比較レポート",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 14.25v2.25m3-4.5v4.5m3-6.75v6.75m3-9v9M6 20.25h12A2.25 2.25 0 0020.25 18V6A2.25 2.25 0 0018 3.75H6A2.25 2.25 0 003.75 6v12A2.25 2.25 0 006 20.25z" />
      </svg>
    ),
  },
];

export default function DashboardContent() {
  const [activeTab, setActiveTab] = useState<Tab>("search");

  // CSV tab state
  const [csvArea, setCsvArea] = useState("");
  const [csvYear, setCsvYear] = useState("2024");
  const [csvLoading, setCsvLoading] = useState(false);

  // Trend tab state
  const [trendArea, setTrendArea] = useState("");
  const [trendType, setTrendType] = useState("all");
  const [trendLoading, setTrendLoading] = useState(false);
  const [trendData, setTrendData] = useState<{ TradePrice: string; Type: string; Period: string }[] | null>(null);

  // Compare tab state
  const [compareAreas, setCompareAreas] = useState<string[]>([]);
  const [compareToggle, setCompareToggle] = useState("");
  const [compareLoading, setCompareLoading] = useState(false);
  const [compareData, setCompareData] = useState<Record<string, { TradePrice: string; Type: string; Period: string }[]> | null>(null);

  const years = Array.from({ length: 20 }, (_, i) => String(2024 - i));

  async function handleCsvDownload() {
    if (!csvArea) return;
    setCsvLoading(true);
    try {
      const res = await fetchWithAuth(`/api/csv?area=${csvArea}&year=${csvYear}`);
      if (!res.ok) throw new Error("ダウンロード失敗");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `realestate_${prefectures[csvArea]}_${csvYear}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      alert("CSVのダウンロードに失敗しました。再度お試しください。");
    } finally {
      setCsvLoading(false);
    }
  }

  async function handleTrendSearch() {
    if (!trendArea) return;
    setTrendLoading(true);
    setTrendData(null);
    try {
      const res = await fetchWithAuth(`/api/trend?area=${trendArea}&type=${trendType}`);
      if (!res.ok) throw new Error("取得失敗");
      const data = await res.json();
      setTrendData(data);
    } catch {
      alert("トレンドデータの取得に失敗しました。再度お試しください。");
    } finally {
      setTrendLoading(false);
    }
  }

  function addCompareArea() {
    if (compareToggle && !compareAreas.includes(compareToggle) && compareAreas.length < 5) {
      setCompareAreas([...compareAreas, compareToggle]);
      setCompareToggle("");
    }
  }

  function removeCompareArea(code: string) {
    setCompareAreas(compareAreas.filter((a) => a !== code));
    if (compareData) {
      const next = { ...compareData };
      delete next[code];
      setCompareData(Object.keys(next).length > 0 ? next : null);
    }
  }

  async function handleCompareReport() {
    if (compareAreas.length < 2) return;
    setCompareLoading(true);
    setCompareData(null);
    try {
      const results = await Promise.all(
        compareAreas.map(async (area) => {
          const res = await fetchWithAuth(`/api/trend?area=${area}&type=all`);
          if (!res.ok) throw new Error("取得失敗");
          const data = await res.json();
          return { area, data };
        })
      );
      const map: Record<string, { TradePrice: string; Type: string; Period: string }[]> = {};
      results.forEach(({ area, data }) => { map[area] = data; });
      setCompareData(map);
    } catch {
      alert("比較データの取得に失敗しました。再度お試しください。");
    } finally {
      setCompareLoading(false);
    }
  }

  // Build combined chart data for compare
  function buildCompareChartData() {
    if (!compareData) return [];
    const periodSet = new Set<string>();
    const areaAverages: Record<string, Record<string, { total: number; count: number }>> = {};

    compareAreas.forEach((area) => {
      areaAverages[area] = {};
      (compareData[area] || []).forEach((t) => {
        const price = Number(t.TradePrice);
        if (!price || !t.Period) return;
        periodSet.add(t.Period);
        if (!areaAverages[area][t.Period]) areaAverages[area][t.Period] = { total: 0, count: 0 };
        areaAverages[area][t.Period].total += price;
        areaAverages[area][t.Period].count++;
      });
    });

    return Array.from(periodSet).sort().map((period) => {
      const row: Record<string, string | number> = { period };
      compareAreas.forEach((area) => {
        const d = areaAverages[area][period];
        row[prefectures[area]] = d ? Math.round(d.total / d.count) : 0;
      });
      return row;
    });
  }

  function formatPrice(v: number): string {
    if (v >= 100000000) return `${(v / 100000000).toFixed(1)}億`;
    if (v >= 10000) return `${Math.round(v / 10000)}万`;
    return String(v);
  }

  const CHART_COLORS = ["#2b6cb0", "#c05621", "#276749", "#6b46c1", "#b7791f"];

  return (
    <section className="py-8 md:py-12 bg-slate-50 min-h-[60vh]">
      <div className="max-w-6xl mx-auto px-4">
        {/* Tab Navigation */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-6 -mx-4 px-4 md:mx-0 md:px-0">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition ${
                activeTab === tab.id
                  ? "bg-slate-800 text-white shadow-md"
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 md:p-8">
          {/* 詳細データ検索 */}
          {activeTab === "search" && (
            <div>
              <h2 className="text-xl font-bold text-slate-800 mb-2">詳細データ検索</h2>
              <p className="text-sm text-slate-500 mb-6">
                全国の取引データを詳細条件で検索できます。築年数・駅距離・面積などの絞り込みが可能です。
              </p>
              <div className="bg-slate-50 rounded-xl p-5 mb-6">
                <p className="text-sm font-medium text-slate-700 mb-3">エリア・期間を選択して検索</p>
                <SearchForm />
              </div>
              <div className="grid sm:grid-cols-3 gap-4">
                <div className="bg-slate-50 rounded-xl p-4 text-center">
                  <p className="text-2xl font-extrabold text-slate-800">無制限</p>
                  <p className="text-xs text-slate-500 mt-1">取引事例表示数</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-4 text-center">
                  <p className="text-2xl font-extrabold text-slate-800">20年分</p>
                  <p className="text-xs text-slate-500 mt-1">データ蓄積期間</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-4 text-center">
                  <p className="text-2xl font-extrabold text-slate-800">47</p>
                  <p className="text-xs text-slate-500 mt-1">全都道府県対応</p>
                </div>
              </div>
            </div>
          )}

          {/* CSVダウンロード */}
          {activeTab === "csv" && (
            <div>
              <h2 className="text-xl font-bold text-slate-800 mb-2">CSVダウンロード</h2>
              <p className="text-sm text-slate-500 mb-6">
                取引データをCSV形式でダウンロードし、Excel等で自由に分析できます。
              </p>
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">都道府県</label>
                  <select
                    value={csvArea}
                    onChange={(e) => setCsvArea(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
                  >
                    <option value="">選択してください</option>
                    {Object.entries(prefectures).map(([code, name]) => (
                      <option key={code} value={code}>{name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">対象年度</label>
                  <select
                    value={csvYear}
                    onChange={(e) => setCsvYear(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
                  >
                    {years.map((y) => (
                      <option key={y} value={y}>{y}年</option>
                    ))}
                  </select>
                </div>
                <button
                  onClick={handleCsvDownload}
                  disabled={!csvArea || csvLoading}
                  className="w-full bg-amber-500 hover:bg-amber-600 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold py-3 rounded-xl transition flex items-center justify-center gap-2"
                >
                  {csvLoading ? (
                    <>
                      <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                      </svg>
                      データ取得中...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                      </svg>
                      CSVをダウンロード
                    </>
                  )}
                </button>
              </div>
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-700">
                選択した都道府県・年度の全4四半期データをまとめてダウンロードします。Excelで開く際は文字コードUTF-8（BOM付き）を選択してください。
              </div>
            </div>
          )}

          {/* トレンド分析 */}
          {activeTab === "trend" && (
            <div>
              <h2 className="text-xl font-bold text-slate-800 mb-2">トレンド分析</h2>
              <p className="text-sm text-slate-500 mb-6">
                エリアごとの価格推移をグラフで確認。売り時・買い時の判断に活用できます。
              </p>
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">分析対象エリア</label>
                  <select
                    value={trendArea}
                    onChange={(e) => setTrendArea(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
                  >
                    <option value="">選択してください</option>
                    {Object.entries(prefectures).map(([code, name]) => (
                      <option key={code} value={code}>{name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">物件種別</label>
                  <select
                    value={trendType}
                    onChange={(e) => setTrendType(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
                  >
                    <option value="all">全種別</option>
                    <option value="mansion">中古マンション等</option>
                    <option value="house">宅地（土地と建物）</option>
                    <option value="land">宅地（土地）</option>
                    <option value="forest">林地</option>
                  </select>
                </div>
                <button
                  onClick={handleTrendSearch}
                  disabled={!trendArea || trendLoading}
                  className="w-full bg-slate-800 hover:bg-slate-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold py-3 rounded-xl transition flex items-center justify-center gap-2"
                >
                  {trendLoading ? (
                    <>
                      <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                      </svg>
                      データ取得中（約10秒かかります）...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
                      </svg>
                      トレンドを表示
                    </>
                  )}
                </button>
              </div>

              {trendData && trendData.length > 0 ? (
                <TrendChart transactions={trendData} />
              ) : trendData && trendData.length === 0 ? (
                <div className="bg-slate-50 rounded-xl p-8 text-center text-sm text-slate-400">
                  データが見つかりませんでした
                </div>
              ) : (
                <div className="bg-slate-50 rounded-xl p-8 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-slate-200 flex items-center justify-center">
                    <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
                    </svg>
                  </div>
                  <p className="text-sm text-slate-500">エリアを選択するとトレンドグラフが表示されます</p>
                </div>
              )}
            </div>
          )}

          {/* エリア比較レポート */}
          {activeTab === "compare" && (
            <div>
              <h2 className="text-xl font-bold text-slate-800 mb-2">エリア比較レポート</h2>
              <p className="text-sm text-slate-500 mb-6">
                複数エリアの相場・トレンドを比較するレポートを生成します。
              </p>
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    比較エリアを追加（最大5つ）
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={compareToggle}
                      onChange={(e) => setCompareToggle(e.target.value)}
                      className="flex-1 border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
                    >
                      <option value="">都道府県を選択</option>
                      {Object.entries(prefectures).map(([code, name]) => (
                        <option key={code} value={code} disabled={compareAreas.includes(code)}>
                          {name}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={addCompareArea}
                      disabled={!compareToggle || compareAreas.length >= 5}
                      className="bg-slate-800 hover:bg-slate-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold px-5 py-2.5 rounded-lg transition text-sm"
                    >
                      追加
                    </button>
                  </div>
                </div>

                {compareAreas.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {compareAreas.map((code, i) => (
                      <span
                        key={code}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-white"
                        style={{ backgroundColor: CHART_COLORS[i] }}
                      >
                        {prefectures[code]}
                        <button
                          onClick={() => removeCompareArea(code)}
                          className="opacity-70 hover:opacity-100 transition"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                <button
                  onClick={handleCompareReport}
                  disabled={compareAreas.length < 2 || compareLoading}
                  className="w-full bg-slate-800 hover:bg-slate-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold py-3 rounded-xl transition flex items-center justify-center gap-2 text-sm"
                >
                  {compareLoading ? (
                    <>
                      <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                      </svg>
                      データ取得中...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 14.25v2.25m3-4.5v4.5m3-6.75v6.75m3-9v9M6 20.25h12A2.25 2.25 0 0020.25 18V6A2.25 2.25 0 0018 3.75H6A2.25 2.25 0 003.75 6v12A2.25 2.25 0 006 20.25z" />
                      </svg>
                      比較レポートを生成
                    </>
                  )}
                </button>
              </div>

              {compareData ? (
                <div className="space-y-6">
                  {/* 平均価格サマリーカード */}
                  <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {compareAreas.map((code, i) => {
                      const rows = compareData[code] || [];
                      const prices = rows.map((r) => Number(r.TradePrice)).filter((p) => p > 0);
                      const avg = prices.length > 0 ? Math.round(prices.reduce((a, b) => a + b, 0) / prices.length) : 0;
                      return (
                        <div key={code} className="bg-slate-50 rounded-xl p-4 border-l-4" style={{ borderColor: CHART_COLORS[i] }}>
                          <p className="text-xs text-slate-500 mb-1">{prefectures[code]}</p>
                          <p className="text-xl font-extrabold text-slate-800">{formatPrice(avg)}円</p>
                          <p className="text-xs text-slate-400 mt-1">直近5年間平均取引価格</p>
                          <p className="text-xs text-slate-400">{prices.length.toLocaleString()}件のデータ</p>
                        </div>
                      );
                    })}
                  </div>

                  {/* 比較チャート */}
                  {(() => {
                    const chartData = buildCompareChartData();
                    if (chartData.length < 2) return null;
                    // Dynamic import workaround — render inline recharts
                    return (
                      <div>
                        <p className="text-sm font-bold text-slate-700 mb-3">四半期別 平均取引価格推移</p>
                        <div className="overflow-x-auto">
                          <table className="w-full text-xs border-collapse">
                            <thead>
                              <tr className="bg-slate-100">
                                <th className="text-left px-3 py-2 rounded-tl-lg font-medium text-slate-600">時期</th>
                                {compareAreas.map((code, i) => (
                                  <th key={code} className="text-right px-3 py-2 font-medium" style={{ color: CHART_COLORS[i] }}>
                                    {prefectures[code]}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {chartData.slice(-20).map((row, idx) => (
                                <tr key={String(row.period)} className={idx % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                                  <td className="px-3 py-1.5 text-slate-600">{row.period}</td>
                                  {compareAreas.map((code) => (
                                    <td key={code} className="px-3 py-1.5 text-right text-slate-800 font-medium">
                                      {row[prefectures[code]] ? formatPrice(Number(row[prefectures[code]])) + "円" : "-"}
                                    </td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              ) : (
                <div className="bg-slate-50 rounded-xl p-8 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-slate-200 flex items-center justify-center">
                    <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 14.25v2.25m3-4.5v4.5m3-6.75v6.75m3-9v9M6 20.25h12A2.25 2.25 0 0020.25 18V6A2.25 2.25 0 0018 3.75H6A2.25 2.25 0 003.75 6v12A2.25 2.25 0 006 20.25z" />
                    </svg>
                  </div>
                  <p className="text-sm text-slate-500">2つ以上のエリアを選択してレポートを生成してください</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Subscription Panel */}
        <SubscriptionPanel />
      </div>
    </section>
  );
}
