import Header from "@/components/Header";
import Footer from "@/components/Footer";
import LegalNotice from "@/components/LegalNotice";
import AccountContent from "@/app/account/AccountContent";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ログイン | 不動産相場ナビ",
  description: "不動産相場ナビにログインして、AI査定・相場検索などの機能をご利用ください。",
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return (
    <>
      <Header />

      <section className="bg-gradient-to-b from-[#0f172a] to-[#1e293b] text-white py-10 md:py-14">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
              <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold">ログイン</h1>
              <p className="text-slate-400 text-sm">登録済みのアカウントでサインイン</p>
            </div>
          </div>
        </div>
      </section>

      <AccountContent />

      <LegalNotice />
      <Footer />
    </>
  );
}
