import { MetadataRoute } from 'next'
import fs from 'fs'
import path from 'path'

const BASE_URL = 'https://market.next-aura.com'

const MAJOR_PREFECTURES = [
  '東京都', '神奈川県', '大阪府', '愛知県', '埼玉県',
  '千葉県', '兵庫県', '北海道', '福岡県', '静岡県',
  '京都府', '広島県', '宮城県', '新潟県', '長野県',
]

function getBlogSlugs(): string[] {
  try {
    const blogDir = path.join(process.cwd(), 'content', 'blog')
    if (!fs.existsSync(blogDir)) return []
    return fs.readdirSync(blogDir)
      .filter((f) => f.endsWith('.mdx'))
      .map((f) => f.replace(/\.mdx$/, ''))
  } catch {
    return []
  }
}

export default function sitemap(): MetadataRoute.Sitemap {
  const prefectureUrls: MetadataRoute.Sitemap = MAJOR_PREFECTURES.map((pref) => ({
    url: `${BASE_URL}/search?prefecture=${encodeURIComponent(pref)}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  const blogSlugs = getBlogSlugs()
  const blogUrls: MetadataRoute.Sitemap = blogSlugs.map((slug) => ({
    url: `${BASE_URL}/blog/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }))

  return [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/blog`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/pricing`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/buy`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/sell`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/register`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.4,
    },
    ...blogUrls,
    ...prefectureUrls,
  ]
}
