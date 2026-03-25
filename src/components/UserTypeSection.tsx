import Link from "next/link";

const userTypes = [
  {
    type: "sell",
    title: "売りたい方",
    subtitle: "適正価格を知って、損しない売却を",
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 0h.008v.008h-.008V7.5z" />
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
    ctaSubLink: "mailto:info@next-aura.com",
    gradient: "from-blue-600 to-blue-800",
  },
  {
    type: "buy",
    title: "買いたい方",
    subtitle: "相場を知って、賢い物件選びを",
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
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
    ctaSubLink: "mailto:info@next-aura.com",
    gradient: "from-emerald-600 to-emerald-800",
  },
  {
    type: "pro",
    title: "不動産のプロの方",
    subtitle: "データドリブンな意思決定を",
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
      </svg>
    ),
    points: [
      "全国20年分の取引データにアクセス",
      "CSVダウンロードで自由に分析",
      "トレンド分析・エリア比較レポート",
    ],
    cta: "プロプランを見る",
    ctaLink: "/pricing",
    ctaSub: "API連携について相談",
    ctaSubLink: "mailto:info@next-aura.com",
    gradient: "from-violet-600 to-violet-800",
  },
];

export default function UserTypeSection() {
  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-800 mb-2">
            あなたの目的に合わせて
          </h2>
          <p className="text-slate-500 text-sm">
            売却・購入・プロ利用、それぞれに最適な機能を提供
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {userTypes.map((u) => (
            <div
              key={u.type}
              className="card-hover bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col"
            >
              <div className={`bg-gradient-to-br ${u.gradient} text-white p-6`}>
                <div className="opacity-90 mb-3">{u.icon}</div>
                <h3 className="text-xl font-bold">{u.title}</h3>
                <p className="text-sm opacity-80 mt-1">{u.subtitle}</p>
              </div>
              <div className="p-6 flex-1 flex flex-col">
                <ul className="space-y-3 mb-6 flex-1">
                  {u.points.map((p, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm">
                      <span className="inline-flex w-5 h-5 rounded-full bg-slate-100 text-slate-600 text-xs font-bold items-center justify-center shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      <span className="text-slate-600">{p}</span>
                    </li>
                  ))}
                </ul>
                <div className="space-y-2">
                  <Link
                    href={u.ctaLink}
                    className="block text-center py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold transition text-sm"
                  >
                    {u.cta}
                  </Link>
                  <a
                    href={u.ctaSubLink}
                    className="block text-center py-2 px-4 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-50 font-medium transition text-sm"
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
