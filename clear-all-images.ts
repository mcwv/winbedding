import { Pool } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const pool = new Pool({
  user: process.env.PGUSER,
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  password: process.env.PGPASSWORD,
  port: parseInt(process.env.PGPORT || '61038')
});

async function clearAllImages() {
  const client = await pool.connect();

  try {
    console.log('\n🧹 Clearing ALL logo_url and screenshot_url from database...\n');

    const result = await client.query(`
      UPDATE tools
      SET
        logo_url = NULL,
        screenshot_url = NULL
      WHERE logo_url IS NOT NULL OR screenshot_url IS NOT NULL
      RETURNING id, name
    `);

    console.log(`✅ Cleared image URLs from ${result.rowCount} tools`);
    console.log('📝 All tools will now use favicon fallback\n');

    if (result.rows.length > 0) {
      console.log('Updated tools:');
      result.rows.forEach(row => {
        console.log(`  - ${row.name}`);
      });
    }

  } catch (err) {
    console.error("❌ Error:", err instanceof Error ? err.message : String(err));
  } finally {
    client.release();
    await pool.end();
    console.log('\n🏁 Done.\n');
  }
}

clearAllImages();
