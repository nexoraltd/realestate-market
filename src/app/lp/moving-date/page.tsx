import type { Metadata } from 'next'
import MovingDateCalendar from './MovingDateCalendar'
import ContactForm from '@/app/lp/components/ContactForm'
import LpFooter from '@/app/lp/components/LpFooter'
import Link from 'next/link'

const BASE_URL = 'https://market.next-aura.com'

export const metadata: Metadata = {
  title: '【無料】引っ越しに良い日カレンダー 2026年版｜不動産相場ナビ',
  description: '2026年の引っ越し・不動産契約に適した日を月別に表示。大安・一粒万倍日・天赦日と、仏滅・不成就日をカレンダーで確認できます。',
  keywords: ['引っ越し', '吉日', '2026年', '一粒万倍日', '天赦日', '大安', 'カレンダー', '不動産', '契約日'],
  openGraph: {
    type: 'website',
    url: `${BASE_URL}/lp/moving-date`,
    siteName: '不動産相場ナビ',
    title: '【無料】引っ越しに良い日カレンダー 2026年版',
    description: '2026年の引っ越し・契約に適した日を月別カレンダーで表示。大安・一粒万倍日・天赦日がひと目でわかる。',
    images: [{ url: '/api/og-default', width: 1200, height: 630 }],
    locale: 'ja_JP',
  },
  twitter: {
    card: 'summary_large_image',
    title: '【無料】引っ越しに良い日カレンダー 2026年版',
    description: '2026年の引っ越し・契約に適した日をカレンダーで確認',
    images: ['/api/og-default'],
  },
  alternates: { canonical: `${BASE_URL}/lp/moving-date` },
}

export default function MovingDatePage() {
  return (
    <main className="relative min-h-screen bg-gradient-to-b from-[#0f172a] via-[#1e293b] to-[#0f172a] flex flex-col items-center px-4 py-16 overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      <div className="relative z-10 w-full max-w-lg">
        {/* ヒーロー */}
        <div className="text-center mb-10 animate-fade-in-up">
          <div className="text-4xl mb-3">📅</div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight mb-3 leading-tight">
            引っ越し・契約に<br />
            <span className="text-amber-400">良い日</span>を見つけよう
          </h1>
          <p className="text-slate-400 text-sm tracking-wider leading-relaxed">
            大安・一粒万倍日・天赦日など、<br />
            引っ越しや不動産契約に適した日を月別カレンダーで表示。<br />
            日取り選びの参考にご活用ください。
          </p>
          <div className="mt-6 mx-auto w-32 h-px bg-gradient-to-r from-transparent via-amber-500 to-transparent" />
        </div>

        {/* 吉日の解説 */}
        <div className="bg-slate-800/30 border border-slate-700 rounded-2xl p-6 mb-8 animate-fade-in-up-delay-1">
          <h2 className="text-amber-400 font-bold text-sm mb-3 tracking-widest">引っ越し・契約の日取り選びについて</h2>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-2">
              <span className="text-amber-400 shrink-0">&#9670;</span>
              <div>
                <span className="text-amber-400 font-bold">天赦日</span>
                <span className="text-slate-400"> — 年に数回しかない特に縁起が良いとされる日。新しいことを始めるのに適しています。</span>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-purple-400 shrink-0">&#9670;</span>
              <div>
                <span className="text-purple-300 font-bold">一粒万倍日</span>
                <span className="text-slate-400"> — 「一粒の種が万倍に実る」とされる日。引っ越しや契約のスタートに好まれます。</span>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-green-400 shrink-0">&#9670;</span>
              <div>
                <span className="text-green-400 font-bold">大安</span>
                <span className="text-slate-400"> — 六曜で最も縁起が良いとされる日。引っ越し・契約の定番です。</span>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-orange-400 shrink-0">&#9670;</span>
              <div>
                <span className="text-orange-400 font-bold">寅の日</span>
                <span className="text-slate-400"> — 旅立ち・引っ越しに良いとされる日。「千里を行って千里を帰る」の言い伝え。</span>
              </div>
            </div>
          </div>
        </div>

        {/* カレンダー＋結果 */}
        <div className="animate-fade-in-up-delay-2">
          <MovingDateCalendar />
        </div>

        {/* 相談フォーム */}
        <div id="contact-form" className="mt-12 animate-fade-in-up-delay-3">
          <ContactForm sourcePage="lp-moving-date" />
        </div>

        {/* 相場ナビへの誘導 */}
        <div className="mt-8 bg-slate-800/30 border border-slate-700 rounded-2xl p-6 text-center">
          <p className="text-slate-300 text-sm mb-3">
            エリアの不動産相場を無料で調べたい方はこちら
          </p>
          <Link
            href="/search"
            className="inline-block bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold px-8 py-3 rounded-xl text-sm tracking-wider transition"
          >
            不動産相場を検索する →
          </Link>
        </div>

        <LpFooter />
      </div>
    </main>
  )
}
