
const fs = require('fs');
const path = require('path');
const pg = require('pg');
const { Pool } = pg;

const connectionString = process.env.DATABASE_URL ||
    'postgresql://ai_tools_silenttorn:767023df83bd7e678417793dfbbc2c1e4c5cb26c@h7h-gj.h.filess.io:61038/ai_tools_silenttorn';
const SCHEMA_NAME = 'ai_tools_silenttorn';

const pool = new Pool({ connectionString, ssl: false });

async function main() {
    const client = await pool.connect();
    try {
        await client.query(`SET search_path TO ${SCHEMA_NAME}`);
        console.log('Connected to database');

        const jsonPath = path.resolve('C:/Users/miles/Desktop/neo-bed/first5.json');
        const tools = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

        // Process just one tool for debugging
        const data = tools[0]; // 10Web
        console.log(`Debugging update for: ${data.core_identity.name}`);

        // Simplified query - Core fields only
        const updateQuery = `
        UPDATE tools SET
          description = $1::text,
          tagline = $2::varchar,
          operating_system = $3::text[],
          updated_at = NOW()
        WHERE name = $4::varchar
        RETURNING id;
      `;

        const values = [
            data.core_identity.full_description,
            data.core_identity.tagline,
            data.core_identity.operating_systems, // Array
            data.core_identity.name
        ];

        console.log('Values:', JSON.stringify(values, null, 2));

        const res = await client.query(updateQuery, values);
        console.log('Update result:', res.rows[0]);

    } catch (err) {
        console.error('Error:', err.message);
        if (err.code) console.error('Error Code:', err.code);
        if (err.position) console.error('Error Position:', err.position);
    } finally {
        client.release();
        pool.end();
    }
}

main();
