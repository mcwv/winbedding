const { Pool } = require('pg');

const pool = new Pool({
    connectionString: 'postgresql://ai_tools_silenttorn:767023df83bd7e678417793dfbbc2c1e4c5cb26c@h7h-gj.h.filess.io:61038/ai_tools_silenttorn',
    ssl: false
});

async function analyzeQuality() {
    try {
        await pool.query('SET search_path TO ai_tools_silenttorn');

        console.log('📊 DATA QUALITY ANALYSIS\n');
        console.log('='.repeat(50));

        // Total count
        const total = await pool.query('SELECT COUNT(*) as count FROM tools');
        console.log(`\n📦 Total tools: ${total.rows[0].count}`);

        // Tools with valid descriptions (more than 50 chars)
        const withDesc = await pool.query(`
      SELECT COUNT(*) as count FROM tools 
      WHERE COALESCE(description, '') != '' 
        AND LENGTH(description) > 50
    `);
        console.log(`\n✅ With good description (>50 chars): ${withDesc.rows[0].count}`);

        // Tools with short descriptions
        const shortDesc = await pool.query(`
      SELECT COUNT(*) as count FROM tools 
      WHERE COALESCE(description, '') = '' 
         OR LENGTH(description) <= 50
    `);
        console.log(`⚠️  With short/no description: ${shortDesc.rows[0].count}`);

        // Tools with valid visit URLs
        const withUrl = await pool.query(`
      SELECT COUNT(*) as count FROM tools 
      WHERE visit_url IS NOT NULL 
        AND visit_url != '' 
        AND visit_url LIKE 'http%'
    `);
        console.log(`\n🔗 With valid URL: ${withUrl.rows[0].count}`);

        // Tools without valid visit URLs
        const noUrl = await pool.query(`
      SELECT COUNT(*) as count FROM tools 
      WHERE visit_url IS NULL 
         OR visit_url = '' 
         OR visit_url NOT LIKE 'http%'
    `);
        console.log(`❌ Without valid URL: ${noUrl.rows[0].count}`);

        // Tools with ratings > 0
        const withRating = await pool.query(`
      SELECT COUNT(*) as count FROM tools WHERE rating > 0
    `);
        console.log(`\n⭐ With rating > 0: ${withRating.rows[0].count}`);

        // Tools with likes > 0
        const withLikes = await pool.query(`
      SELECT COUNT(*) as count FROM tools WHERE likes > 0
    `);
        console.log(`❤️  With likes > 0: ${withLikes.rows[0].count}`);

        // High quality: has description, url, and either rating or likes
        const highQuality = await pool.query(`
      SELECT COUNT(*) as count FROM tools 
      WHERE visit_url IS NOT NULL 
        AND visit_url LIKE 'http%'
        AND COALESCE(description, '') != '' 
        AND LENGTH(description) > 50
        AND (rating > 0 OR likes > 0)
    `);
        console.log(`\n🏆 HIGH QUALITY (good desc + URL + engagement): ${highQuality.rows[0].count}`);

        // Medium quality: has description and url
        const mediumQuality = await pool.query(`
      SELECT COUNT(*) as count FROM tools 
      WHERE visit_url IS NOT NULL 
        AND visit_url LIKE 'http%'
        AND COALESCE(description, '') != '' 
        AND LENGTH(description) > 50
        AND rating = 0 
        AND likes = 0
    `);
        console.log(`📗 MEDIUM QUALITY (good desc + URL, no engagement): ${mediumQuality.rows[0].count}`);

        // Low quality: minimal info
        const lowQuality = await pool.query(`
      SELECT COUNT(*) as count FROM tools 
      WHERE (visit_url IS NULL OR visit_url = '' OR visit_url NOT LIKE 'http%')
         OR (COALESCE(description, '') = '' OR LENGTH(description) <= 50)
    `);
        console.log(`🔻 LOW QUALITY (missing URL or description): ${lowQuality.rows[0].count}`);

        // Sample of low quality entries
        console.log('\n\n📋 SAMPLE LOW QUALITY ENTRIES:');
        console.log('-'.repeat(50));
        const lowQualitySample = await pool.query(`
      SELECT name, 
             LENGTH(COALESCE(description, '')) as desc_len, 
             visit_url IS NOT NULL AND visit_url LIKE 'http%' as has_url,
             rating,
             likes
      FROM tools 
      WHERE (visit_url IS NULL OR visit_url = '' OR visit_url NOT LIKE 'http%')
         OR (COALESCE(description, '') = '' OR LENGTH(description) <= 50)
      LIMIT 10
    `);
        lowQualitySample.rows.forEach(row => {
            console.log(`  - ${row.name} | desc: ${row.desc_len} chars | URL: ${row.has_url} | rating: ${row.rating} | likes: ${row.likes}`);
        });

        // By source
        console.log('\n\n📊 QUALITY BY SOURCE:');
        console.log('-'.repeat(50));
        const bySource = await pool.query(`
      SELECT 
        source,
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE LENGTH(COALESCE(description, '')) > 50) as with_desc,
        COUNT(*) FILTER (WHERE rating > 0 OR likes > 0) as with_engagement
      FROM tools
      GROUP BY source
    `);
        bySource.rows.forEach(row => {
            console.log(`  ${row.source}: ${row.total} total | ${row.with_desc} with desc | ${row.with_engagement} with engagement`);
        });

    } catch (e) {
        console.error('Error:', e.message);
    } finally {
        await pool.end();
    }
}

analyzeQuality();
