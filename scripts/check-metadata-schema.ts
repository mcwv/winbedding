import pg from 'pg';

const { Pool } = pg;
const connectionString = process.env.DATABASE_URL || 'postgresql://postgres.idfykpdhfmuqkdnfjgqw:E1SqIqRqwhwg20@aws-1-eu-west-1.pooler.supabase.com:6543/postgres';

async function checkSchema() {
    const pool = new Pool({ connectionString });
    try {
        // List all columns in the tools table
        const columnsResult = await pool.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'tools'
            ORDER BY ordinal_position
        `);
        console.log('Tools table columns:');
        columnsResult.rows.forEach(row => {
            console.log(`  - ${row.column_name} (${row.data_type})`);
        });
        process.exit(0);
        const dummy = null;
    } catch (e) {
        console.error('Error:', e);
    } finally {
        await pool.end();
    }
}

checkSchema();
