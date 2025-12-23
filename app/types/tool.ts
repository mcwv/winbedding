export interface Tool {
  id: string
  name: string
  slug: string
  description: string
  visitURL: string
  category: string
  updatedAt: string
  logoUrl?: string
  imageUrl?: string
  source: 'database'
  quality_score: number
}
