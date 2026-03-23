import Header from "@/components/Header";
import Footer from "@/components/Footer";
import TrustBadges from "@/components/TrustBadges";
import UserTypeSection from "@/components/UserTypeSection";
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

      {/* Hero + Map */}
      <section className="relative bg-gradient-to-b from-[#0f172a] via-[#1e293b] to-[#0f172a] text-white overflow-hidden">
        {/* Background pattern */}
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
            {/* Left: Text + Search (2 cols) */}
            <div className="lg:col-span-2 pt-4">
              <div className="animate-fade-in-up">
                <div className="inline-flex items-center gap-2 bg-slate-500/10 border border-slate-500/20 rounded-full px-3 py-1 mb-6">
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                  <span className="text-slate-400 text-[10px] font-medium">
                    公的データ活用
                  </span>
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

              {/* Search Form */}
              <div className="animate-fade-in-up-delay-1">
                <div className="glass rounded-2xl p-5">
                  <p className="text-sm text-slate-300 mb-3 font-medium">
                    エリアを検索
                  </p>
                  <SearchForm />
                </div>
              </div>

              {/* Quick stats */}
              <div className="animate-fade-in-up-delay-2 mt-6 grid grid-cols-3 gap-3">
                {[
                  { value: "500万件+", label: "取引データ" },
                  { value: "20年分", label: "蓄積期間" },
                  { value: "47", label: "全都道府県" },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="text-center glass rounded-xl py-3"
                  >
                    <div className="text-lg font-bold text-amber-400">
                      {stat.value}
                    </div>
                    <div className="text-[10px] text-slate-500">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Interactive Map (3 cols) */}
            <div className="lg:col-span-3 animate-fade-in-up-delay-1">
              <MapSection />
            </div>
          </div>
        </div>
      </section>

      {/* Trust badges */}
      <TrustBadges />

      {/* Popular areas */}
      <PopularAreas />

      {/* Detailed Data Preview - concrete examples to drive conversion */}
      <DetailedDataPreview />

      {/* How it works */}
      <HowItWorks />

      {/* User Type Section */}
      <UserTypeSection />

      {/* Pricing */}
      <PricingSection />

      {/* Real Estate Service Banner */}
      <section className="py-12 bg-white border-y border-slate-100">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-8">
            <p className="text-sm text-amber-600 font-bold mb-1">ネクソラ不動産</p>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-800">
              相場データだけでなく、売却・購入もサポート
            </h2>
            <p className="text-slate-500 text-sm mt-2 max-w-2xl mx-auto">
              不動産相場ナビを運営するネクソラ不動産では、データに基づいた不動産の売却・購入の仲介も行っています。
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-5">
            <a
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
                  <p className="text-sm text-slate-600 mt-1">相場データに基づく適正価格で、損しない売却を実現。無料査定も実施中です。</p>
                  <span className="inline-flex items-center gap-1 text-sm text-blue-600 font-medium mt-2">
                    詳しく見る
                    <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </span>
                </div>
              </div>
            </a>
            <a
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
                  <p className="text-sm text-slate-600 mt-1">相場データで賢く物件選び。ご希望の条件に合った物件探しをサポートします。</p>
                  <span className="inline-flex items-center gap-1 text-sm text-emerald-600 font-medium mt-2">
                    詳しく見る
                    <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </span>
                </div>
              </div>
            </a>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative bg-gradient-to-r from-[#0f172a] to-[#1e3a5f] py-16 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
              backgroundSize: "32px 32px",
            }}
          />
        </div>
        <div className="relative max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            売却・購入のご相談もお気軽に
          </h2>
          <p className="text-slate-300 mb-8 leading-relaxed">
            相場データの確認から、実際の売却・購入まで一貫してサポート。
            <br className="hidden md:block" />
            まずはメールでお気軽にご相談ください。
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="mailto:info@next-aura.com"
              className="inline-block bg-amber-500 hover:bg-amber-600 text-white font-bold py-3.5 px-8 rounded-xl text-lg transition shadow-lg hover:shadow-xl animate-pulse-glow"
            >
              無料で相談する
            </a>
            <a
              href="/pricing"
              className="inline-block glass hover:bg-white/10 text-white font-bold py-3.5 px-8 rounded-xl text-lg transition"
            >
              料金プランを見る
            </a>
          </div>
        </div>
      </section>

      {/* SEO */}
      <section className="py-12 bg-white">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-xl font-bold mb-4 text-slate-800">
            不動産相場ナビとは
          </h2>
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
              データドリブンな不動産取引を実現します。
            </p>
          </div>
        </div>
      </section>

      <LegalNotice />
      <Footer />
    </>
  );
}
