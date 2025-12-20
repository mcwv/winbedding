const { Pool } = require('pg');

const pool = new Pool({
    connectionString: 'postgresql://ai_tools_silenttorn:767023df83bd7e678417793dfbbc2c1e4c5cb26c@h7h-gj.h.filess.io:61038/ai_tools_silenttorn',
    ssl: false
});

async function check() {
    try {
        await pool.query('SET search_path TO ai_tools_silenttorn');
        const count = await pool.query('SELECT COUNT(*) as count FROM tools');
        console.log('Tools in database:', count.rows[0].count);

        const sample = await pool.query('SELECT name, mapped_category, visit_url FROM tools LIMIT 5');
        console.log('\nSample tools:');
        sample.rows.forEach(row => {
            console.log(`  - ${row.name} (${row.mapped_category})`);
        });
    } catch (e) {
        console.error('Error:', e.message);
    } finally {
        await pool.end();
    }
}

check();
