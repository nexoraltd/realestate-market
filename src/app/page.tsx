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
                  首都圏の不動産取引データをマップで直感的に検索。
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
            売却をお考えですか？
          </h2>
          <p className="text-slate-300 mb-8 leading-relaxed">
            相場データを確認したら、次は無料査定でより正確な価格をお確かめください。
            <br className="hidden md:block" />
            経験豊富なスタッフが丁寧にご対応いたします。
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="mailto:info@next-aura.com"
              className="inline-block bg-amber-500 hover:bg-amber-600 text-white font-bold py-3.5 px-8 rounded-xl text-lg transition shadow-lg hover:shadow-xl animate-pulse-glow"
            >
              無料査定を依頼する
            </a>
            <a
              href="mailto:info@next-aura.com"
              className="inline-block glass hover:bg-white/10 text-white font-bold py-3.5 px-8 rounded-xl text-lg transition"
            >
              info@next-aura.com
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
              不動産相場ナビは、国土交通省が公開している不動産取引価格情報を活用した、日本最大級の不動産相場データベースです。
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
