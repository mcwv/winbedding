const { Pool } = require('pg');

const pool = new Pool({
    connectionString: 'postgresql://ai_tools_silenttorn:767023df83bd7e678417793dfbbc2c1e4c5cb26c@h7h-gj.h.filess.io:61038/ai_tools_silenttorn',
    ssl: false
});

async function compare() {
    await pool.query('SET search_path TO ai_tools_silenttorn');

    // Quality by source
    const q = await pool.query(`
    SELECT 
      source,
      COUNT(*) as total,
      COUNT(*) FILTER (WHERE visit_url LIKE 'http%') as has_url,
      COUNT(*) FILTER (WHERE LENGTH(COALESCE(description, '')) > 50) as has_desc
    FROM tools GROUP BY source
  `);

    console.log('QUALITY BY SOURCE:');
    q.rows.forEach(r => {
        console.log(`${r.source}: ${r.total} total, ${r.has_url} with URL (${Math.round(r.has_url / r.total * 100)}%), ${r.has_desc} with desc (${Math.round(r.has_desc / r.total * 100)}%)`);
    });

    // Unique to bedwinning
    const uniqueB = await pool.query(`
    SELECT COUNT(DISTINCT LOWER(name)) as cnt FROM tools t1
    WHERE source = 'bedwinning'
    AND NOT EXISTS (
      SELECT 1 FROM tools t2 
      WHERE t2.source = 'strapi' AND LOWER(t2.name) = LOWER(t1.name)
    )
  `);
    console.log(`\nUnique to Bedwinning: ${uniqueB.rows[0].cnt}`);

    // Unique to strapi  
    const uniqueS = await pool.query(`
    SELECT COUNT(DISTINCT LOWER(name)) as cnt FROM tools t1
    WHERE source = 'strapi'
    AND NOT EXISTS (
      SELECT 1 FROM tools t2 
      WHERE t2.source = 'bedwinning' AND LOWER(t2.name) = LOWER(t1.name)
    )
  `);
    console.log(`Unique to Strapi: ${uniqueS.rows[0].cnt}`);

    await pool.end();
}

compare();
