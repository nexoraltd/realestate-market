"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ShareBar from "@/components/ShareBar";
import AssetScoreGauge from "@/components/AssetScoreGauge";
import ScoreBreakdown from "@/components/ScoreBreakdown";
import TierGate from "@/components/TierGate";
import FreeRegisterForm from "@/components/FreeRegisterForm";
import { useTier } from "@/hooks/useTier";
import { PREFECTURES } from "@/lib/prefectures";

const FuturePriceChart = dynamic(() => import("@/components/FuturePriceChart"), {
  ssr: false,
  loading: () => <div className="h-80 bg-slate-800/50 rounded-2xl animate-pulse" />,
});

interface City {
  id: string;
  name: string;
}

interface ScoreFactor {
  score: number;
  label: string;
  weight: number;
}

interface EstimateResult {
  count: number;
  estimate: { low: number; mid: number; high: number };
  pricePerSqm: { low: number; mid: number; high: number };
  samples: {
    period: string;
    municipality: string;
    district: string;
    price: number;
    area: number;
    pricePerSqm: number;
    buildingYear: string | null;
    station: string | null;
    stationMin: string | null;
    floorPlan: string | null;
  }[];
  prediction: {
    historicalTrend: { year: number; avgPricePerSqm: number; totalPrice: number }[];
    annualGrowthRate: { pessimistic: number; standard: number; optimistic: number };
    forecast: { year: number; pessimistic: number; standard: number; optimistic: number }[];
  };
  assetScore: {
    total: number;
    grade: string;
    breakdown: Record<string, ScoreFactor>;
  };
}

function fmtPrice(yen: number): string {
  if (yen >= 100_000_000) {
    const oku = yen / 100_000_000;
    return oku % 1 === 0 ? `${oku}億円` : `${oku.toFixed(1)}億円`;
  }
  const man = yen / 10_000;
  return `${man.toLocaleString()}万円`;
}

function fmtPricePerSqm(yen: number): string {
  const man = yen / 10_000;
  return `${man.toFixed(1)}万円/㎡`;
}

export default function EstimatePage() {
  const { tier, email } = useTier();
  const [type, setType] = useState("mansion");
  const [prefCode, setPrefCode] = useState("");
  const [cityCode, setCityCode] = useState("");
  const [floorArea, setFloorArea] = useState("");
  const [buildingAge, setBuildingAge] = useState("");
  const [stationMin, setStationMin] = useState("");
  const [floorPlan, setFloorPlan] = useState("");
  const [cities, setCities] = useState<City[]>([]);
  const [loadingCities, setLoadingCities] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<EstimateResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!prefCode) { setCities([]); setCityCode(""); return; }
    setLoadingCities(true);
    fetch(`/api/cities?area=${prefCode}`)
      .then((r) => r.json())
      .then((data) => { setCities(Array.isArray(data) ? data : []); setCityCode(""); })
      .catch(() => setCities([]))
      .finally(() => setLoadingCities(false));
  }, [prefCode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prefCode || !floorArea) return;
    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const res = await fetch("/api/estimate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          area: prefCode,
          city: cityCode || undefined,
          floorArea: parseFloat(floorArea),
          buildingAge: buildingAge ? parseInt(buildingAge, 10) : undefined,
          stationMin: stationMin ? parseInt(stationMin, 10) : -1,
          floorPlan: floorPlan || undefined,
          email: email || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 429) {
          setError(data.message || "月間利用上限に達しました。スタンダードプランにアップグレードすると無制限でご利用いただけます。");
        } else {
          setError(data.message || data.error || "エラーが発生しました");
        }
      } else {
        setResult(data);
      }
    } catch {
      setError("通信エラーが発生しました");
    } finally {
      setLoading(false);
    }
  };

  const sc = "w-full px-3 py-2.5 rounded-lg border border-slate-600 bg-slate-800/50 text-white placeholder-slate-400 focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition text-sm";
  const label = "block text-xs font-medium mb-1 text-slate-400";

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-b from-[#0f172a] to-[#1e293b] text-white">
        {/* Hero */}
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-full px-4 py-1.5 mb-5">
              <svg className="w-3.5 h-3.5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <span className="text-amber-400 text-xs font-semibold">AI不動産査定（無料）</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold mb-4 tracking-tight">
              あなたの物件、<span className="text-amber-400">今いくら？</span>
            </h1>
            <p className="text-slate-400 text-sm md:text-base max-w-xl mx-auto">
              国土交通省の実取引データ（直近5年）をもとに、推定価格・将来予測・資産性スコアをAIが算出。登録不要・完全無料。
            </p>
          </div>

          {/* Form */}
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6 md:p-8 mb-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Property type */}
              <div>
                <label className={label}>物件タイプ</label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: "mansion", label: "中古マンション", icon: "🏢" },
                    { value: "house", label: "一戸建て", icon: "🏠" },
                    { value: "land", label: "土地", icon: "🌿" },
                  ].map((t) => (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() => setType(t.value)}
                      className={`py-3 px-2 rounded-xl border text-center transition font-medium text-sm ${
                        type === t.value
                          ? "border-amber-500 bg-amber-500/10 text-amber-400"
                          : "border-slate-600 bg-slate-800/30 text-slate-400 hover:border-slate-500"
                      }`}
                    >
                      <div className="text-xl mb-1">{t.icon}</div>
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Location */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={label}>都道府県 <span className="text-red-400">*</span></label>
                  <select value={prefCode} onChange={(e) => setPrefCode(e.target.value)} className={sc} required>
                    <option value="">選択してください</option>
                    {PREFECTURES.map((p) => (
                      <option key={p.code} value={p.code}>{p.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={label}>市区町村（任意・絞り込み精度向上）</label>
                  <select value={cityCode} onChange={(e) => setCityCode(e.target.value)} className={sc} disabled={!prefCode || loadingCities}>
                    <option value="">すべて</option>
                    {cities.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Area */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className={label}>専有/延床面積（㎡）<span className="text-red-400">*</span></label>
                  <input
                    type="number"
                    min="1"
                    max="9999"
                    step="0.1"
                    value={floorArea}
                    onChange={(e) => setFloorArea(e.target.value)}
                    placeholder="例: 70"
                    className={sc}
                    required
                  />
                </div>
                {type === "mansion" && (
                  <div>
                    <label className={label}>間取り <span className="text-slate-600">（任意）</span></label>
                    <select
                      value={floorPlan}
                      onChange={(e) => setFloorPlan(e.target.value)}
                      className={sc}
                    >
                      <option value="">指定なし</option>
                      <option value="1R">1R・1K</option>
                      <option value="1DK">1DK</option>
                      <option value="1LDK">1LDK</option>
                      <option value="2DK">2DK</option>
                      <option value="2LDK">2LDK</option>
                      <option value="3DK">3DK</option>
                      <option value="3LDK">3LDK</option>
                      <option value="4LDK">4LDK以上</option>
                    </select>
                  </div>
                )}
                {type !== "land" && (
                  <div>
                    <label className={label}>築年数（年）</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={buildingAge}
                      onChange={(e) => setBuildingAge(e.target.value)}
                      placeholder="例: 15"
                      className={sc}
                    />
                  </div>
                )}
                {type !== "land" && (
                  <div>
                    <label className={label}>最寄り駅 徒歩（分）</label>
                    <input
                      type="number"
                      min="0"
                      max="99"
                      value={stationMin}
                      onChange={(e) => setStationMin(e.target.value)}
                      placeholder="例: 5"
                      className={sc}
                    />
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={loading || !prefCode || !floorArea}
                className="w-full py-4 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-bold text-white transition text-base shadow-lg shadow-amber-900/30"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    データ取得・計算中...
                  </span>
                ) : "推定価格を見る"}
              </button>
            </form>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-900/30 border border-red-700/50 rounded-xl p-4 mb-8 text-red-300 text-sm">
              {error}
            </div>
          )}

          {/* Result */}
          {result && (
            <div className="space-y-6">
              {/* Price range */}
              <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6 md:p-8">
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-2 h-6 rounded-full bg-amber-500" />
                  <h2 className="text-lg font-bold">推定価格レンジ</h2>
                  <span className="ml-auto text-xs text-slate-500">類似事例 {result.count} 件から算出</span>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-6">
                  {[
                    { key: "low" as const, label: "下限（安め）", color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20" },
                    { key: "mid" as const, label: "中央値", color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20" },
                    { key: "high" as const, label: "上限（高め）", color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
                  ].map((item) => (
                    <div key={item.key} className={`rounded-xl border p-4 text-center ${item.bg}`}>
                      <div className="text-xs text-slate-400 mb-2">{item.label}</div>
                      <div className={`text-xl md:text-2xl font-extrabold ${item.color}`}>
                        {fmtPrice(result.estimate[item.key])}
                      </div>
                      <div className="text-xs text-slate-500 mt-1">
                        {fmtPricePerSqm(result.pricePerSqm[item.key])}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Price bar */}
                <div className="relative">
                  <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 via-amber-500 to-emerald-500 rounded-full"
                      style={{ width: "100%" }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-slate-500 mt-1">
                    <span>{fmtPrice(result.estimate.low)}</span>
                    <span className="font-semibold text-amber-400">{fmtPrice(result.estimate.mid)}</span>
                    <span>{fmtPrice(result.estimate.high)}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-4">
                  <p className="text-xs text-slate-500 leading-relaxed flex-1">
                    ※ 国土交通省「不動産情報ライブラリ」の直近5年間の実取引データに基づく統計的推定です。
                  </p>
                  <ShareBar
                    path="/estimate"
                    text={`AI不動産査定: 推定${fmtPrice(result.estimate.mid)}・資産性スコア${result.assetScore?.total ?? ""}点（${PREFECTURES.find(p => p.code === prefCode)?.name || ""}）不動産相場ナビで無料査定 #不動産査定 #不動産`}
                    dark
                  />
                </div>
              </div>

              {/* Comparable samples */}
              {result.samples.length > 0 && (
                <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-2 h-6 rounded-full bg-slate-500" />
                    <h2 className="text-lg font-bold">参考成約事例</h2>
                    <span className="text-xs text-slate-500">（直近・類似物件）</span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-slate-500 text-xs border-b border-slate-700">
                          <th className="text-left pb-2 pr-4">成約時期</th>
                          <th className="text-left pb-2 pr-4">エリア</th>
                          <th className="text-right pb-2 pr-4">面積</th>
                          <th className="text-right pb-2 pr-4">成約価格</th>
                          <th className="text-right pb-2">㎡単価</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-700/50">
                        {result.samples.map((s, i) => (
                          <tr key={i} className="hover:bg-slate-700/20 transition">
                            <td className="py-3 pr-4 text-slate-400 whitespace-nowrap">{s.period}</td>
                            <td className="py-3 pr-4 text-slate-300">
                              {s.municipality}{s.district ? ` ${s.district}` : ""}
                              {s.station && <span className="text-slate-500 text-xs ml-1">({s.station}{s.stationMin ? ` 徒歩${s.stationMin}分` : ""})</span>}
                            </td>
                            <td className="py-3 pr-4 text-right text-slate-300 whitespace-nowrap">{s.area}㎡{s.floorPlan ? ` ${s.floorPlan}` : ""}</td>
                            <td className="py-3 pr-4 text-right font-semibold text-white whitespace-nowrap">{fmtPrice(s.price)}</td>
                            <td className="py-3 text-right text-slate-400 whitespace-nowrap text-xs">{fmtPricePerSqm(s.pricePerSqm)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Future Price Prediction */}
              {result.prediction && result.prediction.historicalTrend.length >= 2 && (
                <>
                  {tier === "guest" ? (
                    <>
                      {/* Guest: show 1yr only + registration CTA */}
                      <FuturePriceChart
                        historicalTrend={result.prediction.historicalTrend}
                        forecast={result.prediction.forecast.slice(0, 1)}
                        annualGrowthRate={result.prediction.annualGrowthRate}
                        currentEstimate={result.estimate.mid}
                      />
                      <div className="bg-slate-800/50 border border-amber-500/20 rounded-2xl p-6">
                        <div className="text-center mb-4">
                          <p className="text-amber-400 text-sm font-bold mb-1">10年後までの予測を見るには</p>
                          <p className="text-slate-400 text-xs">無料会員登録で10年後まで予測 + 資産性スコア内訳が見られます（月1回）</p>
                        </div>
                        <FreeRegisterForm />
                      </div>
                    </>
                  ) : (
                    /* Free & Paid: show full 10yr */
                    <FuturePriceChart
                      historicalTrend={result.prediction.historicalTrend}
                      forecast={result.prediction.forecast}
                      annualGrowthRate={result.prediction.annualGrowthRate}
                      currentEstimate={result.estimate.mid}
                    />
                  )}
                </>
              )}

              {/* Asset Score — tiered */}
              {result.assetScore && (
                <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6 md:p-8">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-6 rounded-full bg-gradient-to-b from-emerald-400 to-blue-500" />
                    <h2 className="text-lg font-bold text-white">資産性スコア</h2>
                    <span className="ml-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                      独自指標
                    </span>
                  </div>
                  <p className="text-slate-500 text-xs mb-6">
                    5つの因子から総合的に資産価値を評価。スコアが高いほど将来的な資産性が期待できます。
                  </p>

                  <div className="grid md:grid-cols-2 gap-8 items-start">
                    {/* Gauge always visible */}
                    <AssetScoreGauge
                      total={result.assetScore.total}
                      grade={result.assetScore.grade}
                    />
                    {/* Breakdown: gated for guest, full for free+ */}
                    {tier === "guest" ? (
                      <TierGate currentTier="guest" requiredTier="free" ctaText="無料登録でスコア内訳を見る">
                        <ScoreBreakdown breakdown={result.assetScore.breakdown} />
                      </TierGate>
                    ) : (
                      <div>
                        <ScoreBreakdown breakdown={result.assetScore.breakdown} />
                        {tier === "free" && (
                          <p className="text-[10px] text-amber-500/70 mt-4 text-center">
                            無料プラン: AI査定は月1回まで
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  <p className="text-[10px] text-slate-600 mt-6 leading-relaxed">
                    ※ 過去の取引データに基づく統計的評価であり、将来の資産価値を保証するものではありません。投資判断は自己責任でお願いします。
                  </p>
                </div>
              )}

              {/* CTA: 次のアクション */}
              <div className="bg-gradient-to-br from-amber-900/30 to-orange-900/20 border border-amber-700/30 rounded-2xl p-6">
                <div className="text-center mb-5">
                  <h3 className="font-bold text-lg mb-1">次のステップ</h3>
                  <p className="text-slate-400 text-sm">
                    AI査定は過去データに基づく参考値です。さらに詳しい分析で判断材料を増やしましょう。
                  </p>
                </div>
                <div className="grid sm:grid-cols-3 gap-3">
                  <a
                    href="/search"
                    className="flex items-center gap-3 bg-slate-700/60 hover:bg-slate-700 text-white border border-slate-600 rounded-xl p-4 transition group"
                  >
                    <div className="w-10 h-10 bg-slate-600/50 rounded-lg flex items-center justify-center shrink-0">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-bold text-sm">相場データを見る</p>
                      <p className="text-[11px] text-slate-400">エリアの取引事例を確認</p>
                    </div>
                  </a>
                  <a
                    href="/pricing"
                    className="flex items-center gap-3 bg-amber-500 hover:bg-amber-400 text-slate-900 rounded-xl p-4 transition group"
                  >
                    <div className="w-10 h-10 bg-amber-600/30 rounded-lg flex items-center justify-center shrink-0">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-bold text-sm">詳細データで分析</p>
                      <p className="text-[11px] opacity-80">14日間無料トライアル</p>
                    </div>
                  </a>
                  <a
                    href="/contact"
                    className="flex items-center gap-3 bg-slate-700/60 hover:bg-slate-700 text-white border border-slate-600 rounded-xl p-4 transition group"
                  >
                    <div className="w-10 h-10 bg-slate-600/50 rounded-lg flex items-center justify-center shrink-0">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-bold text-sm">専門家に相談</p>
                      <p className="text-[11px] text-slate-400">プロが無料でアドバイス</p>
                    </div>
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}
