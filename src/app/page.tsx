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
import DetailedDataPreview from "@/components/DetailedDataPreview";

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
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                  <span className="text-slate-400 text-[10px] font-medium">公的データ活用</span>
                </div>
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold mb-5 leading-tight tracking-tight">
                  マップで見る
                  <br />
                  <span className="gradient-text">不動産相場</span>
                  <br />
                  データベース
                </h1>
                <p className="text-slate-400 mb-8 leading-relaxed text-sm md:text-base">
                  不動産取引データをマップで直感的に検索。
                  買いたい方も売りたい方も、相場を知ることが第一歩です。
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

      {/* ③ 使い方の説明 — まずサービスを理解してもらう */}
      <HowItWorks />

      {/* ④ AI査定 — 理解した上でメインCTAへ */}
      <section className="py-16 bg-gradient-to-b from-[#0f172a] via-[#0f1f3a] to-[#0f172a]">
        <div className="max-w-5xl mx-auto px-4">
          <div className="rounded-3xl border border-amber-500/20 bg-gradient-to-br from-slate-800/80 to-slate-900/80 overflow-hidden">
            <div className="grid md:grid-cols-2 gap-0">
              <div className="p-8 md:p-12 flex flex-col justify-center">
                <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 rounded-full px-3 py-1 mb-5 w-fit">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                  <span className="text-amber-400 text-[11px] font-bold tracking-wider">無料 · 登録不要</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-extrabold text-white leading-tight mb-4">
                  あなたの物件、<br />
                  <span className="text-amber-400">今いくら？</span>
                </h2>
                <p className="text-slate-400 text-sm leading-relaxed mb-6">
                  国土交通省の実取引データをAIが解析。
                  物件種別・面積・間取り・築年数を入力するだけで、
                  <strong className="text-slate-300">数秒で査定額と参考成約事例</strong>をご確認いただけます。
                </p>
                <div className="flex flex-wrap gap-2 mb-7">
                  {["中古マンション", "一戸建て", "土地"].map((type) => (
                    <span key={type} className="bg-slate-700/50 border border-slate-600 text-slate-300 text-xs px-3 py-1.5 rounded-full">
                      {type}
                    </span>
                  ))}
                </div>
                <Link
                  href="/estimate"
                  className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold py-3.5 px-7 rounded-xl text-base transition shadow-lg hover:shadow-amber-500/25 w-fit"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 11h.01M12 11h.01M15 11h.01M4 19h16a2 2 0 002-2V7a2 2 0 00-2-2H4a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  無料でAI査定する
                </Link>
              </div>
              <div className="bg-slate-900/60 border-l border-slate-700/50 p-8 md:p-10 flex flex-col justify-center">
                <p className="text-xs text-slate-500 mb-4 font-medium">査定結果イメージ</p>
                <div className="space-y-4">
                  <div className="flex items-center justify-between bg-slate-800/60 rounded-xl p-4 border border-slate-700">
                    <div>
                      <p className="text-[10px] text-slate-500 mb-1">推定査定額</p>
                      <p className="text-2xl font-extrabold text-amber-400">4,200<span className="text-base font-bold ml-1">万円</span></p>
                      <p className="text-[10px] text-slate-500 mt-1">3,800 〜 4,600万円</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-slate-500 mb-1">㎡単価</p>
                      <p className="text-lg font-bold text-white">71<span className="text-sm ml-0.5">万円</span></p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-[10px] text-slate-500 font-medium">参考成約事例</p>
                    {[
                      { area: "東京都渋谷区", size: "58㎡ 2LDK", price: "4,100万" },
                      { area: "東京都渋谷区", size: "62㎡ 2LDK", price: "4,350万" },
                    ].map((ex, i) => (
                      <div key={i} className="flex items-center justify-between text-xs bg-slate-800/40 rounded-lg px-3 py-2">
                        <span className="text-slate-400">{ex.area} {ex.size}</span>
                        <span className="text-slate-300 font-medium">{ex.price}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <p className="text-[10px] text-slate-600 mt-4">※ 表示はイメージです。</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ⑤ 人気エリア — データの説得力 */}
      <PopularAreas />

      {/* ⑥ 詳細データプレビュー — データの深さを見せる */}
      <DetailedDataPreview />

      {/* ⑦ ターゲット別導線 — 探索後に行動分岐 */}
      <section className="py-14 bg-white border-y border-slate-100">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-8">
            <p className="text-sm text-amber-600 font-bold mb-1">ネクソラ不動産</p>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-800">売却・購入もプロにおまかせ</h2>
            <p className="text-slate-500 text-sm mt-2 max-w-xl mx-auto">
              相場データの確認から、実際の売却・購入まで一貫サポート。
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-5">
            <Link
              href="/sell"
              className="group bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-2xl p-6 border border-blue-200/50 hover:shadow-md transition"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 0h.008v.008h-.008V7.5z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-800 group-hover:text-blue-700 transition">不動産を売りたい方</h3>
                  <p className="text-sm text-slate-600 mt-1">相場データに基づく適正価格で、損しない売却を実現。AI査定＋専門家サポート。</p>
                  <span className="inline-flex items-center gap-1 text-sm text-blue-600 font-medium mt-2">
                    詳しく見る
                    <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </span>
                </div>
              </div>
            </Link>
            <Link
              href="/buy"
              className="group bg-gradient-to-br from-emerald-50 to-emerald-100/50 rounded-2xl p-6 border border-emerald-200/50 hover:shadow-md transition"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-800 group-hover:text-emerald-700 transition">不動産を買いたい方</h3>
                  <p className="text-sm text-slate-600 mt-1">相場データで賢く物件選び。ご希望の条件に合った物件探しをプロがサポート。</p>
                  <span className="inline-flex items-center gap-1 text-sm text-emerald-600 font-medium mt-2">
                    詳しく見る
                    <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </span>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* ⑧ 料金プラン */}
      <PricingSection />

      {/* ⑨ お役立ちコンテンツ（カレンダー＋コラム統合） */}
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

      {/* ⑩ 最終CTA — 1箇所に集約 */}
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
              2005年以降の全国47都道府県の取引事例を網羅し、マンション・戸建て・土地など物件種別ごとの相場情報を無料でご覧いただけます。
            </p>
            <p>
              不動産の売却をご検討中の方は、お持ちの物件があるエリアの過去の取引事例を確認することで、適切な売出価格の設定に役立ちます。
              購入をご検討中の方は、希望エリアの相場を事前に把握し、提示価格の妥当性を判断する材料としてご活用ください。
            </p>
            <p>
              不動産業者・投資家の方には、有料プランで20年分のデータへのアクセス、CSVダウンロード、トレンド分析など高度な機能をご用意しています。
            </p>
          </div>
        </div>
      </section>

      <LegalNotice />
      <Footer />
    </>
  );
}
