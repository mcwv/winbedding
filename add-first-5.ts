import { Pool } from 'pg';
import * as dotenv from 'dotenv';
import { readFileSync } from 'fs';

dotenv.config({ path: '.env.local' });

// Load the JSON I already generated for you
const toolsData = JSON.parse(readFileSync('data/first5.json', 'utf-8'));

const pool = new Pool({
  user: process.env.PGUSER,
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  password: process.env.PGPASSWORD,
  port: parseInt(process.env.PGPORT || '61038')
});

async function loadData() {
  const client = await pool.connect();
  console.log("🚀 Connected to filess.io...");

  try {
    for (const tool of toolsData) {
      console.log(`📝 Processing: ${tool.core_identity.name}...`);

      const query = `
        UPDATE tools 
        SET 
          tagline = $1, 
          description = $2, 
          logo_url = $3,
          operating_system = $4,
          platforms = $5,
          tags = $6,
          pros = $7,
          cons = $8,
          verdict = $9,
          best_for = $10,
          not_recommended_for = $11
        WHERE name = $12
      `;

      // Simplified values mapping based on your schema.md
      const values = [
        tool.core_identity.tagline,
        tool.core_identity.full_description, // Mapping 'full' to 'description'
        tool.core_identity.logo_url,
        tool.core_identity.operating_systems, // matches TEXT[] column
        tool.core_identity.platforms,        // matches TEXT[] column
        tool.categorization.tags,            // matches TEXT[] column
        tool.review_and_rating.pros,         // matches TEXT[] column
        tool.review_and_rating.cons,         // matches TEXT[] column
        tool.review_and_rating.verdict,
        tool.review_and_rating.best_for,
        tool.review_and_rating.not_recommended_for,
        tool.core_identity.name
      ];

      const res = await client.query(query, values);
      
      if (res.rowCount === 0) {
        console.warn(`⚠️ Warning: Tool '${tool.core_identity.name}' was not found in your DB to update.`);
      } else {
        console.log(`✅ ${tool.core_identity.name} updated!`);
      }
    }
  } catch (err) {
    console.error("❌ SQL Error:", err instanceof Error ? err.message : String(err));
  } finally {
    client.release();
    await pool.end();
    console.log("🏁 Done.");
  }
}

loadData();