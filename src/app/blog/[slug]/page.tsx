import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { MDXRemote } from 'next-mdx-remote/rsc'
import remarkGfm from 'remark-gfm'
import { getAllPosts, getPostBySlug, getRelatedPosts } from '@/lib/blog'
import { mdxComponents, AppCTA, MovingDateCTA, ConsultCTA, InfoBox } from '../components/MdxComponents'
import ShareButtons from '../components/ShareButtons'
import Breadcrumb from '../components/Breadcrumb'
import RelatedPosts from '../components/RelatedPosts'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

const BASE_URL = 'https://market.next-aura.com'

type Props = {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const posts = getAllPosts()
  return posts.map((post) => ({ slug: post.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const post = getPostBySlug(slug)
  if (!post) return {}

  return {
    title: `${post.title}｜不動産相場ナビ ブログ`,
    description: post.description,
    openGraph: {
      title: post.title,
      description: post.description,
      url: `${BASE_URL}/blog/${slug}`,
      type: 'article',
      publishedTime: post.date,
      images: post.ogImage
        ? [{ url: post.ogImage, width: 1200, height: 630 }]
        : [{ url: '/api/og-default', width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.description,
    },
    alternates: { canonical: `${BASE_URL}/blog/${slug}` },
  }
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params
  const post = getPostBySlug(slug)
  if (!post) notFound()

  const relatedPosts = getRelatedPosts(slug, 3)

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    dateModified: post.date,
    author: {
      '@type': 'Organization',
      name: '不動産相場ナビ',
      url: BASE_URL,
    },
    publisher: {
      '@type': 'Organization',
      name: 'ネクソラ不動産',
      url: BASE_URL,
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${BASE_URL}/blog/${slug}`,
    },
    image: post.ogImage || `${BASE_URL}/api/og-default`,
  }

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'ホーム',
        item: BASE_URL,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'ブログ',
        item: `${BASE_URL}/blog`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: post.title,
        item: `${BASE_URL}/blog/${slug}`,
      },
    ],
  }

  return (
    <>
      <Header />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <div className="min-h-screen bg-gradient-to-b from-[#0f172a] via-[#1e293b] to-[#0f172a]">
        <article className="mx-auto max-w-3xl px-4 py-16">
          <Breadcrumb
            items={[
              { label: 'ホーム', href: '/' },
              { label: 'ブログ', href: '/blog' },
              { label: post.title },
            ]}
          />

          {/* ヘッダー */}
          <header className="mb-10">
            <div className="mb-4 flex items-center gap-3">
              <span className="rounded-full bg-amber-500/20 px-3 py-1 text-xs font-medium text-amber-400">
                {post.category}
              </span>
              <time className="text-sm text-slate-500">{post.date}</time>
            </div>
            <h1 className="mb-4 text-2xl font-extrabold leading-tight text-white md:text-3xl">
              {post.title}
            </h1>
            <p className="text-slate-400">{post.description}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded bg-slate-700/50 px-2 py-0.5 text-xs text-slate-500"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </header>

          <div className="mb-10 h-px bg-gradient-to-r from-transparent via-amber-500/50 to-transparent" />

          {/* 本文 */}
          <div className="prose-custom">
            <MDXRemote
              source={post.content}
              options={{
                mdxOptions: {
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  remarkPlugins: [remarkGfm as any],
                },
              }}
              components={{
                ...mdxComponents,
                AppCTA,
                MovingDateCTA,
                ConsultCTA,
                InfoBox,
              }}
            />
          </div>

          <div className="my-10 h-px bg-gradient-to-r from-transparent via-amber-500/50 to-transparent" />

          {/* シェア */}
          <div className="flex items-center justify-between">
            <ShareButtons title={post.title} slug={post.slug} />
            <time className="text-xs text-slate-500">
              公開日: {post.date}
            </time>
          </div>

          {/* 関連記事 */}
          <RelatedPosts posts={relatedPosts} />

          {/* 下部CTA: AI査定 */}
          <div className="mt-16 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-8 text-center">
            <p className="mb-2 text-lg font-bold text-emerald-400">
              お持ちの物件、今いくら？
            </p>
            <p className="mb-6 text-sm text-slate-400">
              AIが国交省データから推定価格を算出。無料・登録不要で今すぐ査定。
            </p>
            <Link
              href="/estimate"
              className="inline-block rounded-xl bg-emerald-500 px-10 py-3 text-lg font-bold tracking-wide text-white transition hover:bg-emerald-600"
            >
              無料AI査定を試す
            </Link>
          </div>

          {/* 下部CTA: プロ向け有料プラン */}
          <div className="mt-6 rounded-xl border border-slate-700 bg-slate-800/50 p-8 text-center">
            <p className="mb-2 text-lg font-bold text-amber-400">
              不動産のプロ向け — もっと詳しいデータが必要ですか？
            </p>
            <p className="mb-6 text-sm text-slate-400">
              過去20年分の取引データ・CSV一括ダウンロード・トレンド分析。14日間無料トライアル。
            </p>
            <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Link
                href="/pricing"
                className="inline-block rounded-xl bg-amber-500 px-10 py-3 text-lg font-bold tracking-wide text-white transition hover:bg-amber-600"
              >
                プランを見る
              </Link>
              <Link
                href="/search"
                className="inline-block rounded-xl border border-slate-600 px-10 py-3 text-lg font-bold tracking-wide text-slate-300 transition hover:border-amber-500 hover:text-amber-400"
              >
                まず無料で検索
              </Link>
            </div>
          </div>
        </article>
      </div>
      <Footer />
    </>
  )
}
