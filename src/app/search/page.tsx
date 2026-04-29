import { Suspense } from "react";
import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SearchForm from "@/components/SearchForm";
import LegalNotice from "@/components/LegalNotice";
import ReportCheckoutButton from "@/components/ReportCheckoutButton";
import SearchPageCta from "@/components/SearchPageCta";
import SearchResults from "./SearchResults";
import { PREFECTURES } from "@/lib/prefectures";

interface SearchPageProps {
  searchParams: Promise<{ area?: string; city?: string; type?: string }>
}

async function resolveCityName(prefCode: string, cityCode: string): Promise<string> {
  try {
    const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://market.next-aura.com'
    const res = await fetch(`${base}/api/cities?area=${prefCode}`, { next: { revalidate: 86400 } })
    if (!res.ok) return cityCode
    const cities: { id: string; name: string }[] = await res.json()
    return cities.find((c) => c.id === cityCode)?.name ?? cityCode
  } catch {
    return cityCode
  }
}

async function getAreaLabel(searchParams: SearchPageProps['searchParams']) {
  const params = await searchParams
  const { area, city } = params
  const prefName = PREFECTURES.find((p) => p.code === area)?.name ?? area ?? ''
  if (!city) return prefName
  const cityName = await resolveCityName(area ?? '', city)
  return `${prefName} ${cityName}`
}

export async function generateMetadata({ searchParams }: SearchPageProps): Promise<Metadata> {
  const areaLabel = await getAreaLabel(searchParams)
  const params = await searchParams
  const { area } = params

  const label = areaLabel || 'エリア'
  const title = `${label}の不動産相場 | 不動産相場ナビ`
  const description = `${label}の不動産取引価格・相場情報。マンション・一戸建て・土地の売買実績データを無料で検索。`

  return {
    title,
    description,
    openGraph: {
      title: `📍 ${label}の不動産相場 | 不動産相場ナビ`,
      description,
    },
    twitter: {
      card: 'summary',
      title: `📍 ${label}の不動産相場 | 不動産相場ナビ`,
      description,
    },
    alternates: {
      canonical: `https://market.next-aura.com/search${area ? `?area=${encodeURIComponent(area)}` : ''}`,
    },
  }
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const areaLabel = await getAreaLabel(searchParams)
  const params = await searchParams
  const areaParam = params.city || params.area || ''

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

      {/* CTA: 有料プラン + AI査定（有料ユーザーには非表示） */}
      <SearchPageCta />

      <LegalNotice />
      <Footer />
    </>
  );
}
