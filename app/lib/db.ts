import pg from 'pg'

const { Pool } = pg

// Connection string for Filess.io PostgreSQL
const connectionString = process.env.DATABASE_URL ||
    'postgresql://ai_tools_silenttorn:767023df83bd7e678417793dfbbc2c1e4c5cb26c@h7h-gj.h.filess.io:61038/ai_tools_silenttorn'

const SCHEMA_NAME = 'ai_tools_silenttorn'

// Create pool for connection reuse
const pool = new Pool({
    connectionString,
    ssl: false,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
})

// Set search path on each connection
pool.on('connect', (client) => {
    client.query(`SET search_path TO ${SCHEMA_NAME}`)
})

export interface DbTool {
    id: number
    name: string
    slug: string
    tagline: string | null
    description: string | null
    website_url: string | null
    logo_url: string | null
    screenshot_url: string | null

    // Categorization
    category_id: number | null
    category_name?: string // Joined
    category_slug?: string // Joined
    subcategory: string | null
    tags: string[] | null
    use_cases: string[] | null

    // Metrics
    rating_value: number
    review_count: number
    quality_score: number

    // Status
    is_featured: boolean
    is_verified: boolean
    is_published: boolean

    // Pricing
    pricing_model: string | null
    price_amount: number | null
    price_currency: string | null
    has_free_tier: boolean
    has_trial: boolean
    trial_days: number | null

    // Platform
    operating_system: string[] | null
    platforms: string[] | null
    features: string[] | null

    // Affiliate
    affiliate_url: string | null
    has_affiliate_link: boolean

    // E-E-A-T: Experience
    hands_on_review: string | null
    pros: string[] | null
    cons: string[] | null
    verdict: string | null

    // E-E-A-T: Expertise
    target_audience: string[] | null
    skill_level: string | null
    learning_curve: string | null
    documentation_quality: string | null
    support_options: string[] | null
    integrations: string[] | null
    api_available: boolean
    alternatives: string[] | null

    // E-E-A-T: Authority
    company_name: string | null
    company_founded: number | null
    employee_count: string | null
    funding_raised: string | null
    notable_customers: string[] | null

    // E-E-A-T: Trust
    has_privacy_policy: boolean
    gdpr_compliant: boolean
    security_features: string[] | null

    // Helpful Content
    best_for: string | null
    not_recommended_for: string | null

    created_at: Date
    updated_at: Date
}

// Convert database row to frontend Tool type
// Adapting new schema to existing frontend 'Tool' interface as much as possible
export function dbToolToTool(dbTool: DbTool) {
    return {
        id: dbTool.id.toString(),
        name: dbTool.name,
        slug: dbTool.slug,
        tagline: dbTool.tagline || undefined,
        description: dbTool.description || '',
        shortDescription: dbTool.tagline || (dbTool.description ? dbTool.description.substring(0, 150) + '...' : ''),

        visitURL: dbTool.website_url || '',
        affiliateURL: dbTool.affiliate_url || '',

        thumbnail: dbTool.logo_url || dbTool.screenshot_url || '',
        logo: dbTool.logo_url || '',

        category: dbTool.category_name || 'Other',
        mappedCategory: dbTool.category_name || 'Other',
        subcategory: dbTool.subcategory || undefined,

        tags: dbTool.tags || [],
        useCases: dbTool.use_cases || undefined,

        rating: Number(dbTool.rating_value) || 0,
        likes: 0,
        reviewCount: dbTool.review_count || 0,

        isFeatured: dbTool.is_featured || false,
        isVerified: dbTool.is_verified || false,
        isTopTool: dbTool.quality_score > 80,

        // Pricing
        pricingModel: dbTool.pricing_model || '',
        priceAmount: dbTool.price_amount || undefined,
        priceCurrency: dbTool.price_currency || undefined,
        hasFreeTrialDays: dbTool.trial_days || undefined,
        costs: dbTool.pricing_model === 'free' ? 'Free' : (dbTool.has_free_tier ? 'Freemium' : 'Paid'),

        // Platform
        operatingSystem: dbTool.operating_system || undefined,
        platforms: dbTool.platforms || undefined,
        features: dbTool.features || undefined,

        hasAffiliateLink: dbTool.has_affiliate_link || false,

        source: 'database' as const,
        createdAt: dbTool.created_at?.toISOString() || new Date().toISOString(),
        updatedAt: dbTool.updated_at?.toISOString() || new Date().toISOString(),

        // E-E-A-T: Experience
        qualityScore: dbTool.quality_score,
        handsOnReview: dbTool.hands_on_review || undefined,
        pros: dbTool.pros || [],
        cons: dbTool.cons || [],
        verdict: dbTool.verdict || undefined,

        // E-E-A-T: Expertise
        targetAudience: dbTool.target_audience || undefined,
        skillLevel: dbTool.skill_level || undefined,
        learningCurve: dbTool.learning_curve || undefined,
        documentationQuality: dbTool.documentation_quality || undefined,
        supportOptions: dbTool.support_options || undefined,
        integrations: dbTool.integrations || undefined,
        apiAvailable: dbTool.api_available || false,
        alternatives: dbTool.alternatives || undefined,

        // E-E-A-T: Authority
        companyName: dbTool.company_name || undefined,
        companyFounded: dbTool.company_founded || undefined,
        employeeCount: dbTool.employee_count || undefined,
        fundingRaised: dbTool.funding_raised || undefined,
        notableCustomers: dbTool.notable_customers || undefined,

        // E-E-A-T: Trust
        hasPrivacyPolicy: dbTool.has_privacy_policy || false,
        gdprCompliant: dbTool.gdpr_compliant || false,
        securityFeatures: dbTool.security_features || [],

        // Helpful Content
        bestFor: dbTool.best_for || undefined,
        notRecommendedFor: dbTool.not_recommended_for || undefined,
    }
}

// Get all published tools (using the VIEW)
export async function getAllTools() {
    const result = await pool.query<DbTool>(`
    SELECT * FROM published_tools 
    LIMIT 5000 
  `) // Increased limit for full dataset
    return result.rows.map(dbToolToTool)
}

// Get tools by category
export async function getToolsByCategory(category: string) {
    const result = await pool.query<DbTool>(
        'SELECT * FROM published_tools WHERE category_name = $1 ORDER BY quality_score DESC',
        [category]
    )
    return result.rows.map(dbToolToTool)
}

// Search tools
export async function searchTools(query: string) {
    const searchPattern = `% ${query} % `
    const result = await pool.query<DbTool>(
        `SELECT * FROM published_tools 
     WHERE name ILIKE $1 
        OR description ILIKE $1 
        OR category_name ILIKE $1
     ORDER BY quality_score DESC
     LIMIT 100`,
        [searchPattern]
    )
    return result.rows.map(dbToolToTool)
}

// Get tool by slug
export async function getToolBySlug(slug: string) {
    const result = await pool.query<DbTool>(
        'SELECT * FROM published_tools WHERE slug = $1',
        [slug]
    )
    return result.rows[0] ? dbToolToTool(result.rows[0]) : null
}

// Get tool count
export async function getToolCount() {
    const result = await pool.query('SELECT COUNT(*) as count FROM tools WHERE is_published = TRUE')
    return parseInt(result.rows[0].count)
}

// Get categories with counts
export async function getCategoriesWithCounts() {
    const result = await pool.query(`
    SELECT c.name as mapped_category, COUNT(t.id) as count 
    FROM categories c
    LEFT JOIN tools t ON t.category_id = c.id
    WHERE t.is_published = TRUE
    GROUP BY c.id, c.name
    ORDER BY count DESC
        `)
    return result.rows as { mapped_category: string; count: string }[]
}

export { pool }
