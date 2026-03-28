import { MetadataRoute } from 'next'

const BASE_URL = 'https://souba.next-aura.com'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/account/', '/dashboard/', '/actions/'],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  }
}
