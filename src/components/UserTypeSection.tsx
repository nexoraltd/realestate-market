import Link from "next/link";

const userTypes = [
  {
    type: "sell",
    title: "売りたい方",
    subtitle: "適正価格を知って、損しない売却を",
    icon: (
      <svg className="w-12 h-12" fill="none" viewBox="0 0 48 48" stroke="currentColor" strokeWidth={1.5}>
        <rect x="8" y="20" width="32" height="22" rx="2" />
        <path d="M4 22L24 6L44 22" />
        <circle cx="24" cy="32" r="5" />
        <path d="M24 30v4M22 32h4" />
      </svg>
    ),
    points: [
      "近隣の取引事例から適正価格を把握",
      "相場トレンドで売り時を判断",
      "無料査定で具体的な金額を確認",
    ],
    cta: "相場を調べる",
    ctaLink: "/search",
    ctaSub: "無料査定を依頼",
    ctaSubLink: "#contact",
    gradient: "from-blue-600 to-blue-800",
  },
  {
    type: "buy",
    title: "買いたい方",
    subtitle: "相場を知って、賢い物件選びを",
    icon: (
      <svg className="w-12 h-12" fill="none" viewBox="0 0 48 48" stroke="currentColor" strokeWidth={1.5}>
        <circle cx="20" cy="20" r="14" />
        <path d="M30 30L42 42" strokeWidth={3} strokeLinecap="round" />
        <rect x="14" y="16" width="12" height="8" rx="1" />
        <path d="M12 18L20 10L28 18" />
      </svg>
    ),
    points: [
      "希望エリアの相場を事前にチェック",
      "提示価格が妥当かどうかの判断材料",
      "エリア比較で穴場エリアを発見",
    ],
    cta: "エリアの相場を見る",
    ctaLink: "/search",
    ctaSub: "購入相談する",
    ctaSubLink: "#contact",
    gradient: "from-emerald-600 to-emerald-800",
  },
  {
    type: "pro",
    title: "不動産のプロの方",
    subtitle: "データドリブンな意思決定を",
    icon: (
      <svg className="w-12 h-12" fill="none" viewBox="0 0 48 48" stroke="currentColor" strokeWidth={1.5}>
        <rect x="6" y="6" width="36" height="36" rx="4" />
        <polyline points="12,34 20,22 28,26 36,14" />
        <circle cx="20" cy="22" r="2" fill="currentColor" />
        <circle cx="28" cy="26" r="2" fill="currentColor" />
        <circle cx="36" cy="14" r="2" fill="currentColor" />
      </svg>
    ),
    points: [
      "全国20年分の取引データにアクセス",
      "CSVダウンロードで自由に分析",
      "トレンド分析・エリア比較レポート",
    ],
    cta: "プロプランを見る",
    ctaLink: "#pricing",
    ctaSub: "API連携について相談",
    ctaSubLink: "#contact",
    gradient: "from-purple-600 to-purple-800",
  },
];

export default function UserTypeSection() {
  return (
    <section className="py-16 md:py-24">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-[#1a365d] mb-3">
            あなたの目的に合わせて
          </h2>
          <p className="text-gray-600">
            売却・購入・プロ利用、それぞれに最適な機能を提供
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {userTypes.map((u) => (
            <div
              key={u.type}
              className="bg-white rounded-2xl shadow-md hover:shadow-xl transition border border-gray-100 overflow-hidden flex flex-col"
            >
              <div className={`bg-gradient-to-br ${u.gradient} text-white p-6`}>
                <div className="opacity-90 mb-3">{u.icon}</div>
                <h3 className="text-xl font-bold">{u.title}</h3>
                <p className="text-sm opacity-80 mt-1">{u.subtitle}</p>
              </div>
              <div className="p-6 flex-1 flex flex-col">
                <ul className="space-y-3 mb-6 flex-1">
                  {u.points.map((p, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <span className="inline-block w-5 h-5 rounded-full bg-gray-100 text-[#1a365d] text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
                <div className="space-y-2">
                  <Link
                    href={u.ctaLink}
                    className="block text-center py-2.5 px-4 rounded-xl bg-[#1a365d] hover:bg-[#2b6cb0] text-white font-bold transition text-sm"
                  >
                    {u.cta}
                  </Link>
                  <a
                    href={u.ctaSubLink}
                    className="block text-center py-2 px-4 rounded-xl text-[#1a365d] hover:bg-gray-50 font-medium transition text-sm"
                  >
                    {u.ctaSub} &rarr;
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
