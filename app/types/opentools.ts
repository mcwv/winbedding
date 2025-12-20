export interface PricingPlan {
  title: string
  price: number
  currency: string
  cost_frequency: string
  features: string[]
  _id: string
}

export interface SimilarTool {
  id: string
  tool_name: string
}

export interface FAQ {
  question: string
  answer: string
  _id: string
}

export interface GeneralUseCase {
  who_needs_this: string
  use_case_text: string
  _id: string
}

export interface Tool {
  id: string
  tool_name: string
  headline: string
  category: string
  thumbnail_image: string
  category_slug: string
  slug: string
  average_rating: number
  review_count: number
  favouriteCount: number
  todayFavourites: number
  monthFavourites: number
  features: string[]
  pricing_plans: PricingPlan[]
  last_updated: string
  tags: string[]
  similar_tools: SimilarTool[]
  faqs: FAQ[]
  description: string
  summary: string
  tool_url: string
  nav_links: any[]
  meta_description: string
  general_use_cases: GeneralUseCase[]
  archived: boolean
  single_page: boolean
  verified: boolean
  nsfw: boolean
  published: boolean
  mappedCategory?: string  // Clean category mapping
}
