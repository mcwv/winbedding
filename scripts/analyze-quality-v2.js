const { Pool } = require('pg');

const pool = new Pool({
    connectionString: 'postgresql://ai_tools_silenttorn:767023df83bd7e678417793dfbbc2c1e4c5cb26c@h7h-gj.h.filess.io:61038/ai_tools_silenttorn',
    ssl: false
});

async function analyzeQuality() {
    try {
        await pool.query('SET search_path TO ai_tools_silenttorn');

        console.log('📊 DATA QUALITY ANALYSIS (V2 SCHEMA)\n');
        console.log('='.repeat(50));

        // Total count
        const total = await pool.query('SELECT COUNT(*) as count FROM tools');
        console.log(`\n📦 Total tools: ${total.rows[0].count}`);

        const published = await pool.query('SELECT COUNT(*) as count FROM tools WHERE is_published = TRUE');
        console.log(`✅ Published tools: ${published.rows[0].count}`);

        // Quality tiers
        const highQ = await pool.query('SELECT COUNT(*) as count FROM tools WHERE quality_score >= 70');
        console.log(`🏆 High Quality (>70 score): ${highQ.rows[0].count}`);

        const medQ = await pool.query('SELECT COUNT(*) as count FROM tools WHERE quality_score BETWEEN 50 AND 69');
        console.log(`📗 Medium Quality (50-69 score): ${medQ.rows[0].count}`);

        const lowQ = await pool.query('SELECT COUNT(*) as count FROM tools WHERE quality_score < 50');
        console.log(`⚠️  Low Quality (<50 score): ${lowQ.rows[0].count}`);

        // Missing fields
        const noUrl = await pool.query(`SELECT COUNT(*) as count FROM tools WHERE website_url IS NULL OR website_url = ''`);
        console.log(`❌ Missing URL: ${noUrl.rows[0].count}`);

        const shortDesc = await pool.query(`SELECT COUNT(*) as count FROM tools WHERE description IS NULL OR LENGTH(description) < 50`);
        console.log(`📝 Short/No Description: ${shortDesc.rows[0].count}`);

        // Categories
        console.log('\n📂 Top Categories:');
        const cats = await pool.query(`
        SELECT c.name, COUNT(t.id) as cnt 
        FROM categories c
        JOIN tools t ON t.category_id = c.id
        GROUP BY c.name
        ORDER BY cnt DESC
        LIMIT 5
    `);
        cats.rows.forEach(r => console.log(`  - ${r.name}: ${r.cnt}`));

    } catch (e) {
        console.error('Error:', e.message);
    } finally {
        await pool.end();
    }
}

analyzeQuality();
