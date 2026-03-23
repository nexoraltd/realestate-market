import Header from "@/components/Header";
import Footer from "@/components/Footer";
import JapanMap from "@/components/JapanMap";
import TrustBadges from "@/components/TrustBadges";
import UserTypeSection from "@/components/UserTypeSection";
import PricingSection from "@/components/PricingSection";
import LegalNotice from "@/components/LegalNotice";
import SearchForm from "@/components/SearchForm";

export default function Home() {
  return (
    <>
      <Header />

      {/* Hero + Map */}
      <section className="bg-gradient-to-br from-[#1a365d] via-[#2b6cb0] to-[#2c5282] text-white">
        <div className="max-w-6xl mx-auto px-4 py-12 md:py-16">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            {/* Left: Text + Search */}
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold mb-4 leading-tight">
                地図から一目でわかる
                <br />
                <span className="text-[#ed8936]">不動産相場</span>データベース
              </h1>
              <p className="text-blue-100 mb-8 leading-relaxed">
                国土交通省の公的データを活用した、全国47都道府県の不動産取引価格情報。
                地図をクリックするだけで、エリアの相場がすぐにわかります。
              </p>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5">
                <p className="text-sm text-blue-200 mb-3 font-medium">
                  キーワードで検索
                </p>
                <SearchForm />
              </div>
            </div>

            {/* Right: Map */}
            <div className="hidden md:block">
              <p className="text-center text-sm text-blue-200 mb-2">
                都道府県をクリックして相場を確認
              </p>
              <JapanMap />
            </div>
          </div>
        </div>
      </section>

      {/* Trust badges */}
      <TrustBadges />

      {/* Mobile Map */}
      <section className="md:hidden py-8 bg-white">
        <div className="max-w-md mx-auto px-4">
          <h2 className="text-lg font-bold text-[#1a365d] text-center mb-4">
            地図から相場を調べる
          </h2>
          <JapanMap />
        </div>
      </section>

      {/* User Type Section */}
      <UserTypeSection />

      {/* Popular areas */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-center text-[#1a365d] mb-3">
            人気エリアの相場
          </h2>
          <p className="text-center text-gray-500 mb-10">
            よく検索されているエリアをチェック
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { code: "13", name: "東京都", avg: "7,692万円", emoji: "🏙️" },
              { code: "27", name: "大阪府", avg: "3,245万円", emoji: "🏯" },
              { code: "14", name: "神奈川県", avg: "4,830万円", emoji: "🌊" },
              { code: "23", name: "愛知県", avg: "3,120万円", emoji: "🏭" },
              { code: "40", name: "福岡県", avg: "2,890万円", emoji: "🌉" },
              { code: "11", name: "埼玉県", avg: "3,050万円", emoji: "🌳" },
              { code: "12", name: "千葉県", avg: "2,780万円", emoji: "✈️" },
              { code: "26", name: "京都府", avg: "3,560万円", emoji: "⛩️" },
            ].map((area) => (
              <a
                key={area.code}
                href={`/search?area=${area.code}&year=2024&quarter=4`}
                className="group bg-gray-50 hover:bg-white rounded-xl p-4 border border-gray-100 hover:border-[#2b6cb0] hover:shadow-lg transition"
              >
                <div className="text-2xl mb-2">{area.emoji}</div>
                <div className="font-bold text-[#1a365d] group-hover:text-[#2b6cb0] transition">
                  {area.name}
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  平均 <span className="font-semibold text-[#ed8936]">{area.avg}</span>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <PricingSection />

      {/* CTA */}
      <section className="bg-gradient-to-r from-[#1a365d] to-[#2b6cb0] py-16 text-white">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            売却をお考えですか？
          </h2>
          <p className="text-blue-100 mb-8 leading-relaxed">
            相場データを確認したら、次は無料査定でより正確な価格をお確かめください。
            <br className="hidden md:block" />
            経験豊富なスタッフが丁寧にご対応いたします。
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="#contact"
              className="inline-block bg-[#ed8936] hover:bg-orange-500 text-white font-bold py-3 px-8 rounded-xl text-lg transition shadow-lg hover:shadow-xl"
            >
              無料査定を依頼する
            </a>
            <a
              href="tel:0120000000"
              className="inline-block bg-white/10 hover:bg-white/20 backdrop-blur text-white font-bold py-3 px-8 rounded-xl text-lg transition border border-white/30"
            >
              0120-000-000
            </a>
          </div>
        </div>
      </section>

      {/* SEO */}
      <section className="py-12 bg-white">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-xl font-bold mb-4 text-[#1a365d]">
            不動産相場ナビとは
          </h2>
          <div className="text-sm text-gray-600 space-y-3 leading-relaxed">
            <p>
              不動産相場ナビは、国土交通省が公開している不動産取引価格情報を活用した、日本最大級の不動産相場データベースです。2005年以降の全国47都道府県の取引事例を網羅し、マンション・戸建て・土地など物件種別ごとの相場情報を無料でご覧いただけます。
            </p>
            <p>
              不動産の売却をご検討中の方は、お持ちの物件があるエリアの過去の取引事例を確認することで、適切な売出価格の設定に役立ちます。購入をご検討中の方は、希望エリアの相場を事前に把握し、提示価格の妥当性を判断する材料としてご活用ください。
            </p>
            <p>
              不動産業者・投資家の方には、有料プランで20年分のデータへのアクセス、CSVダウンロード、トレンド分析など高度な機能をご用意しています。データドリブンな不動産取引を実現します。
            </p>
          </div>
        </div>
      </section>

      <LegalNotice />
      <Footer />
    </>
  );
}
