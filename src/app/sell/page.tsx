import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SearchForm from "@/components/SearchForm";
import LegalNotice from "@/components/LegalNotice";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "不動産を売りたい方 | 不動産相場ナビ",
  description: "売却をお考えの方へ。エリアの相場データを確認して、適正価格での売却を実現しましょう。無料査定も受付中。",
  alternates: { canonical: "/sell" },
  openGraph: {
    title: "不動産を売りたい方 | 不動産相場ナビ",
    description: "データに基づく適正価格で、損しない売却を。エリアの取引事例を無料で確認。",
    url: "/sell",
    images: [{ url: "/api/og-default", width: 1200, height: 630 }],
  },
  twitter: { card: "summary_large_image" },
};

const steps = [
  {
    num: "1",
    title: "エリアの相場を調べる",
    desc: "地図または検索フォームから、お持ちの物件があるエリアの取引価格データを確認します。",
  },
  {
    num: "2",
    title: "類似物件と比較する",
    desc: "同じエリア・同じ種別の取引事例を確認し、お持ちの物件の大まかな価値を把握します。",
  },
  {
    num: "3",
    title: "無料査定を依頼する",
    desc: "相場を把握したら、プロによる無料査定でより正確な金額を確認しましょう。",
  },
];

const reasons = [
  {
    title: "データに基づく適正価格",
    desc: "国土交通省の公的データで近隣の取引事例を確認。根拠のある価格設定ができます。",
    icon: "📊",
  },
  {
    title: "相場トレンドで売り時を判断",
    desc: "エリアの価格推移を把握し、高値で売却できるタイミングを見極めます。",
    icon: "📈",
  },
  {
    title: "経験豊富なスタッフがサポート",
    desc: "データだけでなく、売却のプロが最適な戦略をご提案。安心してお任せください。",
    icon: "🤝",
  },
];

export default function SellPage() {
  return (
    <>
      <Header />

      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-700 to-blue-900 text-white py-16 md:py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-5xl font-extrabold mb-4 leading-tight">
            あなたの不動産、
            <br className="md:hidden" />
            <span className="text-[#ed8936]">いくら</span>で売れる？
          </h1>
          <p className="text-blue-100 text-lg mb-10 max-w-2xl mx-auto">
            まずは近隣の取引事例をチェック。データに基づいた適正価格で、損しない売却を。
          </p>
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 max-w-2xl mx-auto">
            <p className="text-sm text-blue-200 mb-3">お持ちの物件のエリアを選択</p>
            <SearchForm />
          </div>
        </div>
      </section>

      {/* Steps */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-center text-[#1a365d] mb-12">
            売却までの3ステップ
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((s) => (
              <div key={s.num} className="text-center">
                <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-[#1a365d] text-white flex items-center justify-center text-2xl font-extrabold">
                  {s.num}
                </div>
                <h3 className="font-bold text-lg mb-2">{s.title}</h3>
                <p className="text-sm text-gray-600">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Reasons */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-center text-[#1a365d] mb-12">
            不動産相場ナビで売却するメリット
          </h2>
          <div className="space-y-6">
            {reasons.map((r) => (
              <div
                key={r.title}
                className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex items-start gap-4"
              >
                <span className="text-3xl">{r.icon}</span>
                <div>
                  <h3 className="font-bold text-lg mb-1">{r.title}</h3>
                  <p className="text-sm text-gray-600">{r.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#fdf2e9] py-16" id="contact">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4 text-[#1a365d]">
            まずは無料査定から
          </h2>
          <p className="text-gray-600 mb-8">
            相場データを確認したら、次はプロによる無料査定をご利用ください。
            <br />
            最短即日でお見積りをお出しします。
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="mailto:info@next-aura.com"
              className="inline-block bg-[#ed8936] hover:bg-orange-500 text-white font-bold py-4 px-10 rounded-xl text-lg transition shadow-lg"
            >
              info@next-aura.com にメール
            </a>
          </div>
        </div>
      </section>

      <LegalNotice />
      <Footer />
    </>
  );
}
