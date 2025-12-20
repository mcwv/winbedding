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

async function clearBadLogos() {
  const client = await pool.connect();

  try {
    // Clear logo_url for the 5 enriched tools so favicon fallback works
    const result = await client.query(`
      UPDATE tools
      SET logo_url = NULL
      WHERE name IN ('10Web', '123RF AI Image Generator', '15 Minute Plan', '16x Prompt', '2short.ai')
      RETURNING name, logo_url
    `);

    console.log('\n🧹 Cleared bad logo URLs for favicon fallback:\n');
    result.rows.forEach(row => {
      console.log(`  ✅ ${row.name} - logo_url now: ${row.logo_url || 'NULL (will use favicon)'}`);
    });

  } catch (err) {
    console.error("Error:", err instanceof Error ? err.message : String(err));
  } finally {
    client.release();
    await pool.end();
  }
}

clearBadLogos();
