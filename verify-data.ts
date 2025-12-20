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

async function verifyData() {
  const client = await pool.connect();

  try {
    const result = await client.query(`
      SELECT
        name,
        tagline,
        LEFT(description, 100) as description_preview,
        tags,
        pros,
        cons,
        verdict,
        best_for
      FROM tools
      WHERE name IN ('10Web', '123RF AI Image Generator', '16x Prompt', '2short.ai')
      ORDER BY name
    `);

    console.log('\n📊 ENRICHED DATA VERIFICATION\n');
    console.log(`Found ${result.rows.length} enriched tools:\n`);

    result.rows.forEach((row, index) => {
      console.log(`\n${'='.repeat(80)}`);
      console.log(`${index + 1}. ${row.name}`);
      console.log(`${'='.repeat(80)}`);
      console.log(`\n🏷️  Tagline:\n   ${row.tagline}`);
      console.log(`\n📝 Description:\n   ${row.description_preview}...`);
      console.log(`\n🏷️  Tags (${row.tags?.length || 0}):\n   ${row.tags?.join(', ') || 'None'}`);
      console.log(`\n✅ Pros (${row.pros?.length || 0}):`);
      row.pros?.forEach((pro: string) => console.log(`   • ${pro}`));
      console.log(`\n❌ Cons (${row.cons?.length || 0}):`);
      row.cons?.forEach((con: string) => console.log(`   • ${con}`));
      console.log(`\n⚖️  Verdict:\n   ${row.verdict}`);
      console.log(`\n🎯 Best For:\n   ${row.best_for}`);
    });

    console.log(`\n${'='.repeat(80)}\n`);
  } catch (err) {
    console.error("Error:", err instanceof Error ? err.message : String(err));
  } finally {
    client.release();
    await pool.end();
  }
}

verifyData();
