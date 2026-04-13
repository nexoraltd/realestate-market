import Header from "@/components/Header";
import Footer from "@/components/Footer";
import LegalNotice from "@/components/LegalNotice";
import FreeRegisterForm from "@/components/FreeRegisterForm";
import { plans } from "@/lib/plans";
import Link from "next/link";
import type { Metadata } from "next";
import CheckoutButton from "@/components/CheckoutButton";

export const metadata: Metadata = {
  title: "ご利用登録・お申し込み | 不動産相場ナビ",
  description:
    "不動産相場ナビの有料プランへのお申し込みページ。14日間の無料トライアルをお試しいただけます。",
};

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ plan?: string; interval?: string }>;
}) {
  const params = await searchParams;
  const selectedPlanKey = params.plan || "";
  const isYearly = params.interval === "yearly";

  const planMap: Record<string, (typeof plans)[number]> = {
    standard: plans[1],
    professional: plans[2],
  };
  const selectedPlan = planMap[selectedPlanKey] || null;

  return (
    <>
      <Header />

      {/* Hero */}
      <section className="bg-gradient-to-b from-[#0f172a] to-[#1e293b] text-white py-12 md:py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-4xl font-extrabold mb-3 leading-tight">
            ご利用登録・お申し込み
          </h1>
          <p className="text-slate-400 text-base">
            {selectedPlanKey === "free"
              ? "メールアドレスの登録だけで、すぐにご利用いただけます。"
              : "クレジットカードで即時開通。14日間は無料でお試しいただけます。"}
          </p>
        </div>
      </section>

      {/* Plan Selection / Checkout */}
      <section className="py-12 md:py-16 bg-slate-50">
        <div className="max-w-4xl mx-auto px-4">
          {selectedPlanKey === "free" ? (
            <div className="max-w-md mx-auto">
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 md:p-8">
                <h2 className="text-xl font-bold text-slate-800 mb-2">無料会員登録</h2>
                <p className="text-sm text-slate-500 mb-6">
                  メールアドレスとパスワードを入力して登録してください。クレジットカードは不要です。
                </p>
                <div className="bg-slate-50 rounded-xl p-4 mb-6 border border-slate-100">
                  <p className="text-xs text-slate-500 mb-2 font-medium">無料プランに含まれる機能</p>
                  <ul className="space-y-1.5 text-sm text-slate-700">
                    <li className="flex items-center gap-2"><span className="text-emerald-500">&#10003;</span>AI査定 月1回（10年予測+スコア内訳付き）</li>
                    <li className="flex items-center gap-2"><span className="text-emerald-500">&#10003;</span>相場検索 月3回</li>
                    <li className="flex items-center gap-2"><span className="text-emerald-500">&#10003;</span>取引事例 5件まで表示</li>
                  </ul>
                </div>
                <FreeRegisterForm dark={false} />
              </div>
            </div>
          ) : selectedPlan ? (
            <div className="grid lg:grid-cols-5 gap-8">
              {/* Left: Checkout */}
              <div className="lg:col-span-3">
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 md:p-8">
                  <h2 className="text-xl font-bold text-slate-800 mb-2">お申し込み確認</h2>
                  <p className="text-sm text-slate-500 mb-6">
                    「お申し込みへ進む」をクリックするとStripeの決済ページに移動します。
                  </p>

                  <div className="bg-slate-50 rounded-xl p-4 mb-6 border border-slate-100">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-bold text-slate-800">{selectedPlan.name}プラン</p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {selectedPlan.desc} — {isYearly ? "年額払い" : "月額払い"}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-2xl font-extrabold text-slate-800">
                          {isYearly ? selectedPlan.yearlyPrice : selectedPlan.price}
                        </span>
                        <span className="text-xs text-slate-500 ml-1">
                          {isYearly ? "円/年" : "円/月"}
                        </span>
                        {isYearly && (
                          <p className="text-[10px] text-emerald-600 font-medium mt-0.5">20%OFF</p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-emerald-600 bg-emerald-50 rounded-lg px-4 py-3 mb-6">
                    <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>最初の14日間は無料。いつでもキャンセル可能。</span>
                  </div>

                  <CheckoutButton plan={selectedPlanKey} interval={isYearly ? "yearly" : "monthly"} />

                  <p className="text-xs text-slate-400 text-center mt-4">
                    決済はStripeで安全に処理されます。カード情報は当サイトに保存されません。
                  </p>
                </div>
              </div>

              {/* Right: Plan Summary + Trust */}
              <div className="lg:col-span-2 space-y-6">
                <div className={`bg-white rounded-2xl shadow-sm border-2 p-6 ${selectedPlan.popular ? "border-amber-400" : "border-slate-100"}`}>
                  {selectedPlan.popular && (
                    <span className="inline-block bg-gradient-to-r from-amber-400 to-orange-500 text-white text-xs font-bold px-3 py-0.5 rounded-full mb-3">
                      人気No.1
                    </span>
                  )}
                  <h3 className="text-lg font-bold text-slate-800 mb-1">{selectedPlan.name}プラン</h3>
                  <div className="mb-4">
                    <span className="text-3xl font-extrabold text-slate-800">{selectedPlan.price}</span>
                    <span className="text-sm text-slate-500 ml-1">{selectedPlan.unit}</span>
                  </div>
                  <ul className="space-y-2">
                    {selectedPlan.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm">
                        <svg className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-slate-700">{f}</span>
                      </li>
                    ))}
                  </ul>
                  <Link
                    href="/pricing"
                    className="block text-center text-sm text-amber-600 hover:text-amber-700 font-medium mt-4 transition"
                  >
                    プランを比較する →
                  </Link>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                  <h3 className="text-sm font-bold text-slate-800 mb-4">安心のサポート体制</h3>
                  <div className="space-y-3">
                    {[
                      { icon: "🔒", text: "SSL暗号化・Stripe決済で安全" },
                      { icon: "🔄", text: "14日間無料トライアル付き" },
                      { icon: "✖️", text: "いつでも解約OK・解約手数料なし" },
                      { icon: "💬", text: "メールサポート対応" },
                    ].map((item) => (
                      <div key={item.text} className="flex items-center gap-3 text-sm">
                        <span className="text-lg">{item.icon}</span>
                        <span className="text-slate-600">{item.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="max-w-lg mx-auto">
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                <h3 className="text-lg font-bold text-slate-800 mb-3">プランを選んでください</h3>
                <div className="space-y-3">
                  {plans.filter(p => p.price !== "0").map((plan) => (
                    <Link
                      key={plan.name}
                      href={`/register?plan=${plan.name === "スタンダード" ? "standard" : "professional"}`}
                      className={`block p-4 rounded-xl border-2 transition hover:border-amber-400 ${
                        plan.popular ? "border-amber-300 bg-amber-50/50" : "border-slate-100"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-bold text-slate-800">{plan.name}</span>
                          {plan.popular && (
                            <span className="ml-2 text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-bold">人気</span>
                          )}
                        </div>
                        <span className="font-bold text-slate-800">{plan.price}<span className="text-xs text-slate-500">円/月</span></span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">{plan.desc}</p>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      <LegalNotice />
      <Footer />
    </>
  );
}
