import Link from 'next/link'
import type { BlogPost } from '@/lib/blog'

export default function RelatedPosts({ posts }: { posts: BlogPost[] }) {
  if (posts.length === 0) return null

  return (
    <section className="mt-16">
      <h2 className="mb-6 text-xl font-bold text-amber-400">
        関連記事
      </h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="block rounded-xl border border-slate-700 bg-slate-800/50 p-5 transition-all hover:border-amber-500/40 hover:shadow-lg hover:shadow-amber-500/5"
          >
            <span className="mb-2 inline-block rounded-full bg-amber-500/20 px-3 py-0.5 text-xs text-amber-400">
              {post.category}
            </span>
            <h3 className="mb-2 text-sm font-bold leading-snug text-slate-100">
              {post.title}
            </h3>
            <p className="text-xs text-slate-400 line-clamp-2">
              {post.description}
            </p>
          </Link>
        ))}
      </div>
    </section>
  )
}
