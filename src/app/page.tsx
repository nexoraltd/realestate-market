import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import TrustBadges from "@/components/TrustBadges";
import PricingSection from "@/components/PricingSection";
import LegalNotice from "@/components/LegalNotice";
import SearchForm from "@/components/SearchForm";
import PopularAreas from "@/components/PopularAreas";
import HowItWorks from "@/components/HowItWorks";
import MapSection from "@/components/MapSection";
import FreeRegisterForm from "@/components/FreeRegisterForm";
import LineAddFriend from "@/components/LineAddFriend";

export default function Home() {
  return (
    <>
      <Header />

      {/* ① Hero + Map */}
      <section className="relative bg-gradient-to-b from-[#0f172a] via-[#1e293b] to-[#0f172a] text-white overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
              backgroundSize: "40px 40px",
            }}
          />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 py-12 md:py-16">
          <div className="grid lg:grid-cols-5 gap-8 items-start">
            <div className="lg:col-span-2 pt-4">
              <div className="animate-fade-in-up">
                <div className="inline-flex items-center gap-2 bg-slate-500/10 border border-slate-500/20 rounded-full px-3 py-1 mb-6">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                  <span className="text-slate-400 text-[10px] font-medium">数字は嘘をつかない</span>
                </div>
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold mb-5 leading-tight tracking-tight">
                  不動産の常識を
                  <br />
                  <span className="gradient-text">データで覆す</span>
                </h1>
                <p className="text-slate-400 mb-8 leading-relaxed text-sm md:text-base">
                  500万件の実取引データが映す、不動産の真実。
                  業界の「空気」ではなく「数字」で、正しい判断を。
                </p>
              </div>
              <div className="animate-fade-in-up-delay-1">
                <div className="glass rounded-2xl p-5">
                  <p className="text-sm text-slate-300 mb-3 font-medium">エリアを検索</p>
                  <SearchForm />
                </div>
              </div>
              <div className="animate-fade-in-up-delay-2 mt-6 grid grid-cols-3 gap-3">
                {[
                  { value: "500万件+", label: "取引データ" },
                  { value: "20年分", label: "蓄積期間" },
                  { value: "47", label: "全都道府県" },
                ].map((stat) => (
                  <div key={stat.label} className="text-center glass rounded-xl py-3">
                    <div className="text-lg font-bold text-amber-400">{stat.value}</div>
                    <div className="text-[10px] text-slate-500">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="lg:col-span-3 animate-fade-in-up-delay-1">
              <MapSection />
            </div>
          </div>
        </div>
      </section>

      {/* ② 信頼バッジ */}
      <TrustBadges />

      {/* ③ キラーコンテンツ訴求 — 将来予測 + 資産性スコア */}
      <section className="py-20 bg-gradient-to-b from-[#0f172a] via-[#0f1f3a] to-[#0f172a]">
        <div className="max-w-6xl mx-auto px-4">
          {/* Section header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 rounded-full px-4 py-1.5 mb-5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              <span className="text-amber-400 text-xs font-bold tracking-wider">他にはない独自機能</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-white leading-tight mb-4">
              「今いくら」だけじゃない。<br />
              <span className="gradient-text">10年後の価格</span>まで、AIが予測。
            </h2>
            <p className="text-slate-400 text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
              500万件の実取引データから将来価格を3シナリオ予測。<br className="hidden md:block" />
              さらに5つの因子で資産性を0〜100点でスコアリング。無料登録で月1回利用可能。
            </p>
          </div>

          {/* 3 Feature cards */}
          <div className="grid md:grid-cols-3 gap-5 mb-10">
            {/* Card 1: Current estimate */}
            <div className="rounded-2xl border border-slate-700 bg-slate-800/50 p-6 relative overflow-hidden group hover:border-amber-500/40 transition">
              <div className="absolute top-0 right-0 w-20 h-20 bg-amber-500/5 rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-4">
                <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-bold text-white text-lg mb-2">AI推定価格</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-4">
                直近5年の実取引データからp25/p50/p75パーセンタイルで価格レンジを算出
              </p>
              <div className="bg-slate-900/60 rounded-xl p-4 border border-slate-700/50">
                <div className="text-[10px] text-slate-500 mb-1">推定査定額（例）</div>
                <div className="text-2xl font-extrabold text-amber-400">4,200<span className="text-sm ml-1">万円</span></div>
                <div className="text-[10px] text-slate-500 mt-1">3,800 〜 4,600万円</div>
              </div>
            </div>

            {/* Card 2: Future prediction */}
            <div className="rounded-2xl border border-emerald-500/30 bg-gradient-to-b from-slate-800/50 to-emerald-900/10 p-6 relative overflow-hidden group hover:border-emerald-400/50 transition">
              <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-500/5 rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="absolute top-3 right-3">
                <span className="bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[9px] font-bold px-2 py-0.5 rounded-full">NEW</span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-4">
                <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <h3 className="font-bold text-white text-lg mb-2">将来価格予測AI</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-4">
                3シナリオ（楽観・標準・悲観）で10年後まで価格をチャート表示
              </p>
              {/* Mini chart mockup */}
              <div className="bg-slate-900/60 rounded-xl p-4 border border-slate-700/50">
                <div className="flex items-end gap-1 h-16 mb-2">
                  {[28, 32, 30, 35, 38, 36, 40, 44, 48, 52, 50, 55, 60, 65, 70].map((h, i) => (
                    <div
                      key={i}
                      className={`flex-1 rounded-t-sm transition-all ${
                        i < 8 ? "bg-amber-500/60" : "bg-emerald-500/50"
                      }`}
                      style={{ height: `${h}%` }}
                    />
                  ))}
                </div>
                <div className="flex justify-between text-[9px] text-slate-600">
                  <span>2021</span>
                  <span className="text-slate-500">← 実績 | 予測 →</span>
                  <span>2036</span>
                </div>
                <div className="mt-2 grid grid-cols-3 gap-2">
                  <div className="text-center">
                    <div className="text-[9px] text-blue-400">悲観</div>
                    <div className="text-xs font-bold text-blue-400">4,800万</div>
                  </div>
                  <div className="text-center">
                    <div className="text-[9px] text-amber-400">標準</div>
                    <div className="text-xs font-bold text-amber-400">5,400万</div>
                  </div>
                  <div className="text-center">
                    <div className="text-[9px] text-emerald-400">楽観</div>
                    <div className="text-xs font-bold text-emerald-400">6,200万</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 3: Asset score */}
            <div className="rounded-2xl border border-blue-500/30 bg-gradient-to-b from-slate-800/50 to-blue-900/10 p-6 relative overflow-hidden group hover:border-blue-400/50 transition">
              <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/5 rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="absolute top-3 right-3">
                <span className="bg-blue-500/15 border border-blue-500/30 text-blue-400 text-[9px] font-bold px-2 py-0.5 rounded-full">NEW</span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-4">
                <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="font-bold text-white text-lg mb-2">資産性スコア</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-4">
                5因子を加重平均し0〜100点で資産価値を定量評価。S〜Dランク付き
              </p>
              {/* Score gauge mockup */}
              <div className="bg-slate-900/60 rounded-xl p-4 border border-slate-700/50">
                <div className="flex items-center justify-center mb-3">
                  <svg viewBox="0 0 200 110" className="w-36">
                    <defs>
                      <linearGradient id="homeGaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#ef4444" />
                        <stop offset="25%" stopColor="#f97316" />
                        <stop offset="50%" stopColor="#f59e0b" />
                        <stop offset="75%" stopColor="#10b981" />
                        <stop offset="100%" stopColor="#3b82f6" />
                      </linearGradient>
                    </defs>
                    <path d="M 20 95 A 80 80 0 0 1 180 95" fill="none" stroke="#334155" strokeWidth="12" strokeLinecap="round" />
                    <path d="M 20 95 A 80 80 0 0 1 166 65" fill="none" stroke="url(#homeGaugeGrad)" strokeWidth="12" strokeLinecap="round" />
                    <text x="100" y="78" textAnchor="middle" fill="white" fontSize="30" fontWeight="800">78</text>
                    <text x="100" y="95" textAnchor="middle" fill="#64748b" fontSize="10">/ 100</text>
                  </svg>
                </div>
                <div className="text-center">
                  <span className="inline-flex items-center gap-1.5 bg-emerald-500/15 border border-emerald-500/30 rounded-full px-3 py-1">
                    <span className="text-base font-black text-emerald-400">A</span>
                    <span className="text-[10px] text-slate-400">優良</span>
                  </span>
                </div>
                <div className="mt-3 space-y-1.5">
                  {[
                    { label: "価格トレンド", score: 85, color: "bg-emerald-500" },
                    { label: "駅アクセス", score: 90, color: "bg-emerald-500" },
                    { label: "エリア需要", score: 72, color: "bg-amber-500" },
                    { label: "割安度", score: 55, color: "bg-orange-500" },
                    { label: "流動性", score: 80, color: "bg-emerald-500" },
                  ].map((f) => (
                    <div key={f.label} className="flex items-center gap-2">
                      <span className="text-[9px] text-slate-500 w-16 text-right">{f.label}</span>
                      <div className="flex-1 h-1.5 bg-slate-700/50 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${f.color}`} style={{ width: `${f.score}%` }} />
                      </div>
                      <span className="text-[9px] text-slate-400 w-5 text-right">{f.score}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center">
            <Link
              href="/register?plan=free"
              className="inline-flex items-center gap-3 bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold py-4 px-10 rounded-xl text-lg transition shadow-lg hover:shadow-amber-500/25 animate-pulse-glow"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              無料登録して将来予測・スコアを解放する
            </Link>
            <p className="text-slate-500 text-xs mt-3">メールアドレスのみ・30秒で完了 / クレジットカード不要</p>
          </div>
        </div>
      </section>

      {/* ④ 人気エリア — データの説得力 */}
      <PopularAreas />

      {/* ⑤ 無料会員登録CTA */}
      <section className="py-16 bg-gradient-to-b from-[#0f172a] to-[#1e293b]">
        <div className="max-w-3xl mx-auto px-4">
          <div className="rounded-3xl border border-amber-500/20 bg-gradient-to-br from-slate-800/80 to-slate-900/80 p-8 md:p-12">
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 rounded-full px-4 py-1.5 mb-4">
                <span className="text-amber-400 text-xs font-bold">無料 / 30秒で完了</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-3">
                無料登録で、もっと見える。
              </h2>
              <p className="text-slate-400 text-sm max-w-lg mx-auto leading-relaxed">
                メールアドレスの登録だけで、将来価格予測が10年後まで解放。<br className="hidden md:block" />
                資産性スコアの5因子内訳も全て見られます。
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="space-y-3">
                {[
                  { icon: "📈", text: "将来価格予測 10年後まで（月1回）" },
                  { icon: "📊", text: "資産性スコア 5因子の内訳表示" },
                  { icon: "🔍", text: "相場検索 月3回" },
                  { icon: "📋", text: "参考成約事例 5件まで" },
                ].map((item) => (
                  <div key={item.text} className="flex items-center gap-3">
                    <span className="text-lg">{item.icon}</span>
                    <span className="text-sm text-slate-300">{item.text}</span>
                  </div>
                ))}
              </div>
              <div className="bg-slate-900/60 border border-slate-700/50 rounded-2xl p-6">
                <p className="text-xs text-slate-500 mb-4 font-medium text-center">無料会員登録</p>
                <FreeRegisterForm />
                <p className="text-center text-[10px] text-slate-600 mt-2">
                  クレジットカード不要 / いつでも退会可能
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ⑥ 使い方の説明 */}
      <HowItWorks />

      {/* ⑦ 無料ツール — 住宅ローン・固定資産税 */}
      <section className="py-14 bg-white border-y border-slate-100">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-8">
            <p className="text-sm text-amber-600 font-bold mb-1">無料ツール</p>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-800">不動産の判断に必要な計算を、すべて無料で</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            <Link
              href="/estimate"
              className="group bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6 border border-amber-200/50 hover:shadow-lg transition"
            >
              <div className="w-12 h-12 rounded-xl bg-amber-500 text-white flex items-center justify-center mb-4">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="font-bold text-lg text-slate-800 group-hover:text-amber-700 transition mb-1">AI不動産査定</h3>
              <p className="text-sm text-slate-600 mb-2">推定価格 + 将来予測 + 資産性スコア</p>
              <span className="inline-flex items-center gap-1 text-sm text-amber-600 font-medium">
                査定する
                <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </span>
            </Link>
            <Link
              href="/tools/loan-simulator"
              className="group bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200/50 hover:shadow-lg transition"
            >
              <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center mb-4">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 11h.01M12 11h.01M15 11h.01M4 19h16a2 2 0 002-2V7a2 2 0 00-2-2H4a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="font-bold text-lg text-slate-800 group-hover:text-blue-700 transition mb-1">住宅ローンシミュレーター</h3>
              <p className="text-sm text-slate-600 mb-2">月返済額・総返済額・返済スケジュール</p>
              <span className="inline-flex items-center gap-1 text-sm text-blue-600 font-medium">
                シミュレーション
                <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </span>
            </Link>
            <Link
              href="/tools/property-tax"
              className="group bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-6 border border-emerald-200/50 hover:shadow-lg transition"
            >
              <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center mb-4">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="font-bold text-lg text-slate-800 group-hover:text-emerald-700 transition mb-1">固定資産税計算機</h3>
              <p className="text-sm text-slate-600 mb-2">年間の固定資産税・都市計画税を試算</p>
              <span className="inline-flex items-center gap-1 text-sm text-emerald-600 font-medium">
                計算する
                <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* ⑧ 単発レポート — サブスク不要 */}
      <section className="py-14 bg-white">
        <div className="max-w-4xl mx-auto px-4">
          <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-8 md:p-10 flex flex-col md:flex-row gap-8 items-center">
            <div className="flex-1">
              <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-full px-3 py-1 mb-4">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                <span className="text-amber-700 text-xs font-bold">サブスク不要・買い切り</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-extrabold text-slate-800 mb-3">
                気になるエリアだけ、<br />
                <span className="text-amber-500">980円</span>で単発レポート
              </h2>
              <p className="text-slate-500 text-sm leading-relaxed mb-5">
                月額契約なし。調べたいエリアを1つ選んで、過去5年分の取引データを種別・年度別で即取得。
              </p>
              <ul className="space-y-2 mb-6">
                {[
                  "過去5年間の実取引データ（種別別・年度別集計）",
                  "エリア別価格推移グラフ",
                  "種別ごとの相場レンジ（中古マンション・戸建て・土地）",
                  "月額契約なし・1回限りの支払い",
                ].map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-slate-600">
                    <svg className="w-4 h-4 text-amber-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/search"
                className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold py-3 px-6 rounded-xl text-sm transition"
              >
                エリアを選んで購入する
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
            <div className="w-full md:w-56 shrink-0">
              <div className="rounded-2xl border-2 border-amber-400 bg-white p-6 text-center shadow-lg">
                <p className="text-xs text-slate-500 mb-1">1エリア・単発</p>
                <div className="text-5xl font-extrabold text-amber-500 mb-1">¥980</div>
                <p className="text-xs text-slate-400 mb-5">税込 / サブスクなし</p>
                <div className="space-y-1.5 text-left mb-5">
                  {["月額契約なし", "即時アクセス", "エリア自由に選択"].map((t) => (
                    <p key={t} className="text-xs text-slate-500 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                      {t}
                    </p>
                  ))}
                </div>
                <Link
                  href="/search"
                  className="block bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold py-2.5 px-4 rounded-xl text-sm transition w-full text-center"
                >
                  エリアを選ぶ →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ⑨ 料金プラン */}
      <PricingSection />

      {/* ⑩ お役立ちコンテンツ（カレンダー＋コラム統合） */}
      <section className="py-16 bg-[#0f172a]">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-10">
            <p className="text-sm text-amber-400 font-bold mb-2 tracking-wider">お役立ちコンテンツ</p>
            <h2 className="text-2xl md:text-3xl font-bold text-white">不動産をもっと賢く</h2>
            <p className="text-slate-400 text-sm mt-2 max-w-xl mx-auto">
              相場調査から日取り選びまで、不動産取引に役立つ情報を無料で提供しています。
            </p>
          </div>

          {/* カレンダーCTA */}
          <div className="mb-8">
            <Link
              href="/lp/moving-date"
              className="group flex items-center gap-5 bg-slate-800/50 rounded-2xl p-5 border border-slate-700 hover:border-amber-500/40 transition"
            >
              <div className="w-14 h-14 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0 text-2xl">
                📅
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] text-amber-400 font-bold mb-0.5">無料ツール</p>
                <h3 className="font-bold text-white group-hover:text-amber-400 transition">引っ越しに良い日カレンダー 2026</h3>
                <p className="text-xs text-slate-400 mt-0.5">大安・一粒万倍日・天赦日をまとめて確認。引っ越し・契約に最適な日取りをチェック。</p>
              </div>
              <svg className="w-5 h-5 text-slate-500 group-hover:text-amber-400 group-hover:translate-x-0.5 transition-all shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          {/* コラム */}
          <div className="grid md:grid-cols-3 gap-5">
            {[
              {
                title: "AI不動産査定とは？無料で使えるサービスの仕組みと精度を徹底解説",
                slug: "ai-fudousan-satei-muryou",
                description: "AIが実取引データを解析して査定額を算出する仕組み、精度の目安を詳しく解説。",
                tag: "査定・売却",
              },
              {
                title: "2026年の不動産は買い時？金利・相場・市場動向から徹底分析",
                slug: "fudousan-kaeru-timing-2026",
                description: "2026年の不動産市場を価格水準・金利・エリア別に分析。購入の判断指標を紹介。",
                tag: "購入・相場",
              },
              {
                title: "マンションの相場・価格の調べ方完全版｜無料で使える6つの方法",
                slug: "mansion-souba-kakaku-chosa",
                description: "国交省データ、公示地価、AI査定など6つの方法を徹底比較。",
                tag: "相場調査",
              },
            ].map((article) => (
              <Link
                key={article.slug}
                href={`/blog/${article.slug}`}
                className="group bg-slate-800/50 rounded-2xl p-6 border border-slate-700 hover:border-amber-500/50 hover:bg-slate-800/80 transition"
              >
                <span className="inline-block text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-full px-2 py-0.5 mb-3 font-medium">
                  {article.tag}
                </span>
                <h3 className="font-bold text-white group-hover:text-amber-400 transition leading-snug text-sm">
                  {article.title}
                </h3>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  {article.description}
                </p>
                <span className="inline-flex items-center gap-1 text-xs text-amber-400 font-medium mt-3">
                  続きを読む
                  <svg className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              </Link>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link href="/blog" className="inline-flex items-center gap-2 text-amber-400 hover:text-amber-300 font-medium transition text-sm">
              コラムをもっと見る
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* ⑩ LINE */}
      <section className="py-12 bg-[#0f172a]">
        <div className="max-w-2xl mx-auto px-4">
          <LineAddFriend variant="banner" />
        </div>
      </section>

      {/* ⑪ 最終CTA — 1箇所に集約 */}
      <section className="relative bg-gradient-to-r from-[#0f172a] to-[#1e3a5f] py-16 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
              backgroundSize: "32px 32px",
            }}
          />
        </div>
        <div className="relative max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            まずは無料AI査定からはじめよう
          </h2>
          <p className="text-slate-300 mb-8 leading-relaxed text-sm md:text-base">
            登録不要・完全無料。国交省データに基づく査定結果を数秒で表示。
            <br className="hidden md:block" />
            売却・購入の相談はプロスタッフが対応します。
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/estimate"
              className="inline-block bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold py-3.5 px-8 rounded-xl text-base transition shadow-lg hover:shadow-amber-500/20 animate-pulse-glow"
            >
              無料AI査定を試す
            </Link>
            <Link
              href="/contact"
              className="inline-block glass hover:bg-white/10 text-white font-bold py-3.5 px-8 rounded-xl text-base transition border border-white/20"
            >
              専門家に相談する
            </Link>
          </div>
        </div>
      </section>

      {/* SEO text */}
      <section className="py-12 bg-white">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-xl font-bold mb-4 text-slate-800">不動産相場ナビとは</h2>
          <div className="text-sm text-slate-600 space-y-3 leading-relaxed">
            <p>
              不動産相場ナビは、不動産業界の情報の非対称性を解消することを目的に作られた、日本最大級の不動産相場データベースです。
              国土交通省の実取引データ500万件以上を活用し、全国47都道府県のマンション・戸建て・土地の相場情報を提供しています。
            </p>
            <p>
              AI査定では、推定価格に加えて将来価格予測（3シナリオで10年先まで）と資産性スコア（5因子による0〜100点評価）を算出。
              「今いくらか」だけでなく「将来どうなるか」まで、データに基づいた判断材料を提供します。無料会員登録で月1回ご利用いただけます。
            </p>
            <p>
              スタンダードプラン（月額2,980円）ではAI査定・相場検索が無制限に。プロフェッショナルプラン（月額6,800円）では20年分のトレンド分析、CSV無制限ダウンロード、チームアカウント（5名）など法人向け機能をご用意しています。月額契約なしで試したい方には、1エリア980円の単発レポートもご利用いただけます。
            </p>
          </div>
        </div>
      </section>

      {/* データ有効期限の明記 */}
      <section className="bg-amber-50 border-t border-amber-200 py-6">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex items-start gap-3 text-sm text-amber-900">
            <span className="text-lg leading-none mt-0.5">⚠️</span>
            <div>
              <p className="font-bold mb-1">データの収録範囲について</p>
              <p>
                本サービスで提供しているデータは、国土交通省「不動産情報ライブラリ」の
                <strong>2025年第4四半期（2025年10〜12月）まで</strong>の実取引データに基づいています。
                <strong>2026年のデータは現在収録されていません。</strong>
                国交省のデータ公開は実取引から約2四半期遅れるため、最新四半期が反映されるまでタイムラグが生じます。
                購入・売却の判断には必ず最新情報を専門家にご確認ください。
              </p>
            </div>
          </div>
        </div>
      </section>

      <LegalNotice />
      <Footer />
    </>
  );
}
