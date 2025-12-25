import pg from 'pg'
import { tokenizeQuery } from './searchUtils'
import { Tool } from '../types/tool'

const { Pool } = pg

// Connection string for Supabase PostgreSQL (pooler for serverless)
const connectionString = process.env.DATABASE_URL ||
    'postgresql://postgres.idfykpdhfmuqkdnfjgqw:E1SqIqRqwhwg20@aws-1-eu-west-1.pooler.supabase.com:6543/postgres'

const SCHEMA_NAME = 'public'  // Supabase uses public schema

// Create pool for connection reuse
const pool = new Pool({
    connectionString,
    ssl: false,  // Transaction pooler doesn't use SSL
    max: 5,
    idleTimeoutMillis: 10000,
    connectionTimeoutMillis: 5000,
})

// Set search path on each connection
pool.on('connect', (client) => {
    client.query(`SET search_path TO ${SCHEMA_NAME}`)
})

export interface DbTool {
    id: number
    name: string
    slug: string
    tagline?: string
    description: string | null
    website_url: string | null
    logo_url: string | null
    screenshot_url: string | null
    v2_category: string | null
    is_published: boolean
    updated_at: Date
    quality_score: number
    v2_tags?: string[]

    // V3 Fields
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
    skill_level?: string
    learning_curve?: string
    documentation_quality?: string
    support_options?: string[]
    api_available?: boolean
    integrations?: string[]
    alternatives?: string[]
    pros?: string[]
    cons?: string[]
    best_for?: string
    not_recommended_for?: string
    verdict?: string
    transparency_score?: number
    experience_score?: number
    adams_description?: string
    reddit_morsels?: any[]
    related_tools?: string[]
}

export function dbToolToTool(dbTool: DbTool): Tool {
    // V3 enrichment ensures description and logo_url are populated
    const description = dbTool.description || ''
    const logoUrl = dbTool.logo_url || undefined

    return {
        id: dbTool.id.toString(),
        name: dbTool.name,
        slug: dbTool.slug,
        description: description,
        visitURL: dbTool.website_url || '',
        category: dbTool.v2_category || 'Other',
        updatedAt: dbTool.updated_at.toISOString(),
        logoUrl: logoUrl,
        imageUrl: dbTool.screenshot_url || undefined,
        source: 'database',
        quality_score: dbTool.quality_score || 0,
        v2_tags: dbTool.v2_tags || [],

        // V3 Fields
        tagline: dbTool.tagline,
        pricing_model: dbTool.pricing_model,
        price_amount: dbTool.price_amount,
        price_currency: dbTool.price_currency,
        has_free_tier: dbTool.has_free_tier,
        has_trial: dbTool.has_trial,
        trial_days: dbTool.trial_days,
        tags: dbTool.tags,
        use_cases: dbTool.use_cases,
        features: dbTool.features,
        target_audience: dbTool.target_audience,
        operating_system: dbTool.operating_system,
        platforms: dbTool.platforms,
        skill_level: dbTool.skill_level as any,
        learning_curve: dbTool.learning_curve as any,
        documentation_quality: dbTool.documentation_quality as any,
        support_options: dbTool.support_options,
        api_available: dbTool.api_available,
        integrations: dbTool.integrations,
        alternatives: dbTool.alternatives,
        pros: dbTool.pros,
        cons: dbTool.cons,
        best_for: dbTool.best_for,
        not_recommended_for: dbTool.not_recommended_for,
        verdict: dbTool.verdict,
        transparency_score: dbTool.transparency_score,
        experience_score: dbTool.experience_score,

        adams_description: dbTool.adams_description, // Map directly
        reddit_morsels: dbTool.reddit_morsels,       // Map directly
        related_tools: dbTool.related_tools
    }
}

// Get all published tools (using the VIEW)
export async function getAllTools() {
    const result = await pool.query<DbTool>(`
    SELECT * FROM published_tools 
    ORDER BY quality_score DESC, updated_at DESC
    LIMIT 5000 
  `) // Restored limit for categories to work
    return result.rows.map(dbToolToTool)
}

// Get tools by category
export async function getToolsByCategory(category: string) {
    const result = await pool.query<DbTool>(
        'SELECT * FROM published_tools WHERE v2_category = $1 ORDER BY quality_score DESC, updated_at DESC',
        [category]
    )
    return result.rows.map(dbToolToTool)
}

// Search tools
export async function searchTools(query: string) {
    if (!query) return []

    const tokenGroups = tokenizeQuery(query)

    const conditions = tokenGroups.map((group, i) => {
        return `(
            name ILIKE ANY($${i + 1}) 
            OR description ILIKE ANY($${i + 1}) 
            OR v2_category ILIKE ANY($${i + 1})
        )`
    }).join(' AND ')

    const scoringParts = tokenGroups.map((group, i) => {
        return `(
            CASE WHEN name ILIKE ANY($${i + 1}) THEN 10 ELSE 0 END +
            CASE WHEN v2_category ILIKE ANY($${i + 1}) THEN 7 ELSE 0 END +
            CASE WHEN description ILIKE ANY($${i + 1}) THEN 2 ELSE 0 END
        )`
    })
    const scoreSql = scoringParts.length > 0 ? scoringParts.join(' + ') : '1'

    const result = await pool.query<DbTool & { relevance_score: number }>(
        `SELECT *, (${scoreSql}) as relevance_score FROM published_tools 
         WHERE ${conditions}
         ORDER BY relevance_score DESC, quality_score DESC, updated_at DESC
         LIMIT 500`,
        tokenGroups.map(group => group.map(w => `%${w}%`))
    )
    return result.rows.map(dbToolToTool)
}

// Get tool by slug with legacy fallback
export async function getToolBySlug(slug: string) {
    // 1. Try exact match
    const result = await pool.query<DbTool>(
        'SELECT * FROM published_tools WHERE slug = $1',
        [slug]
    )

    if (result.rows[0]) {
        return dbToolToTool(result.rows[0])
    }

    // 2. Try legacy fallback
    const fallbackResult = await pool.query<DbTool>(
        'SELECT * FROM published_tools WHERE $1 = ANY(previous_slugs)',
        [slug]
    )

    return fallbackResult.rows[0] ? dbToolToTool(fallbackResult.rows[0]) : null
}

// Get tool count
export async function getToolCount() {
    const result = await pool.query('SELECT COUNT(*) as count FROM tools WHERE is_published = TRUE')
    return parseInt(result.rows[0].count)
}

// Get v2 categories with counts
export async function getCategoriesWithCounts() {
    const result = await pool.query<{ category: string; count: string }>(`
    SELECT v2_category as category, COUNT(*) as count 
    FROM tools 
    WHERE is_published = TRUE AND v2_category IS NOT NULL
    GROUP BY v2_category
    ORDER BY count DESC
  `)
    return result.rows.map(row => ({
        category: row.category,
        count: parseInt(row.count, 10)
    }))
}

// Get similar tools by category
export async function getSimilarTools(toolId: string, category: string, limit: number = 4) {
    const result = await pool.query<DbTool>(
        'SELECT * FROM published_tools WHERE v2_category = $1 AND id != $2 ORDER BY quality_score DESC, updated_at DESC LIMIT $3',
        [category, parseInt(toolId), limit]
    )
    return result.rows.map(dbToolToTool)
}

export { pool }
