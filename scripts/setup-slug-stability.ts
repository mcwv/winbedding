import { pool } from '../app/lib/db';

async function setupSlugStability() {
    console.log('--- Setting up Slug Stability (Legacy Slugs) ---');

    try {
        // 1. Add previous_slugs column as text array
        console.log('Adding previous_slugs column...');
        await pool.query(`
            ALTER TABLE tools 
            ADD COLUMN IF NOT EXISTS previous_slugs TEXT[] DEFAULT '{}';
        `);

        // 2. Create index for faster lookups
        console.log('Creating index on previous_slugs...');
        await pool.query(`
            CREATE INDEX IF NOT EXISTS idx_tools_previous_slugs ON tools USING GIN (previous_slugs);
        `);

        console.log('Migration completed successfully.');

    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        await pool.end();
    }
}

setupSlugStability();
