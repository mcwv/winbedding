import fs from 'fs'
import path from 'path'
import { parse } from 'csv-parse/sync'
import pg from 'pg'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const { Pool } = pg

// --- CONFIGURATION ---
const connectionString = process.env.DATABASE_URL || 'postgresql://ai_tools_silenttorn:767023df83bd7e678417793dfbbc2c1e4c5cb26c@h7h-gj.h.filess.io:61038/ai_tools_silenttorn'
const SCHEMA_NAME = 'ai_tools_silenttorn'

const pool = new Pool({
    connectionString,
    ssl: false,
    max: 10
})

// --- TYPES ---
interface RawTool {
    name: string
    slug: string
    description: string
    website_url: string
    logo_url: string
    category: string
    tags: string[]
    pricing_model: string
    price_amount?: number
    has_free_tier: boolean
    has_trial: boolean
    rating_value: number
    review_count: number
    features: string[]
    affiliate_url: string
    source: 'strapi' | 'bedwinning'
    is_featured: boolean
    thumbs: string // temp storage for bedwinning
}

// --- HELPERS ---
function cleanString(str: any): string {
    if (!str) return ''
    return String(str).trim().replace(/^,/, '').replace(/,$/, '').trim()
}

function generateSlug(name: string): string {
    return name.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        + '-' + Math.random().toString(36).substring(2, 5) // Add entropy to ensure uniqueness
}

function isValidUrl(url: string): boolean {
    if (!url) return false
    if (url.length > 500) return false // Too long
    // Basic protocol check
    if (!url.startsWith('http://') && !url.startsWith('https://')) return false
    return !url.includes(' ') && !url.includes(',')
}

function ensureProtocol(url: string): string {
    if (!url) return ''
    let clean = url.trim()
    if (clean.startsWith('http')) return clean
    return 'https://' + clean
}

// Map messy categories to our clean standard list
const CATEGORY_MAP: Record<string, string> = {
    'writing': 'Writing & Content',
    'copywriting': 'Writing & Content',
    'image': 'Image & Art Generation',
    'art': 'Image & Art Generation',
    'design': 'Design & UI',
    'video': 'Video & Animation',
    'audio': 'Audio & Music',
    'music': 'Audio & Music',
    'dev': 'Code & Development',
    'coding': 'Code & Development',
    'business': 'Business & Productivity',
    'productivity': 'Business & Productivity',
    'marketing': 'Marketing & SEO',
    'seo': 'Marketing & SEO',
    'data': 'Data & Analytics',
    'chat': 'AI Chat & Assistants',
    'education': 'Education & Learning',
    'research': 'Research & Science',
    'finance': 'Finance & Legal',
    'legal': 'Finance & Legal',
    'support': 'Customer Support',
    'hr': 'HR & Recruiting',
    'health': 'Healthcare & Medical',
    'gaming': 'Gaming & Entertainment',
    'social': 'Social Media',
    'translation': 'Translation & Language'
}

function mapCategory(rawCat: string): string {
    if (!rawCat) return 'Other'
    const lower = rawCat.toLowerCase()

    // Exact standard matches found in key search?
    for (const [key, val] of Object.entries(CATEGORY_MAP)) {
        if (lower.includes(key)) return val
    }

    return 'Other'
}

// --- MAIN MIGRATION ---
async function migrate() {
    console.log('🚀 Starting V2 Migration (E-E-A-T Optimized)')
    console.log('============================================')

    const client = await pool.connect()

    try {
        // 1. Setup Schema
        console.log('🏗️  Applying Schema...')
        await client.query(`CREATE SCHEMA IF NOT EXISTS ${SCHEMA_NAME}`)
        await client.query(`SET search_path TO ${SCHEMA_NAME}`)

        const schemaSql = fs.readFileSync(path.join(process.cwd(), 'scripts', 'schema.sql'), 'utf-8')
        await client.query(schemaSql)
        console.log('✅ Schema applied successfully')

        // 2. Load & Parse CSV (Correctly this time!)
        console.log('📂 Parsing Bedwinning CSV...')
        const csvContent = fs.readFileSync(path.join(process.cwd(), 'bedwinning - AI-Tools.csv'), 'utf-8')
        const csvRecords = parse(csvContent, {
            columns: false, // Use array indexing (headers are broken)
            skip_empty_lines: true,
            relax_column_count: true,
            bom: true,
            trim: true,
            from: 2 // Skip header row
        })

        if (csvRecords.length > 0) {
            console.log('   First record sample:', JSON.stringify(csvRecords[0]))
        }

        const bedwinningTools: RawTool[] = []
        let rawCount = 0
        for (const r of csvRecords) {
            rawCount++
            const name = cleanString(r[1]) // Index 1: Name

            if (!name) continue

            // CORRECT COLUMN MAPPING BY INDEX
            // 0: Slug/ID
            // 1: Name
            // 2: Category
            // 3: Description
            // 4: Featured (Boolean)
            // 5: Short Description
            // 6: Tags (pipe separated)
            // 7: URL
            // 13: Image

            const url = ensureProtocol(r[7])
            const desc = cleanString(r[3])
            const shortDesc = cleanString(r[5])

            if (!isValidUrl(url)) {
                // if (rawCount <= 3) console.log(`   Skipping row ${rawCount} due to invalid URL: ${url}`)
                continue
            }

            bedwinningTools.push({
                name,
                slug: generateSlug(name),
                description: desc || shortDesc,
                website_url: url,
                logo_url: isValidUrl(r[13]) ? r[13] : '', // Image at index 13
                thumbs: isValidUrl(r[13]) ? r[13] : '',
                category: r[2], // Category at index 2
                tags: r[6] ? r[6].split('|').map((t: string) => cleanString(t)).filter((t: string) => t.length > 0) : [],
                pricing_model: 'unknown',
                has_free_tier: false,
                has_trial: false,
                rating_value: 0,
                review_count: 0,
                features: [],
                affiliate_url: '',
                source: 'bedwinning',
                is_featured: r[4] === 'TRUE'
            })
        }
        console.log(`   Found ${bedwinningTools.length} valid Bedwinning tools`)

        // 3. Load & Parse Strapi
        console.log('📂 Parsing Strapi JSON...')
        const jsonContent = fs.readFileSync(path.join(process.cwd(), 'strapi_ai_tools_directory.json'), 'utf-8')
        const jsonRecords = JSON.parse(jsonContent)

        const strapiTools: RawTool[] = []
        for (const r of jsonRecords) {
            const name = cleanString(r.name)
            if (!name) continue

            const url = ensureProtocol(r.visitURL)
            if (!isValidUrl(url)) continue

            strapiTools.push({
                name,
                slug: generateSlug(name),
                description: cleanString(r.description || r.shortDescription),
                website_url: url,
                logo_url: isValidUrl(r.logo) ? r.logo : '',
                category: r.category,
                tags: [],
                pricing_model: (r.pricingModel || 'unknown').toLowerCase(),
                has_free_tier: false,
                has_trial: false,
                rating_value: parseFloat(r.rating) || 0,
                review_count: r.reviewCount || 0,
                features: [],
                affiliate_url: isValidUrl(r.affiliateURL) ? r.affiliateURL : '',
                source: 'strapi',
                is_featured: r.isFeatured,
                thumbs: isValidUrl(r.thumbnail) ? r.thumbnail : ''
            })
        }
        console.log(`   Found ${strapiTools.length} valid Strapi tools`)

        // 4. Merge (Prioritize Strapi)
        console.log('🔀 Merging datasets...')
        const toolMap = new Map<string, RawTool>()

        // Add bedwinning first
        for (const t of bedwinningTools) {
            // Normalized key for deduping
            const key = t.name.toLowerCase().replace(/[^a-z0-9]/g, '')
            toolMap.set(key, t)
        }

        // Overwrite with Strapi (better quality generally)
        for (const t of strapiTools) {
            const key = t.name.toLowerCase().replace(/[^a-z0-9]/g, '')
            if (toolMap.has(key)) {
                // Determine which one is actually better
                // For now, assume Strapi is better BUT keep unique fields from Bedwinning if needed
                // Actually, let's just let Strapi win for now as per plan
                toolMap.set(key, t)
            } else {
                toolMap.set(key, t)
            }
        }

        const mergedTools = Array.from(toolMap.values())
        console.log(`   Total unique tools to insert: ${mergedTools.length}`)

        // 5. Insert Categories & Tools
        console.log('📥 Insert into DB...')

        // Get category IDs
        const catRes = await client.query('SELECT id, name FROM categories')
        const dbCategories = new Map(catRes.rows.map(r => [r.name, r.id]))
        const otherId = dbCategories.get('Other')

        let insertedCount = 0

        for (const tool of mergedTools) {
            // Map category to ID
            const cleanCatName = mapCategory(tool.category)
            const catId = dbCategories.get(cleanCatName) || otherId

            // Pricing model cleanup
            let pricing = tool.pricing_model
            if (!['free', 'freemium', 'paid', 'contact', 'open-source'].includes(pricing)) {
                if (pricing.includes('free')) pricing = 'freemium'
                else if (pricing.includes('paid')) pricing = 'paid'
                else pricing = 'contact'
            }

            // Calculate Quality Score (Basic version)
            let qualityScore = 50
            if (tool.description.length > 200) qualityScore += 10
            if (tool.logo_url) qualityScore += 10
            if (tool.rating_value > 0) qualityScore += 10

            try {
                await client.query(`
                    INSERT INTO tools (
                        name, slug, description, website_url, logo_url, screenshot_url,
                        category_id, tags, 
                        pricing_model, has_free_tier, has_trial,
                        rating_value, review_count, 
                        affiliate_url, has_affiliate_link,
                        is_featured, is_published, quality_score, data_source
                    ) VALUES (
                        $1, $2, $3, $4, $5, $6,
                        $7, $8,
                        $9, $10, $11,
                        $12, $13,
                        $14, $15,
                        $16, $17, $18, $19
                    )
                `, [
                    tool.name,
                    tool.slug,
                    tool.description,
                    tool.website_url,
                    tool.logo_url,
                    tool.thumbs, // Use thumbs as screenshot/preview
                    catId,
                    tool.tags,
                    pricing,
                    tool.has_free_tier,
                    tool.has_trial,
                    tool.rating_value,
                    tool.review_count,
                    tool.affiliate_url,
                    !!tool.affiliate_url,
                    tool.is_featured,
                    true, // Publish by default if it passed validity checks
                    qualityScore,
                    tool.source
                ])
                insertedCount++
            } catch (err: any) {
                // If unique constraint error (slug/name), ignore
                if (err.code !== '23505') {
                    console.error(`Failed to insert ${tool.name}: ${err.message}`)
                }
            }

            if (insertedCount % 500 === 0) process.stdout.write('.')
        }

        console.log(`\n✅ Migration Complete! Inserted ${insertedCount} tools.`)

    } catch (e) {
        console.error('❌ Migration Failed:', e)
    } finally {
        client.release()
        await pool.end()
    }
}

migrate()
