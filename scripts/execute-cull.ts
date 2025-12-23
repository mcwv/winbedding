import { pool } from '../app/lib/db';

async function executeCull() {
    console.log('--- Executing Auto-Cull ---');

    try {
        // 1. Get IDs of tools to be deleted for double verification
        const targetRes = await pool.query(`
      SELECT id FROM tools 
      WHERE (description IS NULL OR length(description) < 60)
        AND (tagline IS NULL OR length(tagline) < 30)
        AND (logo_url IS NULL OR logo_url = '')
        AND (screenshot_url IS NULL OR screenshot_url = '');
    `);

        const count = targetRes.rows.length;
        console.log(`Targeting ${count} tools for removal.`);

        if (count === 0) {
            console.log('No tools match the cull criteria. Skipping.');
            return;
        }

        // 2. Perform the deletion
        const delRes = await pool.query(`
      DELETE FROM tools 
      WHERE (description IS NULL OR length(description) < 60)
        AND (tagline IS NULL OR length(tagline) < 30)
        AND (logo_url IS NULL OR logo_url = '')
        AND (screenshot_url IS NULL OR screenshot_url = '');
    `);

        console.log(`Successfully deleted ${delRes.rowCount} tools.`);

    } catch (err) {
        console.error('Cull execution failed:', err);
    } finally {
        await pool.end();
    }
}

executeCull();
