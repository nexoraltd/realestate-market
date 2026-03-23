import Header from "@/components/Header";
import Footer from "@/components/Footer";
import LegalNotice from "@/components/LegalNotice";
import DashboardContent from "./DashboardContent";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "マイページ | 不動産相場ナビ",
  description:
    "有料会員向けダッシュボード。取引データの検索・ダウンロード、トレンド分析、エリア比較レポートの生成が可能です。",
};

export default function DashboardPage() {
  return (
    <>
      <Header />

      {/* Hero */}
      <section className="bg-gradient-to-b from-[#0f172a] to-[#1e293b] text-white py-10 md:py-14">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
              <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold">マイページ</h1>
              <p className="text-slate-400 text-sm">データ分析ツール・レポートダウンロード</p>
            </div>
          </div>
        </div>
      </section>

      <DashboardContent />

      <LegalNotice />
      <Footer />
    </>
  );
}
