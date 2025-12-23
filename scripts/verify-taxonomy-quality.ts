import { pool } from '../app/lib/db';

async function verifyTaxonomy() {
    console.log('--- Verifying Taxonomy Quality ---');
    try {
        const res = await pool.query(`
            SELECT name, tagline, v2_category 
            FROM tools 
            WHERE (name ILIKE '%travel%' OR tagline ILIKE '%travel%' OR description ILIKE '%travel%')
            OR (name ILIKE '%hotel%' OR tagline ILIKE '%hotel%' OR description ILIKE '%hotel%')
            LIMIT 10;
        `);

        console.table(res.rows);

        const counts = await pool.query(`
            SELECT v2_category, count(*) 
            FROM tools 
            GROUP BY v2_category;
        `);
        console.table(counts.rows);

    } catch (err) {
        console.error(err);
    } finally {
        await pool.end();
    }
}

verifyTaxonomy();
