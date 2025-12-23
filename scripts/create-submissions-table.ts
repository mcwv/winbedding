import { pool } from '../app/lib/db';

async function createSubmissionsTable() {
    console.log('--- Creating Tool Submissions Table ---');

    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS tool_submissions (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                website_url TEXT NOT NULL,
                contact_email VARCHAR(255) NOT NULL,
                description TEXT NOT NULL,
                logo_url TEXT,
                screenshot_url TEXT,
                video_url TEXT,
                status VARCHAR(50) DEFAULT 'pending',
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        `);

        console.log('Table tool_submissions created successfully.');

    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        await pool.end();
    }
}

createSubmissionsTable();
