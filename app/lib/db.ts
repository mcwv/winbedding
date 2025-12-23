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
    price_model?: string
    isFeatured?: boolean
    name: string
    slug: string
    description: string | null
    website_url: string | null
    v2_category: string | null
    is_published: boolean
    updated_at: Date
    logo_url: string | null
    screenshot_url: string | null
    previous_slugs: string[] | null
    quality_score: number
}

export function dbToolToTool(dbTool: DbTool): Tool {
    return {
        id: dbTool.id.toString(),
        name: dbTool.name,
        slug: dbTool.slug,
        description: dbTool.description || '',
        visitURL: dbTool.website_url || '',
        category: dbTool.v2_category || 'Other',
        updatedAt: dbTool.updated_at.toISOString(),
        logoUrl: dbTool.logo_url || undefined,
        imageUrl: dbTool.screenshot_url || undefined,
        source: 'database',
        quality_score: dbTool.quality_score || 0
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
