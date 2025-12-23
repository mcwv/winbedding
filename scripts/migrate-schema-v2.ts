import { pool } from '../app/lib/db';

async function executeMigration() {
    console.log('--- Executing Schema Migration (v2 Categories) ---');

    try {
        // 1. Add v2_category column
        console.log('Adding v2_category column...');
        await pool.query(`
      ALTER TABLE tools 
      ADD COLUMN IF NOT EXISTS v2_category VARCHAR(100);
    `);

        // 2. Add v2_tags column (string array)
        console.log('Adding v2_tags column...');
        await pool.query(`
      ALTER TABLE tools 
      ADD COLUMN IF NOT EXISTS v2_tags TEXT[];
    `);

        console.log('Schema migration completed successfully.');

    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        await pool.end();
    }
}

executeMigration();
