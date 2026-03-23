import Header from "@/components/Header";
import Footer from "@/components/Footer";
import LegalNotice from "@/components/LegalNotice";
import ContactForm from "@/components/ContactForm";
import { plans } from "@/lib/plans";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ご利用登録・お申し込み | 不動産相場ナビ",
  description:
    "不動産相場ナビの有料プランへのお申し込みページ。14日間の無料トライアルをお試しいただけます。",
};

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ plan?: string }>;
}) {
  const params = await searchParams;
  const selectedPlanKey = params.plan || "";

  // URLパラメータからプラン情報を取得
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
            下記フォームにご記入ください。担当者から2営業日以内にご連絡いたします。
          </p>
        </div>
      </section>

      {/* Form Section */}
      <section className="py-12 md:py-16 bg-slate-50">
        <div className="max-w-5xl mx-auto px-4">
          <div className="grid lg:grid-cols-5 gap-8">
            {/* Left: Form */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 md:p-8">
                <h2 className="text-xl font-bold text-slate-800 mb-6">お申し込みフォーム</h2>
                <ContactForm
                  showPlanSelect={true}
                  defaultPlan={selectedPlanKey}
                  showPhone={true}
                  showCompany={true}
                  formType="register"
                />
              </div>
            </div>

            {/* Right: Plan Summary + Trust */}
            <div className="lg:col-span-2 space-y-6">
              {/* Selected Plan */}
              {selectedPlan ? (
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
              ) : (
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
              )}

              {/* Trust Badges */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                <h3 className="text-sm font-bold text-slate-800 mb-4">安心のサポート体制</h3>
                <div className="space-y-3">
                  {[
                    { icon: "🔒", text: "SSL暗号化でデータを保護" },
                    { icon: "💬", text: "2営業日以内に担当者がご連絡" },
                    { icon: "🔄", text: "14日間無料トライアル付き" },
                    { icon: "✖️", text: "いつでも解約OK・解約手数料なし" },
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
        </div>
      </section>

      <LegalNotice />
      <Footer />
    </>
  );
}
