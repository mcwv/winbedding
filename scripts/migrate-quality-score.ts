import { pool } from '../app/lib/db';

async function migrateQualityScore() {
    console.log('--- Executing Quality Score Migration (Phase 3) ---');

    try {
        // 1. Add quality_score column
        console.log('Adding quality_score column...');
        await pool.query(`
            ALTER TABLE tools ADD COLUMN IF NOT EXISTS quality_score INT DEFAULT 0;
        `);

        // 2. Create the Scoring Function
        console.log('Creating calculation function...');
        await pool.query(`
            CREATE OR REPLACE FUNCTION calculate_quality_score() RETURNS TRIGGER AS $$
            BEGIN
              NEW.quality_score := (
                (CASE WHEN NEW.logo_url IS NOT NULL AND length(NEW.logo_url) > 5 THEN 20 ELSE 0 END) +
                (CASE WHEN NEW.screenshot_url IS NOT NULL AND length(NEW.screenshot_url) > 5 THEN 30 ELSE 0 END) +
                (CASE WHEN NEW.description IS NOT NULL AND length(NEW.description) > 50 THEN 10 ELSE 0 END) +
                (CASE 
                    WHEN NEW.tracking_metadata->'scraped_content'->>'clean_text' IS NOT NULL 
                         AND length(NEW.tracking_metadata->'scraped_content'->>'clean_text') > 200 
                         AND NEW.tracking_metadata->'scraped_content'->>'clean_text' NOT ILIKE '%Attempting...%'
                    THEN 40 
                    ELSE 0 
                END)
              );
              RETURN NEW;
            END;
            $$ LANGUAGE plpgsql;
        `);

        // 3. Attach the Trigger
        console.log('Attaching trigger...');
        await pool.query(`
            DROP TRIGGER IF EXISTS update_quality_score_trigger ON tools;
            CREATE TRIGGER update_quality_score_trigger
            BEFORE INSERT OR UPDATE ON tools
            FOR EACH ROW
            EXECUTE FUNCTION calculate_quality_score();
        `);

        // 4. Initial update to calculate scores for existing data
        console.log('Calculating initial scores for existing tools...');
        await pool.query(`
            UPDATE tools SET quality_score = (
                (CASE WHEN logo_url IS NOT NULL AND length(logo_url) > 5 THEN 20 ELSE 0 END) +
                (CASE WHEN screenshot_url IS NOT NULL AND length(screenshot_url) > 5 THEN 30 ELSE 0 END) +
                (CASE WHEN description IS NOT NULL AND length(description) > 50 THEN 10 ELSE 0 END) +
                (CASE 
                    WHEN tracking_metadata->'scraped_content'->>'clean_text' IS NOT NULL 
                         AND length(tracking_metadata->'scraped_content'->>'clean_text') > 200 
                         AND tracking_metadata->'scraped_content'->>'clean_text' NOT ILIKE '%Attempting...%'
                    THEN 40 
                    ELSE 0 
                END)
            );
        `);

        // 5. Refresh the view
        console.log('Refreshing published_tools view...');
        await pool.query(`
            DROP VIEW IF EXISTS published_tools CASCADE;
            CREATE VIEW published_tools AS
            SELECT *
            FROM tools
            WHERE is_published = true;
        `);

        // 6. Restore Permissions
        console.log('Restoring permissions...');
        await pool.query(`
            GRANT SELECT ON published_tools TO anon;
            GRANT SELECT ON published_tools TO authenticated;
            GRANT SELECT ON published_tools TO service_role;
        `);

        console.log('Quality score migration completed successfully.');

    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        await pool.end();
    }
}

migrateQualityScore();
