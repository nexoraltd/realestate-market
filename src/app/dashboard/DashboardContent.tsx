"use client";

import { useState } from "react";
import SearchForm from "@/components/SearchForm";

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
  const [csvArea, setCsvArea] = useState("");
  const [csvYear, setCsvYear] = useState("2024");
  const [csvFormat, setCsvFormat] = useState("full");
  const [trendArea, setTrendArea] = useState("");
  const [trendType, setTrendType] = useState("all");
  const [compareAreas, setCompareAreas] = useState<string[]>([]);
  const [compareToggle, setCompareToggle] = useState("");

  const years = Array.from({ length: 20 }, (_, i) => String(2024 - i));

  function addCompareArea() {
    if (compareToggle && !compareAreas.includes(compareToggle) && compareAreas.length < 5) {
      setCompareAreas([...compareAreas, compareToggle]);
      setCompareToggle("");
    }
  }

  function removeCompareArea(code: string) {
    setCompareAreas(compareAreas.filter((a) => a !== code));
  }

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

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">開始年</label>
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
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">出力形式</label>
                    <select
                      value={csvFormat}
                      onChange={(e) => setCsvFormat(e.target.value)}
                      className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
                    >
                      <option value="full">全項目出力</option>
                      <option value="summary">サマリーのみ</option>
                      <option value="price">価格データのみ</option>
                    </select>
                  </div>
                </div>

                <button
                  disabled={!csvArea}
                  className="w-full bg-amber-500 hover:bg-amber-600 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold py-3 rounded-xl transition flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                  </svg>
                  CSVをダウンロード
                </button>
              </div>

              <div className="bg-slate-50 rounded-xl p-4">
                <h3 className="text-sm font-bold text-slate-700 mb-2">ダウンロード履歴</h3>
                <p className="text-sm text-slate-400">ダウンロード履歴はまだありません</p>
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
                  disabled={!trendArea}
                  className="w-full bg-slate-800 hover:bg-slate-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold py-3 rounded-xl transition flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
                  </svg>
                  トレンドを表示
                </button>
              </div>

              <div className="bg-slate-50 rounded-xl p-8 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-slate-200 flex items-center justify-center">
                  <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
                  </svg>
                </div>
                <p className="text-sm text-slate-500">エリアを選択するとトレンドグラフが表示されます</p>
              </div>
            </div>
          )}

          {/* エリア比較レポート */}
          {activeTab === "compare" && (
            <div>
              <h2 className="text-xl font-bold text-slate-800 mb-2">エリア比較レポート</h2>
              <p className="text-sm text-slate-500 mb-6">
                複数エリアの相場・トレンドを比較するレポートを生成。PDFでダウンロードも可能です。
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
                    {compareAreas.map((code) => (
                      <span
                        key={code}
                        className="inline-flex items-center gap-1.5 bg-slate-100 text-slate-700 px-3 py-1.5 rounded-lg text-sm font-medium"
                      >
                        {prefectures[code]}
                        <button
                          onClick={() => removeCompareArea(code)}
                          className="text-slate-400 hover:text-red-500 transition"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <button
                    disabled={compareAreas.length < 2}
                    className="bg-slate-800 hover:bg-slate-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold py-3 rounded-xl transition flex items-center justify-center gap-2 text-sm"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 14.25v2.25m3-4.5v4.5m3-6.75v6.75m3-9v9M6 20.25h12A2.25 2.25 0 0020.25 18V6A2.25 2.25 0 0018 3.75H6A2.25 2.25 0 003.75 6v12A2.25 2.25 0 006 20.25z" />
                    </svg>
                    レポートを表示
                  </button>
                  <button
                    disabled={compareAreas.length < 2}
                    className="bg-amber-500 hover:bg-amber-600 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold py-3 rounded-xl transition flex items-center justify-center gap-2 text-sm"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                    </svg>
                    PDFダウンロード
                  </button>
                </div>
              </div>

              <div className="bg-slate-50 rounded-xl p-8 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-slate-200 flex items-center justify-center">
                  <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 14.25v2.25m3-4.5v4.5m3-6.75v6.75m3-9v9M6 20.25h12A2.25 2.25 0 0020.25 18V6A2.25 2.25 0 0018 3.75H6A2.25 2.25 0 003.75 6v12A2.25 2.25 0 006 20.25z" />
                  </svg>
                </div>
                <p className="text-sm text-slate-500">2つ以上のエリアを選択してレポートを生成してください</p>
              </div>
            </div>
          )}
        </div>

        {/* Plan Info */}
        <div className="mt-6 bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <p className="text-sm text-slate-500">ご利用中のプラン</p>
              <p className="font-bold text-slate-800">スタンダードプラン</p>
            </div>
            <div className="flex gap-3">
              <a
                href="/pricing"
                className="text-sm text-amber-600 hover:text-amber-700 font-medium transition"
              >
                プランを変更
              </a>
              <span className="text-slate-300">|</span>
              <a
                href="mailto:info@next-aura.com"
                className="text-sm text-slate-500 hover:text-slate-700 font-medium transition"
              >
                サポートに連絡
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
