import { Suspense } from "react";
import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SearchForm from "@/components/SearchForm";
import LegalNotice from "@/components/LegalNotice";
import ReportCheckoutButton from "@/components/ReportCheckoutButton";
import SearchResults from "./SearchResults";

interface SearchPageProps {
  searchParams: Promise<{ prefecture?: string; city?: string; type?: string }>
}

async function getAreaLabel(searchParams: SearchPageProps['searchParams']) {
  const params = await searchParams
  const { prefecture, city } = params
  return city ? `${prefecture ?? ''}${city}` : prefecture ?? ''
}

export async function generateMetadata({ searchParams }: SearchPageProps): Promise<Metadata> {
  const params = await searchParams
  const { prefecture, city } = params

  const areaLabel = city ? `${prefecture}${city}` : prefecture ?? 'エリア'
  const title = `${areaLabel}の不動産相場 | 不動産相場ナビ`
  const description = `${areaLabel}の不動産取引価格・相場情報。マンション・一戸建て・土地の売買実績データを無料で検索。`

  return {
    title,
    description,
    openGraph: {
      title: `📍 ${areaLabel}の不動産相場 | 不動産相場ナビ`,
      description,
    },
    twitter: {
      card: 'summary',
      title: `📍 ${areaLabel}の不動産相場 | 不動産相場ナビ`,
      description,
    },
    alternates: {
      canonical: `https://market.next-aura.com/search${prefecture ? `?prefecture=${encodeURIComponent(prefecture)}` : ''}`,
    },
  }
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const areaLabel = await getAreaLabel(searchParams)
  const params = await searchParams
  const areaParam = params.city || params.prefecture || ''

  return (
    <>
      <Header />
      <div className="bg-[#1a365d] text-white py-6">
        <div className="max-w-6xl mx-auto px-4">
          <h1 className="text-xl font-bold mb-4">不動産相場検索</h1>
          <SearchForm compact />
        </div>
      </div>
      <main className="max-w-6xl mx-auto px-4 py-8">
        <Suspense
          fallback={
            <div className="text-center py-20">
              <div className="inline-block w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
              <p className="mt-4 text-gray-500">データを読み込み中...</p>
            </div>
          }
        >
          <SearchResults />
        </Suspense>
      </main>

      {/* レポート単品購入 バナー（フルリード訴求） */}
      {areaParam && (
        <section className="bg-amber-50 border-y-2 border-amber-300 py-8">
          <div className="max-w-4xl mx-auto px-4">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex-1 text-center md:text-left">
                <p className="text-xs font-bold text-amber-700 uppercase tracking-wider mb-1">
                  📊 {areaLabel || 'このエリア'} 限定レポート
                </p>
                <h2 className="text-xl md:text-2xl font-bold text-slate-900 mb-1">
                  {areaLabel ? `${areaLabel}の詳細相場レポート` : 'エリア詳細レポート'} <span className="text-amber-600">¥980</span>
                </h2>
                <p className="text-sm text-slate-700">
                  5年間の取引データ・種別別推移・面積帯別相場を1枚にまとめて即ダウンロード
                </p>
              </div>
              <ReportCheckoutButton area={areaParam} areaName={areaLabel || areaParam} />
            </div>
          </div>
        </section>
      )}

      {/* CTA: 有料プラン + AI査定 */}
      <section className="bg-gradient-to-b from-[#fdf2e9] to-white py-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-6">
            {/* 有料プラン（直リンに変更） */}
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
            {/* AI査定 */}
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

      <LegalNotice />
      <Footer />
    </>
  );
}
