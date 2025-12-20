// Unified tool type that works with both Strapi and Bedwinning data

export interface Tool {
  // Core fields
  id: string
  name: string
  tagline?: string
  description: string
  shortDescription: string

  // URLs
  visitURL: string
  slug: string

  // Images
  thumbnail?: string
  logo?: string

  // Categorization
  category: string
  mappedCategory?: string  // Our clean 20 categories
  subcategory?: string
  tags: string[]
  useCases?: string[]

  // Ratings & Engagement
  rating: number
  likes: number
  reviewCount?: number

  // Status flags
  isFeatured: boolean
  isVerified: boolean
  isTopTool: boolean

  // Pricing
  pricingModel: 'Free' | 'Paid' | 'Freemium' | 'Trial' | string
  priceAmount?: number
  priceCurrency?: string
  hasFreeTrialDays?: number
  costs: string

  // Platform
  operatingSystem?: string[]
  platforms?: string[]
  features?: string[]

  // Affiliate
  hasAffiliateLink: boolean
  affiliateURL?: string

  // Metadata
  createdAt: string
  updatedAt: string
  publishedAt?: string

  // Source tracking
  source: 'strapi' | 'bedwinning' | 'merged' | 'database'

  // E-E-A-T: Experience
  qualityScore?: number
  handsOnReview?: string
  pros?: string[]
  cons?: string[]
  verdict?: string

  // E-E-A-T: Expertise
  targetAudience?: string[]
  skillLevel?: string
  learningCurve?: string
  documentationQuality?: string
  supportOptions?: string[]
  integrations?: string[]
  apiAvailable?: boolean
  alternatives?: string[]

  // E-E-A-T: Authority
  companyName?: string
  companyFounded?: number
  employeeCount?: string
  fundingRaised?: string
  notableCustomers?: string[]

  // E-E-A-T: Trust
  hasPrivacyPolicy?: boolean
  gdprCompliant?: boolean
  securityFeatures?: string[]

  // Helpful Content
  bestFor?: string
  notRecommendedFor?: string
}
