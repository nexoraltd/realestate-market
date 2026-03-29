import type { Metadata } from 'next'
import Link from 'next/link'
import { getAllPosts, type BlogCategory } from '@/lib/blog'
import CategoryFilter from './components/CategoryFilter'
import Breadcrumb from './components/Breadcrumb'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { Suspense } from 'react'

const BASE_URL = 'https://market.next-aura.com'

export const metadata: Metadata = {
  title: '不動産コラム｜不動産相場ナビ ブログ',
  description:
    '不動産相場の調べ方、マンション売買のタイミング、投資用物件の選び方など、不動産に役立つ知識をお届けします。',
  openGraph: {
    title: '不動産コラム｜不動産相場ナビ ブログ',
    description:
      '不動産相場の調べ方、マンション売買のタイミングなど、不動産に役立つ知識をお届けします。',
    url: `${BASE_URL}/blog`,
    type: 'website',
  },
  alternates: { canonical: `${BASE_URL}/blog` },
}

export default async function BlogListPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>
}) {
  const { category } = await searchParams
  const allPosts = getAllPosts()
  const posts = category
    ? allPosts.filter((p) => p.category === (category as BlogCategory))
    : allPosts

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gradient-to-b from-[#0f172a] via-[#1e293b] to-[#0f172a]">
        <div className="mx-auto max-w-4xl px-4 py-16">
          <Breadcrumb
            items={[
              { label: 'ホーム', href: '/' },
              { label: 'ブログ' },
            ]}
          />

          <h1 className="mb-2 text-3xl font-extrabold text-white md:text-4xl">
            不動産<span className="text-amber-400">コラム</span>
          </h1>
          <p className="mb-8 text-slate-400">
            不動産売買・投資に役立つ知識をお届けします
          </p>

          <Suspense fallback={null}>
            <CategoryFilter />
          </Suspense>

          {posts.length === 0 ? (
            <p className="text-center text-slate-500">記事がありません。</p>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2">
              {posts.map((post) => (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  className="block rounded-xl border border-slate-700 bg-slate-800/50 p-6 transition-all hover:border-amber-500/40 hover:shadow-lg hover:shadow-amber-500/5"
                >
                  <div className="mb-3 flex items-center gap-2">
                    <span className="rounded-full bg-amber-500/20 px-3 py-0.5 text-xs font-medium text-amber-400">
                      {post.category}
                    </span>
                    <time className="text-xs text-slate-500">{post.date}</time>
                  </div>
                  <h2 className="mb-2 text-lg font-bold leading-snug text-slate-100">
                    {post.title}
                  </h2>
                  <p className="text-sm text-slate-400 line-clamp-3">
                    {post.description}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {post.tags.slice(0, 4).map((tag) => (
                      <span
                        key={tag}
                        className="rounded bg-slate-700/50 px-2 py-0.5 text-xs text-slate-500"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* 下部CTA */}
          <div className="mt-16 text-center">
            <p className="mb-4 text-slate-400">
              不動産の売却・購入のご相談はお気軽に
            </p>
            <a
              href="mailto:info@next-aura.com"
              className="inline-block rounded-xl bg-amber-500 px-8 py-3 text-lg font-bold tracking-wide text-white shadow-lg transition hover:bg-amber-600 hover:shadow-xl"
            >
              無料で相談する
            </a>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
