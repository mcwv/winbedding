const pg = require('pg');
const { Pool } = pg;

// Source: Filess.io
const sourcePool = new Pool({
    connectionString: 'postgresql://ai_tools_silenttorn:767023df83bd7e678417793dfbbc2c1e4c5cb26c@h7h-gj.h.filess.io:61038/ai_tools_silenttorn',
    ssl: false
});

// Destination: Supabase
const destPool = new Pool({
    connectionString: 'postgresql://postgres.idfykpdhfmuqkdnfjgqw:E1SqIqRqwhwg20@aws-1-eu-west-1.pooler.supabase.com:6543/postgres',
    ssl: { rejectUnauthorized: false }
});

async function main() {
    const sourceClient = await sourcePool.connect();
    const destClient = await destPool.connect();

    try {
        await sourceClient.query('SET search_path TO ai_tools_silenttorn');
        console.log('Connected to both databases');

        // Get all tools from Filess.io
        const result = await sourceClient.query('SELECT * FROM tools');
        const tools = result.rows;
        console.log(`Found ${tools.length} tools to migrate`);

        let migrated = 0;
        let errors = 0;

        for (const tool of tools) {
            try {
                await destClient.query(`
          INSERT INTO tools (
            name, slug, tagline, description, website_url, logo_url, screenshot_url,
            category_id, subcategory, tags, use_cases,
            pricing_model, price_amount, price_currency, has_free_tier, has_trial, trial_days,
            rating_value, rating_count, review_count,
            operating_system, platforms, features,
            affiliate_url, affiliate_network, commission_rate, has_affiliate_link,
            hands_on_review, review_date, tested_by, testing_methodology,
            pros, cons, verdict, experience_score,
            target_audience, skill_level, learning_curve, documentation_quality,
            support_options, integrations, api_available, alternatives,
            company_name, company_url, company_founded, employee_count, funding_raised,
            notable_customers, press_mentions, awards,
            g2_rating, capterra_rating, trustpilot_rating, product_hunt_rank,
            has_privacy_policy, gdpr_compliant, soc2_certified, ssl_enabled,
            data_retention_policy, security_features, uptime_sla, last_security_audit, transparency_score,
            quick_start_guide, video_tutorial_url, faq, comparison_notes,
            best_for, not_recommended_for, tips_and_tricks, common_use_cases, success_stories,
            last_major_update, update_frequency, changelog_url, roadmap_url,
            our_last_review_update, content_version,
            is_verified, is_featured, is_published, quality_score, data_source,
            created_at, updated_at, last_verified_at
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7,
            $8, $9, $10, $11,
            $12, $13, $14, $15, $16, $17,
            $18, $19, $20,
            $21, $22, $23,
            $24, $25, $26, $27,
            $28, $29, $30, $31,
            $32, $33, $34, $35,
            $36, $37, $38, $39,
            $40, $41, $42, $43,
            $44, $45, $46, $47, $48,
            $49, $50, $51,
            $52, $53, $54, $55,
            $56, $57, $58, $59,
            $60, $61, $62, $63, $64,
            $65, $66, $67, $68,
            $69, $70, $71, $72, $73,
            $74, $75, $76, $77,
            $78, $79,
            $80, $81, $82, $83, $84,
            $85, $86, $87
          )
          ON CONFLICT (slug) DO NOTHING
        `, [
                    tool.name, tool.slug, tool.tagline, tool.description, tool.website_url, tool.logo_url, tool.screenshot_url,
                    tool.category_id, tool.subcategory, tool.tags, tool.use_cases,
                    tool.pricing_model, tool.price_amount, tool.price_currency, tool.has_free_tier, tool.has_trial, tool.trial_days,
                    tool.rating_value, tool.rating_count, tool.review_count,
                    tool.operating_system, tool.platforms, tool.features,
                    tool.affiliate_url, tool.affiliate_network, tool.commission_rate, tool.has_affiliate_link,
                    tool.hands_on_review, tool.review_date, tool.tested_by, tool.testing_methodology,
                    tool.pros, tool.cons, tool.verdict, tool.experience_score,
                    tool.target_audience, tool.skill_level, tool.learning_curve, tool.documentation_quality,
                    tool.support_options, tool.integrations, tool.api_available, tool.alternatives,
                    tool.company_name, tool.company_url, tool.company_founded, tool.employee_count, tool.funding_raised,
                    tool.notable_customers, tool.press_mentions, tool.awards,
                    tool.g2_rating, tool.capterra_rating, tool.trustpilot_rating, tool.product_hunt_rank,
                    tool.has_privacy_policy, tool.gdpr_compliant, tool.soc2_certified, tool.ssl_enabled,
                    tool.data_retention_policy, tool.security_features, tool.uptime_sla, tool.last_security_audit, tool.transparency_score,
                    tool.quick_start_guide, tool.video_tutorial_url, tool.faq, tool.comparison_notes,
                    tool.best_for, tool.not_recommended_for, tool.tips_and_tricks, tool.common_use_cases, tool.success_stories,
                    tool.last_major_update, tool.update_frequency, tool.changelog_url, tool.roadmap_url,
                    tool.our_last_review_update, tool.content_version,
                    tool.is_verified, tool.is_featured, tool.is_published, tool.quality_score, tool.data_source,
                    tool.created_at, tool.updated_at, tool.last_verified_at
                ]);
                migrated++;
                if (migrated % 100 === 0) {
                    console.log(`Migrated ${migrated}/${tools.length} tools...`);
                }
            } catch (err) {
                errors++;
                if (errors < 5) console.error(`Error on ${tool.name}: ${err.message}`);
            }
        }

        console.log(`\n✅ Migration complete! ${migrated} tools migrated, ${errors} errors`);

    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        sourceClient.release();
        destClient.release();
        sourcePool.end();
        destPool.end();
    }
}

main();
