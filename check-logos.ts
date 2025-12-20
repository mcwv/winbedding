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

async function checkLogos() {
  const client = await pool.connect();
  try {
    const result = await client.query(`
      SELECT name, logo_url, screenshot_url
      FROM tools
      WHERE name IN ('10Web', '123RF AI Image Generator', '15 Minute Plan')
      ORDER BY name
    `);

    console.log('\n🖼️  LOGO & SCREENSHOT CHECK:\n');
    result.rows.forEach(row => {
      console.log(`\n${row.name}:`);
      console.log(`  Logo URL: ${row.logo_url || '(empty)'}`);
      console.log(`  Screenshot URL: ${row.screenshot_url || '(empty)'}`);
    });
  } catch (err) {
    console.error("Error:", err instanceof Error ? err.message : String(err));
  } finally {
    client.release();
    await pool.end();
  }
}

checkLogos();
