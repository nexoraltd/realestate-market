import Header from "@/components/Header";
import Footer from "@/components/Footer";
import LegalNotice from "@/components/LegalNotice";
import ContactForm from "@/components/ContactForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "お問い合わせ・無料査定相談 | 不動産相場ナビ",
  description:
    "不動産の売却・購入に関するご相談、無料査定のお申し込みはこちら。経験豊富なスタッフが丁寧に対応いたします。",
};

export default function ContactPage() {
  return (
    <>
      <Header />

      {/* Hero */}
      <section className="bg-gradient-to-b from-[#0f172a] to-[#1e293b] text-white py-12 md:py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-4xl font-extrabold mb-3 leading-tight">
            お問い合わせ・無料査定相談
          </h1>
          <p className="text-slate-400 text-base">
            不動産の売却・購入に関するご相談はお気軽にどうぞ。
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
                <h2 className="text-xl font-bold text-slate-800 mb-6">お問い合わせフォーム</h2>
                <ContactForm
                  showPlanSelect={false}
                  showPhone={true}
                  showCompany={false}
                  formType="contact"
                />
              </div>
            </div>

            {/* Right: Contact Info */}
            <div className="lg:col-span-2 space-y-6">
              {/* Contact Info Card */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                <h3 className="text-lg font-bold text-slate-800 mb-4">お問い合わせ先</h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
                      <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-800">メール</p>
                      <a href="mailto:info@next-aura.com" className="text-sm text-amber-600 hover:text-amber-700 transition">
                        info@next-aura.com
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0">
                      <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-800">回答目安</p>
                      <p className="text-sm text-slate-600">2営業日以内にご返信</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Company Info */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                <h3 className="text-sm font-bold text-slate-800 mb-3">運営会社</h3>
                <div className="space-y-2 text-sm text-slate-600">
                  <div className="flex justify-between">
                    <span className="text-slate-500">会社名</span>
                    <span className="font-medium">Nexora合同会社</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">サービス</span>
                    <span className="font-medium">不動産相場ナビ</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">メール</span>
                    <span className="font-medium">info@next-aura.com</span>
                  </div>
                </div>
              </div>

              {/* Quick Links */}
              <div className="bg-slate-800 rounded-2xl p-6 text-white">
                <h3 className="text-sm font-bold mb-3">こちらもご覧ください</h3>
                <div className="space-y-2">
                  {[
                    { href: "/pricing", label: "料金プランを見る" },
                    { href: "/search", label: "まずは無料で相場を検索" },
                    { href: "/sell", label: "売却をお考えの方" },
                    { href: "/buy", label: "購入をお考えの方" },
                  ].map((link) => (
                    <a
                      key={link.href}
                      href={link.href}
                      className="flex items-center justify-between text-sm text-slate-300 hover:text-white transition py-1"
                    >
                      <span>{link.label}</span>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </a>
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
