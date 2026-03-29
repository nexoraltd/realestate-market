import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import type { BlogPost, BlogCategory } from './blog-types'

export type { BlogPost, BlogCategory }
export { CATEGORIES } from './blog-types'

const BLOG_DIR = path.join(process.cwd(), 'content', 'blog')

export function getAllPosts(): BlogPost[] {
  if (!fs.existsSync(BLOG_DIR)) return []
  const files = fs.readdirSync(BLOG_DIR).filter((f) => f.endsWith('.mdx'))
  const posts = files.map((file) => {
    const slug = file.replace(/\.mdx$/, '')
    return getPostBySlug(slug)
  })
  return posts
    .filter((p): p is BlogPost => p !== null)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

export function getPostBySlug(slug: string): BlogPost | null {
  const filePath = path.join(BLOG_DIR, `${slug}.mdx`)
  if (!fs.existsSync(filePath)) return null

  const fileContent = fs.readFileSync(filePath, 'utf-8')
  const { data, content } = matter(fileContent)

  return {
    slug,
    title: data.title ?? '',
    description: data.description ?? '',
    date: data.date ?? '',
    category: data.category ?? '不動産',
    tags: data.tags ?? [],
    ogImage: data.ogImage,
    content,
  }
}

export function getPostsByCategory(category: BlogCategory): BlogPost[] {
  return getAllPosts().filter((p) => p.category === category)
}

export function getRelatedPosts(currentSlug: string, limit = 3): BlogPost[] {
  const current = getPostBySlug(currentSlug)
  if (!current) return []

  const all = getAllPosts().filter((p) => p.slug !== currentSlug)

  const scored = all.map((post) => {
    let score = 0
    if (post.category === current.category) score += 10
    const sharedTags = post.tags.filter((t) => current.tags.includes(t))
    score += sharedTags.length * 3
    return { post, score }
  })

  scored.sort((a, b) => b.score - a.score)
  return scored.slice(0, limit).map((s) => s.post)
}
