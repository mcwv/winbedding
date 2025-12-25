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
  v2_tags?: string[]

  // V3 Enrichment Fields
  tagline?: string
  pricing_model?: 'free' | 'freemium' | 'paid' | 'contact' | 'open-source'
  price_amount?: number
  price_currency?: string
  has_free_tier?: boolean
  has_trial?: boolean
  trial_days?: number
  tags?: string[]
  use_cases?: string[]
  features?: string[]
  target_audience?: string[]
  operating_system?: string[]
  platforms?: string[]
  skill_level?: 'beginner' | 'intermediate' | 'advanced' | 'expert' | 'all'
  learning_curve?: 'easy' | 'moderate' | 'steep'
  documentation_quality?: 'excellent' | 'good' | 'fair' | 'poor' | 'none'
  support_options?: string[]
  api_available?: boolean
  integrations?: string[]
  alternatives?: string[]
  pros?: string[]
  cons?: string[]
  best_for?: string
  not_recommended_for?: string
  verdict?: string

  // New V3 Pilot Fields
  adams_description?: string
  reddit_morsels?: any[]
  related_tools?: string[]

  // Scores
  transparency_score?: number
  experience_score?: number

  // Metadata
  enrichment_status?: 'pending' | 'needs_triage' | 'reachable' | 'dead' | 'completed'
}
