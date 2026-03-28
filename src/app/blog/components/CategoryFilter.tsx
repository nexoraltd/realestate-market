'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { CATEGORIES } from '@/lib/blog-types'

export default function CategoryFilter() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const current = searchParams.get('category') ?? ''

  function handleClick(cat: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (cat === current) {
      params.delete('category')
    } else {
      params.set('category', cat)
    }
    const qs = params.toString()
    router.push(`/blog${qs ? `?${qs}` : ''}`)
  }

  return (
    <div className="mb-8 flex flex-wrap gap-2">
      <button
        onClick={() => handleClick('')}
        className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
          !current
            ? 'bg-amber-500 text-white shadow-lg'
            : 'border border-slate-600 text-slate-400 hover:border-amber-500 hover:text-amber-400'
        }`}
      >
        すべて
      </button>
      {CATEGORIES.map((cat) => (
        <button
          key={cat}
          onClick={() => handleClick(cat)}
          className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
            current === cat
              ? 'bg-amber-500 text-white shadow-lg'
              : 'border border-slate-600 text-slate-400 hover:border-amber-500 hover:text-amber-400'
          }`}
        >
          {cat}
        </button>
      ))}
    </div>
  )
}
