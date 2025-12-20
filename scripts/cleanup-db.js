const { Pool } = require('pg');

const pool = new Pool({
    connectionString: 'postgresql://ai_tools_silenttorn:767023df83bd7e678417793dfbbc2c1e4c5cb26c@h7h-gj.h.filess.io:61038/ai_tools_silenttorn',
    ssl: false
});

async function cleanup() {
    await pool.query('SET search_path TO ai_tools_silenttorn');

    console.log('🧹 DATABASE CLEANUP\n');
    console.log('='.repeat(50));

    // Before stats
    const before = await pool.query('SELECT COUNT(*) as cnt FROM tools');
    console.log(`\n📊 BEFORE: ${before.rows[0].cnt} total tools`);

    const bySourceBefore = await pool.query(`
    SELECT source, COUNT(*) as cnt FROM tools GROUP BY source ORDER BY cnt DESC
  `);
    console.log('By source:', bySourceBefore.rows.map(r => `${r.source}=${r.cnt}`).join(', '));

    // 1. Remove tools without valid URLs
    console.log('\n\n🔗 STEP 1: Remove tools without valid URLs...');
    const noUrl = await pool.query(`
    DELETE FROM tools 
    WHERE visit_url IS NULL OR visit_url = '' OR visit_url NOT LIKE 'http%'
    RETURNING id, name
  `);
    console.log(`   Removed ${noUrl.rowCount} tools without URLs`);

    // 2. Remove duplicates (keep the one with longer description)
    console.log('\n📋 STEP 2: Remove duplicates (keeping better quality)...');
    const duplicates = await pool.query(`
    WITH ranked AS (
      SELECT id, name, slug,
             LENGTH(COALESCE(description, '')) as desc_len,
             ROW_NUMBER() OVER (
               PARTITION BY LOWER(REGEXP_REPLACE(name, '[^a-zA-Z0-9]', '', 'g'))
               ORDER BY LENGTH(COALESCE(description, '')) DESC, rating DESC, likes DESC
             ) as rn
      FROM tools
    )
    DELETE FROM tools 
    WHERE id IN (SELECT id FROM ranked WHERE rn > 1)
    RETURNING id, name
  `);
    console.log(`   Removed ${duplicates.rowCount} duplicates`);

    // 3. Remove tools with very short descriptions AND no engagement
    console.log('\n📝 STEP 3: Remove ultra-low quality (short desc, no engagement)...');
    const ultraLow = await pool.query(`
    DELETE FROM tools 
    WHERE LENGTH(COALESCE(description, '')) < 30
      AND rating = 0 
      AND likes = 0
      AND review_count = 0
    RETURNING id, name
  `);
    console.log(`   Removed ${ultraLow.rowCount} ultra-low quality entries`);

    // After stats
    const after = await pool.query('SELECT COUNT(*) as cnt FROM tools');
    console.log(`\n\n📊 AFTER: ${after.rows[0].cnt} total tools`);

    const bySourceAfter = await pool.query(`
    SELECT source, COUNT(*) as cnt FROM tools GROUP BY source ORDER BY cnt DESC
  `);
    console.log('By source:', bySourceAfter.rows.map(r => `${r.source}=${r.cnt}`).join(', '));

    const removed = parseInt(before.rows[0].cnt) - parseInt(after.rows[0].cnt);
    console.log(`\n✅ Cleaned up ${removed} low-quality entries!`);
    console.log(`   Remaining: ${after.rows[0].cnt} curated tools`);

    await pool.end();
}

cleanup().catch(console.error);
