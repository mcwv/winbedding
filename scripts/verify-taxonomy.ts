import { pool } from '../app/lib/db';

async function verifyTaxonomy() {
    console.log('--- Final Taxonomy Verification ---');

    try {
        const res = await pool.query(`
      SELECT v2_category, count(*) as count
      FROM tools
      GROUP BY v2_category
      ORDER BY count DESC;
    `);

        console.log('New Category Distribution:');
        res.rows.forEach(row => {
            console.log(`- ${row.v2_category || 'NULL'}: ${row.count}`);
        });

        const totalRes = await pool.query('SELECT count(*) FROM tools');
        console.log(`\nTotal Tools Remaining: ${totalRes.rows[0].count}`);

    } catch (err) {
        console.error('Verification failed:', err);
    } finally {
        await pool.end();
    }
}

verifyTaxonomy();
