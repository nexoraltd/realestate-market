import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SearchForm from "@/components/SearchForm";
import LegalNotice from "@/components/LegalNotice";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "不動産を買いたい方 | 不動産相場ナビ",
  description: "購入をお考えの方へ。希望エリアの相場を把握して、賢い物件選びを。エリア別の取引データで適正価格がわかります。",
  alternates: { canonical: "/buy" },
  openGraph: {
    title: "不動産を買いたい方 | 不動産相場ナビ",
    description: "希望エリアの実際の取引価格をチェック。データに基づいた判断で、納得の住まい探しを。",
    url: "/buy",
    images: [{ url: "/api/og-default", width: 1200, height: 630 }],
  },
  twitter: { card: "summary_large_image" },
};

const tips = [
  {
    title: "相場を知らないと損をする",
    desc: "提示価格だけで判断すると、相場より高い買い物になることも。過去の取引データと比較して、適正価格かどうかを見極めましょう。",
    icon: "⚠️",
  },
  {
    title: "エリア比較で穴場を発見",
    desc: "人気エリアの隣接地域は、利便性は同等なのに相場が2-3割安いことも。データで穴場エリアを見つけましょう。",
    icon: "🔍",
  },
  {
    title: "トレンドで将来性を判断",
    desc: "過去数年の価格推移を見れば、エリアの将来性が見えてきます。値上がり傾向のエリアは資産価値の面でも有利です。",
    icon: "📈",
  },
];

const areaCategories = [
  {
    label: "ファミリー向け",
    areas: [
      { code: "11", name: "埼玉県", note: "広い物件が手頃" },
      { code: "12", name: "千葉県", note: "新築マンション豊富" },
      { code: "14", name: "神奈川県", note: "教育環境充実" },
    ],
  },
  {
    label: "都心アクセス重視",
    areas: [
      { code: "13", name: "東京都", note: "利便性No.1" },
      { code: "27", name: "大阪府", note: "西日本の中心" },
      { code: "23", name: "愛知県", note: "中部圏の要" },
    ],
  },
  {
    label: "コスパ重視",
    areas: [
      { code: "40", name: "福岡県", note: "成長都市" },
      { code: "04", name: "宮城県", note: "東北の中心" },
      { code: "34", name: "広島県", note: "中四国の拠点" },
    ],
  },
];

export default function BuyPage() {
  return (
    <>
      <Header />

      {/* Hero */}
      <section className="bg-gradient-to-br from-emerald-700 to-emerald-900 text-white py-16 md:py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-5xl font-extrabold mb-4 leading-tight">
            相場を知って、
            <br className="md:hidden" />
            <span className="text-emerald-300">賢い</span>物件選びを
          </h1>
          <p className="text-emerald-100 text-lg mb-10 max-w-2xl mx-auto">
            希望エリアの実際の取引価格をチェック。データに基づいた判断で、納得のいく住まい探しを。
          </p>
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 max-w-2xl mx-auto">
            <p className="text-sm text-emerald-200 mb-3">希望エリアの相場を検索</p>
            <SearchForm />
          </div>
        </div>
      </section>

      {/* Tips */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-center text-[#1a365d] mb-12">
            購入前に知っておきたいこと
          </h2>
          <div className="space-y-6">
            {tips.map((t) => (
              <div
                key={t.title}
                className="bg-gray-50 rounded-xl p-6 border border-gray-100 flex items-start gap-4"
              >
                <span className="text-3xl">{t.icon}</span>
                <div>
                  <h3 className="font-bold text-lg mb-1">{t.title}</h3>
                  <p className="text-sm text-gray-600">{t.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Area suggestions */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-center text-[#1a365d] mb-12">
            目的別おすすめエリア
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {areaCategories.map((cat) => (
              <div key={cat.label} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                <h3 className="font-bold text-[#1a365d] mb-4 pb-2 border-b">
                  {cat.label}
                </h3>
                <ul className="space-y-3">
                  {cat.areas.map((a) => (
                    <li key={a.code}>
                      <a
                        href={`/search?area=${a.code}&year=2024&quarter=4`}
                        className="flex items-center justify-between hover:bg-gray-50 rounded-lg p-2 -m-2 transition"
                      >
                        <span className="font-medium">{a.name}</span>
                        <span className="text-xs text-gray-500">{a.note}</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-emerald-50 py-16" id="contact">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4 text-[#1a365d]">
            購入のご相談はお気軽に
          </h2>
          <p className="text-gray-600 mb-8">
            相場データを確認したら、物件探しのプロにご相談ください。
            <br />
            ご希望の条件に合った物件をお探しします。
          </p>
          <a
            href="mailto:info@next-aura.com"
            className="inline-block bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 px-10 rounded-xl text-lg transition shadow-lg"
          >
            info@next-aura.com にメール
          </a>
        </div>
      </section>

      <LegalNotice />
      <Footer />
    </>
  );
}
