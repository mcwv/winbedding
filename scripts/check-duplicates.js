const { Pool } = require('pg');

const pool = new Pool({
    connectionString: 'postgresql://ai_tools_silenttorn:767023df83bd7e678417793dfbbc2c1e4c5cb26c@h7h-gj.h.filess.io:61038/ai_tools_silenttorn',
    ssl: false
});

async function checkDuplicates() {
    try {
        await pool.query('SET search_path TO ai_tools_silenttorn');

        // Find Copy AI entries
        console.log('🔍 Searching for "Copy AI" entries:\n');
        const copyai = await pool.query(`
      SELECT id, name, slug, short_description, description, source, visit_url
      FROM tools 
      WHERE LOWER(name) LIKE '%copy%ai%' OR LOWER(name) LIKE '%copyai%'
      ORDER BY source
    `);

        copyai.rows.forEach(row => {
            console.log(`ID: ${row.id}`);
            console.log(`Name: ${row.name}`);
            console.log(`Slug: ${row.slug}`);
            console.log(`Source: ${row.source}`);
            console.log(`URL: ${row.visit_url || 'NONE'}`);
            console.log(`Short Desc: ${(row.short_description || 'NONE').substring(0, 100)}...`);
            console.log(`Description: ${(row.description || 'NONE').substring(0, 100)}...`);
            console.log('-'.repeat(60));
        });

        // Count by source
        console.log('\n📊 TOOLS BY SOURCE:');
        const bySource = await pool.query(`
      SELECT source, COUNT(*) as count FROM tools GROUP BY source ORDER BY count DESC
    `);
        bySource.rows.forEach(row => {
            console.log(`  ${row.source}: ${row.count}`);
        });

        // Find tools without URL from strapi
        console.log('\n\n📋 STRAPI entries without valid URL:');
        const strapiNoUrl = await pool.query(`
      SELECT name, visit_url, short_description FROM tools 
      WHERE source = 'strapi' 
        AND (visit_url IS NULL OR visit_url = '' OR visit_url NOT LIKE 'http%')
      LIMIT 10
    `);
        console.log(`Count: ${strapiNoUrl.rowCount}`);
        strapiNoUrl.rows.forEach(row => {
            console.log(`  - ${row.name}: URL="${row.visit_url || 'null'}" | "${(row.short_description || '').substring(0, 50)}..."`);
        });

        // Tools with weird short descriptions (containing [2] or https)
        console.log('\n\n⚠️  ENTRIES with malformed short_description:');
        const malformed = await pool.query(`
      SELECT name, source, short_description FROM tools 
      WHERE short_description LIKE '%[%]%' OR short_description LIKE '%(http%'
      LIMIT 10
    `);
        console.log(`Count: ${malformed.rowCount}`);
        malformed.rows.forEach(row => {
            console.log(`  - ${row.name} (${row.source}): "${(row.short_description || '').substring(0, 80)}..."`);
        });

    } catch (e) {
        console.error('Error:', e.message);
    } finally {
        await pool.end();
    }
}

checkDuplicates();
