import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SearchForm from "@/components/SearchForm";

const features = [
  {
    icon: (
      <svg className="w-10 h-10" fill="none" viewBox="0 0 40 40" stroke="currentColor" strokeWidth="2">
        <path d="M8 32V16L20 6l12 10v16H8z" />
        <rect x="16" y="22" width="8" height="10" />
      </svg>
    ),
    title: "実際の取引価格データ",
    desc: "国土交通省が収集した2005年以降の不動産取引価格情報。売買の実勢価格がわかります。",
  },
  {
    icon: (
      <svg className="w-10 h-10" fill="none" viewBox="0 0 40 40" stroke="currentColor" strokeWidth="2">
        <polyline points="4,32 12,20 20,24 28,12 36,16" />
        <line x1="4" y1="36" x2="36" y2="36" />
        <line x1="4" y1="4" x2="4" y2="36" />
      </svg>
    ),
    title: "相場トレンドが一目瞭然",
    desc: "エリア別の取引価格をグラフで可視化。相場の上昇・下落傾向がすぐにわかります。",
  },
  {
    icon: (
      <svg className="w-10 h-10" fill="none" viewBox="0 0 40 40" stroke="currentColor" strokeWidth="2">
        <circle cx="20" cy="16" r="6" />
        <path d="M20 36C20 36 34 24 34 16a14 14 0 10-28 0c0 8 14 20 14 20z" />
      </svg>
    ),
    title: "エリア別に詳細検索",
    desc: "都道府県・市区町村を選んで、そのエリアの取引事例を確認。マンション・戸建て・土地の種類別に表示。",
  },
  {
    icon: (
      <svg className="w-10 h-10" fill="none" viewBox="0 0 40 40" stroke="currentColor" strokeWidth="2">
        <rect x="6" y="6" width="28" height="28" rx="3" />
        <path d="M6 14h28M14 14v20" />
      </svg>
    ),
    title: "完全無料・公的データ",
    desc: "国土交通省の公式データを利用。信頼性の高い情報を無料でご覧いただけます。",
  },
];

export default function Home() {
  return (
    <>
      <Header />

      {/* Hero */}
      <section className="bg-gradient-to-br from-[#1a365d] via-[#2b6cb0] to-[#2c5282] text-white">
        <div className="max-w-6xl mx-auto px-4 py-16 md:py-24">
          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-5xl font-extrabold mb-4 leading-tight">
              あなたのエリアの
              <br className="md:hidden" />
              不動産相場を
              <span className="text-[#ed8936]">無料</span>でチェック
            </h1>
            <p className="text-lg md:text-xl text-blue-100 max-w-2xl mx-auto">
              国土交通省の公的データに基づく取引価格情報。
              <br className="hidden md:block" />
              売却・購入の第一歩は、正確な相場を知ることから。
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 md:p-8">
            <SearchForm />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 md:py-20">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-12 text-[#1a365d]">
            不動産相場ナビの特徴
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => (
              <div
                key={i}
                className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition border border-gray-100"
              >
                <div className="text-[#2b6cb0] mb-4">{f.icon}</div>
                <h3 className="font-bold text-lg mb-2">{f.title}</h3>
                <p className="text-sm text-gray-600">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#fdf2e9] py-16">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4 text-[#1a365d]">
            売却をお考えですか？
          </h2>
          <p className="text-gray-600 mb-8">
            相場データを確認したら、次は無料査定でより正確な価格をお確かめください。
            <br />
            経験豊富なスタッフが丁寧にご対応いたします。
          </p>
          <a
            href="#contact"
            className="inline-block bg-[#ed8936] hover:bg-orange-500 text-white font-bold py-3 px-8 rounded-xl text-lg transition shadow-lg hover:shadow-xl"
          >
            無料査定を依頼する
          </a>
        </div>
      </section>

      {/* SEO Text */}
      <section className="py-12">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-xl font-bold mb-4 text-[#1a365d]">
            不動産売却・購入の参考に
          </h2>
          <div className="text-sm text-gray-600 space-y-3 leading-relaxed">
            <p>
              不動産相場ナビでは、国土交通省が公開している不動産取引価格情報をもとに、全国の不動産売買の実勢価格をご覧いただけます。マンション、戸建て、土地など、物件種別ごとの取引事例を都道府県・市区町村単位で検索できます。
            </p>
            <p>
              不動産の売却をご検討中の方は、まずお持ちの物件があるエリアの相場をご確認ください。近隣の類似物件がどのような価格で取引されているかを知ることで、適切な売出価格の設定に役立ちます。
            </p>
            <p>
              購入をご検討中の方は、希望エリアの相場を事前に把握することで、物件探しがより効率的になります。提示価格が相場と比べて妥当かどうかの判断材料としてもご活用ください。
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
