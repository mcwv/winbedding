const pg = require('pg');
const { Pool } = pg;

const connectionString = 'postgresql://postgres.idfykpdhfmuqkdnfjgqw:E1SqIqRqwhwg20@aws-1-eu-west-1.pooler.supabase.com:6543/postgres';

const pool = new Pool({
    connectionString,
    ssl: false,
    max: 5,
});

async function deepDive() {
    console.log('--- Deep Dive Analysis ---');
    try {
        // 1. Pricing Model Distribution
        const pricingRes = await pool.query(`
            SELECT pricing_model, count(*) 
            FROM tools 
            GROUP BY pricing_model 
            ORDER BY count DESC
        `);
        console.log('\n--- Pricing Model Distribution ---');
        console.table(pricingRes.rows);

        // 2. Rating Value Sample
        const ratingRes = await pool.query(`
            SELECT rating_value, count(*) 
            FROM tools 
            WHERE rating_value IS NOT NULL 
            GROUP BY rating_value 
            LIMIT 10
        `);
        console.log('\n--- Rating Value Sample (Counts) ---');
        console.table(ratingRes.rows);

        // 3. Quality Score Calculation / Source check
        const qualityRes = await pool.query(`
            SELECT quality_score, count(*) 
            FROM tools 
            GROUP BY quality_score 
            ORDER BY quality_score DESC 
            LIMIT 15
        `);
        console.log('\n--- Quality Score Distribution (Top 15) ---');
        console.table(qualityRes.rows);

        // 4. Tags vs V2 Tags
        const tagsRes = await pool.query(`
            SELECT 
                count(*) FILTER (WHERE tags IS NOT NULL AND tags != '' AND tags != '[]') as has_tags,
                count(*) FILTER (WHERE v2_tags IS NOT NULL AND v2_tags != '' AND v2_tags != '[]') as has_v2_tags
            FROM tools
        `);
        console.log('\n--- Tags Population ---');
        console.table(tagsRes.rows);

    } catch (err) {
        console.error(err);
    } finally {
        await pool.end();
    }
}

deepDive();
