const { Pool } = require('pg');

const pool = new Pool({
    connectionString: 'postgresql://ai_tools_silenttorn:767023df83bd7e678417793dfbbc2c1e4c5cb26c@h7h-gj.h.filess.io:61038/ai_tools_silenttorn',
    ssl: false
});

async function findCopyAI() {
    await pool.query('SET search_path TO ai_tools_silenttorn');

    // Check specifically for "Copy AI" entries
    const result = await pool.query(`
    SELECT id, name, slug, source
    FROM tools 
    WHERE name = 'Copy AI' OR name = 'CopyAI' OR name = 'Copy.AI'
  `);

    console.log('Exact matches for Copy AI:');
    console.log(JSON.stringify(result.rows, null, 2));

    // Check total by source  
    const sources = await pool.query(`SELECT source, COUNT(*) as cnt FROM tools GROUP BY source`);
    console.log('\nBy source:', sources.rows);

    // Count low quality
    const lowQ = await pool.query(`
    SELECT COUNT(*) as cnt FROM tools 
    WHERE (visit_url IS NULL OR visit_url = '' OR visit_url NOT LIKE 'http%')
  `);
    console.log('\nTools missing URL:', lowQ.rows[0].cnt);

    await pool.end();
}

findCopyAI();
