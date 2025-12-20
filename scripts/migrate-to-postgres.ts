/**
 * Migration script to:
 * 1. Clean and fix corrupted tool data from CSV/JSON
 * 2. Create PostgreSQL schema
 * 3. Insert all tools into the database
 */

import { readFileSync } from 'fs'
import { join } from 'path'
import { parse } from 'csv-parse/sync'
import pg from 'pg'

const { Pool } = pg

// Database connection - using connection string
const connectionString = process.env.DATABASE_URL ||
    'postgresql://ai_tools_silenttorn:767023df83bd7e678417793dfbbc2c1e4c5cb26c@h7h-gj.h.filess.io:61038/ai_tools_silenttorn'

const pool = new Pool({
    connectionString,
    ssl: false
})

// Schema for the tools table - use user's schema (Filess.io requirement)
const SCHEMA_NAME = 'ai_tools_silenttorn'

const CREATE_SCHEMA = `
  CREATE SCHEMA IF NOT EXISTS ${SCHEMA_NAME};
  SET search_path TO ${SCHEMA_NAME};
  
  DROP TABLE IF EXISTS tools;
  
  CREATE TABLE tools (
    id SERIAL PRIMARY KEY,
    name VARCHAR(500) NOT NULL,
    slug VARCHAR(500) UNIQUE,
    description TEXT,
    short_description TEXT,
    
    -- URLs
    visit_url VARCHAR(1000),
    affiliate_url VARCHAR(1000),
    
    -- Images  
    thumbnail VARCHAR(1000),
    logo VARCHAR(1000),
    
    -- Categorization
    category VARCHAR(200),
    mapped_category VARCHAR(100),
    tags TEXT[],
    
    -- Ratings & Engagement
    rating DECIMAL(3,2) DEFAULT 0,
    likes INTEGER DEFAULT 0,
    review_count INTEGER DEFAULT 0,
    
    -- Status flags
    is_featured BOOLEAN DEFAULT FALSE,
    is_verified BOOLEAN DEFAULT FALSE,
    is_top_tool BOOLEAN DEFAULT FALSE,
    
    -- Pricing
    pricing_model VARCHAR(100),
    costs VARCHAR(500),
    
    -- Affiliate
    has_affiliate_link BOOLEAN DEFAULT FALSE,
    
    -- Metadata
    source VARCHAR(50),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
  );
  
  -- Indexes for common queries
  CREATE INDEX idx_tools_category ON tools(mapped_category);
  CREATE INDEX idx_tools_name ON tools(name);
  CREATE INDEX idx_tools_rating ON tools(rating DESC);
  CREATE INDEX idx_tools_source ON tools(source);
`

interface RawTool {
    id?: string
    name: string
    description?: string
    shortDescription?: string
    visitURL?: string
    affiliateURL?: string
    slug?: string
    thumbnail?: string
    logo?: string
    category?: string
    mappedCategory?: string
    tags?: string[]
    rating?: number
    likes?: number
    reviewCount?: number
    isFeatured?: boolean
    isVerified?: boolean
    isTopTool?: boolean
    pricingModel?: string
    costs?: string
    hasAffiliateLink?: boolean
    source?: string
    createdAt?: string
    updatedAt?: string
}

// Category mapping function
const CATEGORY_MAPPING: Record<string, string> = {
    'ai-driven seo': 'SEO & Marketing',
    'seo': 'SEO & Marketing',
    'marketing': 'SEO & Marketing',
    'ecommerce': 'E-commerce',
    'e-commerce': 'E-commerce',
    'writing': 'Writing & Content',
    'content': 'Writing & Content',
    'copywriting': 'Writing & Content',
    'image': 'Image & Art Generation',
    'art': 'Image & Art Generation',
    'image generation': 'Image & Art Generation',
    'video': 'Video & Animation',
    'animation': 'Video & Animation',
    'code': 'Code & Development',
    'coding': 'Code & Development',
    'development': 'Code & Development',
    'developer tools': 'Code & Development',
    'chat': 'AI Chat & Assistants',
    'chatbot': 'AI Chat & Assistants',
    'assistant': 'AI Chat & Assistants',
    'productivity': 'Business & Productivity',
    'business': 'Business & Productivity',
    'data': 'Data & Analytics',
    'analytics': 'Data & Analytics',
    'audio': 'Audio & Music',
    'music': 'Audio & Music',
    'voice': 'Audio & Music',
    'design': 'Design & UI',
    'ui': 'Design & UI',
    'education': 'Education & Learning',
    'learning': 'Education & Learning',
    'research': 'Research & Science',
    'science': 'Research & Science',
    'healthcare': 'Healthcare & Medical',
    'medical': 'Healthcare & Medical',
    'finance': 'Finance & Legal',
    'legal': 'Finance & Legal',
    'social': 'Social Media',
    'social media': 'Social Media',
    'gaming': 'Gaming & Entertainment',
    'entertainment': 'Gaming & Entertainment',
    'hr': 'HR & Recruiting',
    'recruiting': 'HR & Recruiting',
    'customer': 'Customer Support',
    'support': 'Customer Support',
    'translation': 'Translation & Language',
    'language': 'Translation & Language',
}

function mapCategory(category: string | undefined): string {
    if (!category) return 'Other'
    const lower = category.toLowerCase().trim()

    for (const [key, value] of Object.entries(CATEGORY_MAPPING)) {
        if (lower.includes(key)) {
            return value
        }
    }
    return 'Other'
}

function isValidUrl(url: string | undefined): boolean {
    if (!url || typeof url !== 'string') return false
    return url.startsWith('http://') || url.startsWith('https://')
}

function cleanString(str: string | undefined): string {
    if (!str) return ''
    // Remove leading commas and clean up
    return str.replace(/^,+/, '').trim()
}

function generateSlug(name: string): string {
    return name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .substring(0, 100)
}

async function loadAndCleanBedwinningData(): Promise<RawTool[]> {
    console.log('📂 Loading Bedwinning CSV data...')

    const csvPath = join(process.cwd(), 'bedwinning - AI-Tools.csv')
    const csvContent = readFileSync(csvPath, 'utf-8')

    // Parse CSV with proper handling
    const records = parse(csvContent, {
        columns: true,
        skip_empty_lines: true,
        relax_column_count: true,
        trim: true,
    })

    console.log(`   Found ${records.length} raw records`)

    const tools: RawTool[] = []
    let skipped = 0

    for (const record of records) {
        // Map CSV columns to our format - CORRECT BEDWINNING COLUMN NAMES
        const name = cleanString(record.title || '')
        const visitUrl = record.apply_link || ''  // apply_link is the URL!

        // Skip invalid entries
        if (!name || name.length < 2) {
            skipped++
            continue
        }

        tools.push({
            name,
            description: cleanString(record.featured_description || ''),  // featured_description is main desc
            shortDescription: cleanString(record.short_description || ''),
            visitURL: isValidUrl(visitUrl) ? visitUrl : '',
            affiliateURL: isValidUrl(record.affiliate_link) ? record.affiliate_link : '',  // affiliate_link
            slug: generateSlug(name),
            thumbnail: isValidUrl(record.thumbs) ? record.thumbs : '',  // thumbs not thumbnail
            logo: isValidUrl(record.logos) ? record.logos : '',  // logos not logo
            category: record.category || '',
            tags: record.tags ? record.tags.split('|').map((t: string) => t.trim()).filter(Boolean) : [],  // pipe-separated
            rating: parseFloat(record.rating) || 0,
            likes: parseInt(record.likes) || 0,
            pricingModel: record.pricing_model || '',
            costs: record.costs || '',
            isFeatured: record.featured === 'true' || record.featured === 'TRUE',
            isVerified: false,
            hasAffiliateLink: !!record.affiliate_link,
            source: 'bedwinning',
        })
    }

    console.log(`   Cleaned: ${tools.length} valid tools, skipped ${skipped} invalid`)
    return tools
}

async function loadStrapiData(): Promise<RawTool[]> {
    console.log('📂 Loading Strapi JSON data...')

    const jsonPath = join(process.cwd(), 'strapi_ai_tools_directory.json')

    try {
        const content = readFileSync(jsonPath, 'utf-8')
        const data = JSON.parse(content)

        const tools: RawTool[] = data.map((item: any) => ({
            name: item.name || item.title || '',
            description: item.description || '',
            shortDescription: item.shortDescription || item.short_description || '',
            visitURL: item.visitURL || item.website || '',
            affiliateURL: item.affiliateURL || '',
            slug: item.slug || generateSlug(item.name || ''),
            thumbnail: item.thumbnail || '',
            logo: item.logo || '',
            category: item.category || '',
            tags: Array.isArray(item.tags) ? item.tags : [],
            rating: item.rating || 0,
            likes: item.likes || 0,
            reviewCount: item.reviewCount || 0,
            pricingModel: item.pricingModel || '',
            costs: item.costs || '',
            isFeatured: item.isFeatured || false,
            isVerified: item.isVerified || false,
            isTopTool: item.isTopTool || false,
            hasAffiliateLink: item.hasAffiliateLink || false,
            source: 'strapi',
        })).filter((t: RawTool) => t.name && t.name.length > 1)

        console.log(`   Found ${tools.length} valid Strapi tools`)
        return tools
    } catch (error) {
        console.log('   No Strapi data found, continuing with Bedwinning only')
        return []
    }
}

async function mergeAndDeduplicate(bedwinning: RawTool[], strapi: RawTool[]): Promise<RawTool[]> {
    console.log('🔀 Merging and deduplicating data...')

    const seenSlugs = new Set<string>()
    const merged: RawTool[] = []

    // Prioritize Strapi data (usually higher quality)
    for (const tool of strapi) {
        if (!seenSlugs.has(tool.slug!)) {
            seenSlugs.add(tool.slug!)
            tool.mappedCategory = mapCategory(tool.category)
            merged.push(tool)
        }
    }

    // Add Bedwinning data that doesn't duplicate
    for (const tool of bedwinning) {
        if (!seenSlugs.has(tool.slug!)) {
            seenSlugs.add(tool.slug!)
            tool.mappedCategory = mapCategory(tool.category)
            merged.push(tool)
        }
    }

    console.log(`   Merged total: ${merged.length} unique tools`)
    return merged
}

async function createSchema(): Promise<void> {
    console.log('🏗️  Creating database schema...')
    await pool.query(CREATE_SCHEMA)
    console.log('   Schema created successfully')
}

async function insertTools(tools: RawTool[]): Promise<void> {
    console.log('📥 Inserting tools into database...')

    let inserted = 0
    let failed = 0

    for (const tool of tools) {
        try {
            await pool.query(`
        INSERT INTO tools (
          name, slug, description, short_description,
          visit_url, affiliate_url, thumbnail, logo,
          category, mapped_category, tags,
          rating, likes, review_count,
          is_featured, is_verified, is_top_tool,
          pricing_model, costs, has_affiliate_link, source
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21)
        ON CONFLICT (slug) DO NOTHING
      `, [
                tool.name,
                tool.slug,
                tool.description,
                tool.shortDescription,
                tool.visitURL,
                tool.affiliateURL,
                tool.thumbnail,
                tool.logo,
                tool.category,
                tool.mappedCategory,
                tool.tags,
                tool.rating,
                tool.likes,
                tool.reviewCount || 0,
                tool.isFeatured,
                tool.isVerified,
                tool.isTopTool,
                tool.pricingModel,
                tool.costs,
                tool.hasAffiliateLink,
                tool.source,
            ])
            inserted++

            if (inserted % 500 === 0) {
                console.log(`   Progress: ${inserted}/${tools.length}`)
            }
        } catch (error) {
            failed++
            if (failed < 5) {
                console.error(`   Failed to insert ${tool.name}:`, error)
            }
        }
    }

    console.log(`\n✅ Complete! Inserted ${inserted} tools, ${failed} failed`)
}

async function main() {
    console.log('\n🚀 Starting AI Tools Database Migration\n')
    console.log('='.repeat(50))

    try {
        // Test connection
        console.log('🔌 Testing database connection...')
        await pool.query('SELECT NOW()')
        console.log('   Connected successfully!\n')

        // Load and clean data
        const bedwinningTools = await loadAndCleanBedwinningData()
        const strapiTools = await loadStrapiData()
        const allTools = await mergeAndDeduplicate(bedwinningTools, strapiTools)

        // Create schema and insert
        await createSchema()
        await insertTools(allTools)

        // Verify
        const result = await pool.query('SELECT COUNT(*) FROM tools')
        console.log(`\n📊 Final count: ${result.rows[0].count} tools in database`)

        // Show sample
        const sample = await pool.query('SELECT name, mapped_category, visit_url FROM tools LIMIT 5')
        console.log('\n📋 Sample entries:')
        sample.rows.forEach(row => {
            console.log(`   - ${row.name} (${row.mapped_category})`)
        })

    } catch (error) {
        console.error('❌ Migration failed:', error)
        process.exit(1)
    } finally {
        await pool.end()
    }

    console.log('\n' + '='.repeat(50))
    console.log('🎉 Migration complete!\n')
}

main()
