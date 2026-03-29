export type BlogCategory = '不動産' | '相場' | '投資'

export interface BlogPost {
  slug: string
  title: string
  description: string
  date: string
  category: BlogCategory
  tags: string[]
  ogImage?: string
  content: string
}

export const CATEGORIES: BlogCategory[] = ['不動産', '相場', '投資']
