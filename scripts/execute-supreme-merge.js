const { Pool } = require('pg');
const connectionString = 'postgresql://postgres.idfykpdhfmuqkdnfjgqw:E1SqIqRqwhwg20@aws-1-eu-west-1.pooler.supabase.com:6543/postgres';
const pool = new Pool({ connectionString });

const CATEGORIES = {
    "Code": [
        "code", "developer", "programming", "git", "api", "database",
        "website", "builder", "no-code", "nocode", "low-code", "app",
        "deployment", "hosting", "frontend", "backend", "full stack"
    ],
    "Writing": [
        "copywriting", "blog", "text", "writer", "essay", "seo",
        "content", "email", "story", "novel", "script", "paraphrase"
    ],
    "Business": [
        "business", "marketing", "sales", "finance", "crm", "workflow",
        "startup", "entrepreneur", "management", "strategy", "analytics", "branding", "business plan"
    ],
    "Image": [
        "image", "photo", "drawing", "art", "avatar", "logo",
        "generator", "visual", "picture", "diffusion", "rendering", "portrait"
    ],
    "Video": ["video", "editor", "clip", "animation", "movie", "film", "subtitle"],
    "Audio": ["voice", "speech", "music", "audio", "transcription", "podcast", "sound", "vocals"],
    "Chatbot": ["chat", "assistant", "support", "bot", "conversational", "gpt", "llm"],
    "Productivity": ["note", "task", "schedule", "calendar", "organize", "search", "browser", "extension", "summar"]
};

function classifyTool(name, description) {
    const text = `${name} ${description}`.toLowerCase();
    let bestCategory = "Other";
    let maxMatches = 0;

    for (const [category, keywords] of Object.entries(CATEGORIES)) {
        let matches = 0;
        keywords.forEach(keyword => {
            if (text.includes(keyword.toLowerCase())) {
                matches++;
            }
        });
        if (matches > maxMatches) {
            maxMatches = matches;
            bestCategory = category;
        }
    }
    return bestCategory;
}

async function runMerge() {
    try {
        console.log('--- 🚀 Starting Supreme Merge & Taxonomy v3 ---');

        // 1. Restore columns
        console.log('Restoring logo_url and screenshot_url columns...');
        await pool.query(`
            ALTER TABLE tools 
            ADD COLUMN IF NOT EXISTS logo_url TEXT,
            ADD COLUMN IF NOT EXISTS screenshot_url TEXT;
        `);

        // 2. Fetch all tools from both tables
        console.log('Fetching tools for processing...');
        const currentToolsRes = await pool.query('SELECT id, name, description FROM tools');
        const v2ToolsRes = await pool.query('SELECT name, description, logo_url, image_url, url FROM tools_v2');

        const currentTools = currentToolsRes.rows;
        const v2Tools = v2ToolsRes.rows;

        console.log(`Current tools: ${currentTools.length}, v2 tools: ${v2Tools.length}`);

        // 3. Process current tools (Update & Re-classify)
        console.log('Updating & re-classifying existing tools...');
        for (const tool of currentTools) {
            const v2Match = v2Tools.find(v => v.name.toLowerCase() === tool.name.toLowerCase());

            const newDesc = (v2Match && v2Match.description && v2Match.description.length > (tool.description || '').length)
                ? v2Match.description
                : tool.description;

            const newCategory = classifyTool(tool.name, newDesc || '');
            const logo = v2Match ? v2Match.logo_url : null;
            const screenshot = v2Match ? v2Match.image_url : null;

            await pool.query(`
                UPDATE tools 
                SET description = $1, 
                    v2_category = $2, 
                    logo_url = $3, 
                    screenshot_url = $4
                WHERE id = $5
            `, [newDesc, newCategory, logo, screenshot, tool.id]);
        }

        // 4. Insert New Tools from v2
        console.log('Inserting unique new tools from tools_v2...');
        let insertedCount = 0;
        for (const v2 of v2Tools) {
            const exists = currentTools.find(t => t.name.toLowerCase() === v2.name.toLowerCase());
            if (!exists && v2.description && v2.description.length > 50) {
                const category = classifyTool(v2.name, v2.description);
                const slug = v2.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

                await pool.query(`
                    INSERT INTO tools (name, slug, description, website_url, v2_category, logo_url, screenshot_url, is_published, quality_score)
                    VALUES ($1, $2, $3, $4, $5, $6, $7, TRUE, 75)
                    ON CONFLICT (slug) DO NOTHING
                `, [v2.name, slug, v2.description, v2.url, category, v2.logo_url, v2.image_url]);
                insertedCount++;
            }
        }
        console.log(`Inserted ${insertedCount} new high-quality tools.`);

        // 5. Update VIEW
        console.log('Updating published_tools view...');
        await pool.query(`
            DROP VIEW IF EXISTS published_tools;
            CREATE OR REPLACE VIEW published_tools AS
            SELECT 
                id, name, slug, description, website_url, v2_category, 
                quality_score, is_published, updated_at, logo_url, screenshot_url
            FROM tools
            WHERE is_published = TRUE;
        `);

        console.log('✅ Supreme Merge Complete!');

    } catch (err) {
        console.error('Merge failed:', err);
    } finally {
        await pool.end();
    }
}

runMerge();
