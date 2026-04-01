import Header from "@/components/Header";
import Footer from "@/components/Footer";
import LegalNotice from "@/components/LegalNotice";
import { featureComparison } from "@/lib/plans";
import PricingCards from "@/components/PricingCards";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "料金プラン | 不動産相場ナビ",
  description:
    "不動産相場ナビの料金プラン。無料プランから法人向けプロプランまで、目的に合わせてお選びいただけます。",
  alternates: { canonical: "/pricing" },
  openGraph: {
    title: "料金プラン | 不動産相場ナビ",
    description: "無料で始められる不動産データプラットフォーム。スタンダード2,980円/月、プロ6,800円/月。年額20%OFF。",
    url: "/pricing",
    images: [{ url: "/api/og-default", width: 1200, height: 630 }],
  },
  twitter: { card: "summary_large_image" },
};

const faqs = [
  {
    q: "無料プランで何ができますか？",
    a: "都道府県別の相場サマリー、直近1四半期のデータ閲覧、取引事例5件までの表示が可能です。まずは無料でお試しください。",
  },
  {
    q: "プランの変更はいつでもできますか？",
    a: "はい、いつでもプランの変更が可能です。アップグレードは即時適用、ダウングレードは次回更新日から適用されます。",
  },
  {
    q: "支払い方法は何がありますか？",
    a: "クレジットカード（Visa / Mastercard / AMEX）および銀行振込に対応しております。法人のお客様は請求書払いも可能です。",
  },
  {
    q: "14日間無料トライアルとは？",
    a: "スタンダードプランの全機能を14日間無料でお試しいただけます。トライアル期間中の解約は無料で、料金は発生しません。",
  },
  {
    q: "解約はいつでもできますか？",
    a: "はい、いつでも解約可能です。解約後は当月末まで有料機能をご利用いただけます。解約手数料はかかりません。",
  },
  {
    q: "法人契約は可能ですか？",
    a: "はい、法人契約に対応しております。プロフェッショナルプランでは請求書払い・チームアカウントもご利用いただけます。詳しくはお問い合わせください。",
  },
];

function CheckIcon() {
  return (
    <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

function CrossIcon() {
  return (
    <svg className="w-5 h-5 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M18 12H6" />
    </svg>
  );
}

function renderCell(value: boolean | string) {
  if (value === true) return <CheckIcon />;
  if (value === false) return <CrossIcon />;
  return <span className="text-sm font-medium text-slate-700">{value}</span>;
}

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Product",
      name: "不動産相場ナビ スタンダードプラン",
      description: "全国の詳細取引データ、過去20年分のデータ閲覧、CSVダウンロード、相場トレンド分析が利用可能。",
      brand: { "@type": "Organization", name: "ネクソラ不動産" },
      offers: [
        {
          "@type": "Offer",
          price: "2980",
          priceCurrency: "JPY",
          priceValidUntil: "2027-12-31",
          availability: "https://schema.org/InStock",
          url: "https://market.next-aura.com/register?plan=standard",
        },
        {
          "@type": "Offer",
          price: "28600",
          priceCurrency: "JPY",
          priceValidUntil: "2027-12-31",
          availability: "https://schema.org/InStock",
          url: "https://market.next-aura.com/register?plan=standard&interval=yearly",
          description: "年額プラン（20%OFF）",
        },
      ],
    },
    {
      "@type": "FAQPage",
      mainEntity: faqs.map((faq) => ({
        "@type": "Question",
        name: faq.q,
        acceptedAnswer: { "@type": "Answer", text: faq.a },
      })),
    },
  ],
};

export default function PricingPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Header />

      {/* Hero */}
      <section className="bg-gradient-to-b from-[#0f172a] via-[#1e293b] to-[#0f172a] text-white py-16 md:py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-5xl font-extrabold mb-4 leading-tight">
            目的に合わせた<span className="gradient-text">料金プラン</span>
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            無料プランですぐに始められます。より詳細なデータが必要な方は有料プランをお選びください。
          </p>
        </div>
      </section>

      {/* Plan Cards */}
      <section className="py-16 bg-slate-50 -mt-8">
        <div className="max-w-5xl mx-auto px-4">
          <PricingCards />
        </div>
      </section>

      {/* Feature Comparison */}
      <section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-center text-slate-800 mb-10">
            機能比較
          </h2>
          <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-sm">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-800 text-white">
                  <th className="px-6 py-4 text-left text-sm font-bold">機能</th>
                  <th className="px-6 py-4 text-center text-sm font-bold">フリー</th>
                  <th className="px-6 py-4 text-center text-sm font-bold">
                    <span className="inline-block bg-amber-500 text-xs px-2 py-0.5 rounded-full mr-1">人気</span>
                    スタンダード
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-bold">プロフェッショナル</th>
                </tr>
              </thead>
              <tbody>
                {featureComparison.map((row, i) => (
                  <tr key={row.feature} className={i % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                    <td className="px-6 py-3.5 text-sm text-slate-700 font-medium">{row.feature}</td>
                    <td className="px-6 py-3.5 text-center">
                      <div className="flex justify-center">{renderCell(row.free)}</div>
                    </td>
                    <td className="px-6 py-3.5 text-center bg-amber-50/30">
                      <div className="flex justify-center">{renderCell(row.standard)}</div>
                    </td>
                    <td className="px-6 py-3.5 text-center">
                      <div className="flex justify-center">{renderCell(row.pro)}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-center text-slate-800 mb-10">
            よくある質問
          </h2>
          <div className="space-y-3">
            {faqs.map((faq) => (
              <details
                key={faq.q}
                className="group bg-white rounded-xl border border-slate-200 overflow-hidden"
              >
                <summary className="px-6 py-4 cursor-pointer flex items-center justify-between text-sm font-bold text-slate-800 hover:bg-slate-50 transition list-none">
                  <span>{faq.q}</span>
                  <svg
                    className="w-5 h-5 text-slate-400 group-open:rotate-180 transition-transform shrink-0 ml-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div className="px-6 pb-4 text-sm text-slate-600 leading-relaxed">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
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
            まずは14日間、無料で試してみませんか？
          </h2>
          <p className="text-slate-300 mb-8 leading-relaxed">
            スタンダードプランの全機能を14日間無料でお試しいただけます。
            <br className="hidden md:block" />
            クレジットカード不要。いつでもキャンセル可能です。
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register?plan=standard"
              className="inline-block bg-amber-500 hover:bg-amber-600 text-white font-bold py-3.5 px-8 rounded-xl text-lg transition shadow-lg hover:shadow-xl animate-pulse-glow"
            >
              無料トライアルを始める
            </Link>
            <a
              href="mailto:info@next-aura.com"
              className="inline-block glass hover:bg-white/10 text-white font-bold py-3.5 px-8 rounded-xl text-lg transition"
            >
              お問い合わせ
            </a>
          </div>
        </div>
      </section>

      <LegalNotice />
      <Footer />
    </>
  );
}
