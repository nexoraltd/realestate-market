"use client";

const plans = [
  {
    name: "フリー",
    price: "0",
    unit: "円/月",
    desc: "まずは相場をチェック",
    features: [
      "都道府県別の相場サマリー",
      "直近1四半期のデータ閲覧",
      "取引事例 20件まで表示",
      "種別別グラフ",
    ],
    limited: [
      "詳細データ閲覧",
      "CSVダウンロード",
      "トレンド分析",
      "エリア比較",
    ],
    cta: "無料で始める",
    ctaLink: "/search",
    popular: false,
    color: "border-gray-200",
  },
  {
    name: "スタンダード",
    price: "2,980",
    unit: "円/月",
    desc: "不動産業者・投資家向け",
    features: [
      "全国の詳細取引データ",
      "過去20年分のデータ閲覧",
      "取引事例 無制限表示",
      "種別別グラフ",
      "CSVダウンロード (月100件)",
      "相場トレンド分析",
      "エリア比較レポート",
    ],
    limited: [],
    cta: "14日間無料で試す",
    ctaLink: "#contact",
    popular: true,
    color: "border-[#ed8936]",
  },
  {
    name: "プロフェッショナル",
    price: "9,800",
    unit: "円/月",
    desc: "法人・大量データ利用向け",
    features: [
      "スタンダードの全機能",
      "CSVダウンロード 無制限",
      "API連携",
      "カスタムレポート生成",
      "チームアカウント (5名)",
      "優先サポート",
    ],
    limited: [],
    cta: "お問い合わせ",
    ctaLink: "#contact",
    popular: false,
    color: "border-gray-200",
  },
];

export default function PricingSection() {
  return (
    <section id="pricing" className="py-16 md:py-24 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-[#1a365d] mb-3">
            料金プラン
          </h2>
          <p className="text-gray-600">
            目的に合わせて選べる3つのプラン
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative bg-white rounded-2xl border-2 ${plan.color} shadow-md hover:shadow-xl transition p-6 flex flex-col`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#ed8936] text-white text-xs font-bold px-4 py-1 rounded-full">
                  人気No.1
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-lg font-bold text-[#1a365d]">{plan.name}</h3>
                <p className="text-sm text-gray-500 mt-1">{plan.desc}</p>
              </div>

              <div className="mb-6">
                <span className="text-4xl font-extrabold text-[#1a365d]">
                  {plan.price}
                </span>
                <span className="text-sm text-gray-500 ml-1">{plan.unit}</span>
              </div>

              <ul className="space-y-2.5 mb-8 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <svg className="w-4 h-4 text-green-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>{f}</span>
                  </li>
                ))}
                {plan.limited.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-gray-400">
                    <svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M18 12H6" />
                    </svg>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              <a
                href={plan.ctaLink}
                className={`block text-center py-3 px-4 rounded-xl font-bold transition ${
                  plan.popular
                    ? "bg-[#ed8936] hover:bg-orange-500 text-white shadow-lg"
                    : "bg-gray-100 hover:bg-gray-200 text-[#1a365d]"
                }`}
              >
                {plan.cta}
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
