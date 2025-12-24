import pg from 'pg';
const { Pool } = pg;
const connectionString = process.env.DATABASE_URL || 'postgresql://postgres.idfykpdhfmuqkdnfjgqw:E1SqIqRqwhwg20@aws-1-eu-west-1.pooler.supabase.com:6543/postgres';

async function updateTool() {
    const pool = new Pool({ connectionString, ssl: false });
    try {
        console.log('Fixing Talently.ai category...');
        await pool.query("UPDATE tools SET v2_category = 'Education & Learning' WHERE name = 'Talently.ai'");
        console.log('Success.');
    } catch (e) {
        console.error('Error:', e);
    } finally {
        await pool.end();
    }
}

updateTool();
