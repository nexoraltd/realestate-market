"use client";

import { useTier } from "@/hooks/useTier";

export default function SearchPageCta() {
  const { tier, loading } = useTier();
  if (loading) return null;
  if (tier === "standard" || tier === "professional") return null;

  return (
    <section className="bg-gradient-to-b from-[#fdf2e9] to-white py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl border-2 border-amber-400 p-6 text-center shadow-lg">
            <div className="inline-flex items-center gap-1.5 bg-amber-100 text-amber-700 text-xs font-bold px-3 py-1 rounded-full mb-4">
              14日間無料トライアル
            </div>
            <h2 className="text-lg font-bold text-[#1a365d] mb-2">
              もっと詳しいデータで分析
            </h2>
            <p className="text-gray-600 text-sm mb-4">
              CSV一括ダウンロード・価格トレンド・無制限検索で、データに基づく意思決定を。
            </p>
            <a
              href="/register?plan=standard&interval=monthly"
              className="inline-block bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 px-8 rounded-xl transition shadow-lg w-full"
            >
              スタンダード（¥2,980/月）を無料で試す
            </a>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 p-6 text-center shadow">
            <div className="inline-flex items-center gap-1.5 bg-emerald-100 text-emerald-700 text-xs font-bold px-3 py-1 rounded-full mb-4">
              無料・登録不要
            </div>
            <h2 className="text-lg font-bold text-[#1a365d] mb-2">
              AIで物件価格を査定
            </h2>
            <p className="text-gray-600 text-sm mb-4">
              エリア・面積・築年数を入力するだけ。国交省データから推定価格をAIが即算出。
            </p>
            <a
              href="/estimate"
              className="inline-block bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 px-8 rounded-xl transition shadow-lg w-full"
            >
              無料AI査定を試す
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
