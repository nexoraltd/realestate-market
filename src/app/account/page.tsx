import Header from "@/components/Header";
import Footer from "@/components/Footer";
import LegalNotice from "@/components/LegalNotice";
import AccountContent from "./AccountContent";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "アカウント管理 | 不動産相場ナビ",
  description:
    "サブスクリプションの確認・プラン変更・解約はこちらから。",
};

export default function AccountPage() {
  return (
    <>
      <Header />

      <section className="bg-gradient-to-b from-[#0f172a] to-[#1e293b] text-white py-10 md:py-14">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
              <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold">アカウント管理</h1>
              <p className="text-slate-400 text-sm">プラン確認・変更・解約</p>
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
