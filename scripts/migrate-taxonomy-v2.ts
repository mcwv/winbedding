import { pool } from '../app/lib/db';

const TAXONOMY_MAP: Record<string, string> = {
    'Creative & Media': 'Image & Art Generation,Video & Animation,Audio & Music,Gaming',
    'Writing & Copy': 'Writing & Content,Marketing & SEO,Social Media',
    'Dev & Data': 'Code & Development,Data & Analytics,Design & UI/UX,E-commerce',
    'Business Ops': 'Business & Productivity,Customer Support,Finance & Crypto,Real Estate,HR & Recruitment',
    'Personal & Life': 'Education & Learning,Entertainment,Health & Wellness,Personal Growth,Travel & Hospitality',
    'Search & Research': 'AI Chat & Assistants,Research & Science,Search Engines'
};

const REVERSE_MAP: Record<string, string> = {};
Object.entries(TAXONOMY_MAP).forEach(([v2, v1List]) => {
    v1List.split(',').forEach(v1 => {
        REVERSE_MAP[v1.trim()] = v2;
    });
});

async function migrateTaxonomy() {
    console.log('--- Executing Taxonomy Migration (v2) ---');

    try {
        // 1. Fetch all tools with their current category name
        const toolsRes = await pool.query(`
      SELECT t.id, t.name, t.tagline, t.description, c.name as cat_name, t.tags
      FROM tools t
      LEFT JOIN categories c ON t.category_id = c.id;
    `);

        console.log(`Processing ${toolsRes.rows.length} tools...`);

        let updatedCount = 0;

        for (const tool of toolsRes.rows) {
            let v2Cat = REVERSE_MAP[tool.cat_name] || 'Other';

            // Secondary logic for 'Other' or miscategorized items based on keywords
            const fullText = `${tool.name} ${tool.tagline || ''} ${tool.description || ''} ${(tool.tags || []).join(' ')}`.toLowerCase();

            // NEW: Rescan everything for better accuracy, prioritizing niche categories
            let finalCat = v2Cat;

            // 1. Personal & Life (High Priority for Travel/Health/Learning)
            if (fullText.includes('travel') || fullText.includes('trip') || fullText.includes('vacation') || fullText.includes('hotel') ||
                fullText.includes('learn') || fullText.includes('health') || fullText.includes('course') || fullText.includes('fitness') ||
                fullText.includes('mental health') || fullText.includes('wellness') || fullText.includes('education')) {
                finalCat = 'Personal & Life';
            }
            // 2. Search & Research (High Priority for Assistants/Chat)
            else if (fullText.includes('search engine') || fullText.includes('summarize') || fullText.includes('research paper') ||
                fullText.includes('assistant') || fullText.includes('chatbot') || fullText.includes('ai chat')) {
                finalCat = 'Search & Research';
            }
            // 3. Dev & Data
            else if (fullText.includes('code') || fullText.includes('programming') || fullText.includes('api') ||
                fullText.includes('sql') || fullText.includes('hosting') || fullText.includes('server') || fullText.includes('database')) {
                finalCat = 'Dev & Data';
            }
            // 4. Creative & Media (More specific keywords)
            else if (fullText.includes('video generation') || fullText.includes('image generation') || fullText.includes('graphic design') ||
                fullText.includes('art generation') || fullText.includes('music production') || fullText.includes('audio editing')) {
                finalCat = 'Creative & Media';
            }
            // 5. Business Ops
            else if (fullText.includes('automation') || fullText.includes('crm') || fullText.includes('business management') ||
                fullText.includes('meeting') || fullText.includes('scheduling') || fullText.includes('saas')) {
                finalCat = 'Business Ops';
            }
            // 6. Writing & Copy
            else if (fullText.includes('copywriting') || fullText.includes('seo') || fullText.includes('email marketing') ||
                fullText.includes('blogging') || fullText.includes('writing assistant')) {
                finalCat = 'Writing & Copy';
            }

            v2Cat = finalCat;

            // Cleanup tags (filter out JUNK)
            const junkTags = ['ai', 'ai-powered', 'ai-driven', 'innovation', 'technology', 'artificial intelligence'];
            const v2Tags = (tool.tags || []).filter((t: string) => !junkTags.includes(t.toLowerCase().trim()));

            await pool.query(
                'UPDATE tools SET v2_category = $1, v2_tags = $2 WHERE id = $3',
                [v2Cat, v2Tags, tool.id]
            );

            updatedCount++;
            if (updatedCount % 500 === 0) console.log(`Updated ${updatedCount} tools...`);
        }

        console.log(`Taxonomy migration completed. Total tools updated: ${updatedCount}`);

    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        await pool.end();
    }
}

migrateTaxonomy();
