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
        console.log('Connected to database\n');

        const jsonPath = path.resolve('c:/Users/miles/Desktop/neo-bed/data/first5.json');
        const tools = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
        console.log(`Loaded ${tools.length} tools from first5.json\n`);

        for (const data of tools) {
            const name = data.core_identity.name;
            console.log(`Processing: ${name}`);

            // Step 1: Find tool by name or URL
            const findRes = await client.query(
                'SELECT id FROM tools WHERE name = $1 OR website_url = $2',
                [name, data.core_identity.website_url]
            );

            if (findRes.rows.length === 0) {
                console.log(`  ⚠️ Not found in DB, skipping\n`);
                continue;
            }

            const toolId = findRes.rows[0].id;
            console.log(`  Found tool ID: ${toolId}`);

            // Step 2: Find category ID
            const catName = data.categorization.primary_category;
            let catRes = await client.query('SELECT id FROM categories WHERE name = $1', [catName]);
            let catId = catRes.rows.length > 0 ? catRes.rows[0].id : null;

            if (!catId) {
                console.log(`  ⚠️ Category "${catName}" not found, using default`);
                catRes = await client.query("SELECT id FROM categories WHERE slug = 'other'");
                catId = catRes.rows[0]?.id || 21;
            }

            // Step 3: Update CORE fields
            await client.query(`
        UPDATE tools SET
          description = $1,
          tagline = $2,
          logo_url = $3,
          category_id = $4,
          subcategory = $5,
          tags = $6,
          updated_at = NOW()
        WHERE id = $7
      `, [
                data.core_identity.full_description,
                data.core_identity.tagline,
                data.core_identity.logo_url,
                catId,
                data.categorization.subcategory,
                data.categorization.tags,
                toolId
            ]);
            console.log(`  ✓ Core fields updated`);

            // Step 4: Update PRICING fields
            const pricing = data.pricing_and_plans;
            await client.query(`
        UPDATE tools SET
          pricing_model = $1,
          price_amount = $2,
          has_free_tier = $3,
          has_trial = $4
        WHERE id = $5
      `, [
                pricing.model.toLowerCase(),
                pricing.starting_price,
                pricing.has_free_tier,
                pricing.has_free_trial,
                toolId
            ]);
            console.log(`  ✓ Pricing updated`);

            // Step 5: Update EXPERTISE fields
            const exp = data.expertise_signals;

            // Map JSON values to DB constraints
            const learningCurveMap = { 'low': 'easy', 'moderate': 'moderate', 'high': 'steep' };
            const mappedLearning = learningCurveMap[exp.learning_curve.toLowerCase()] || 'moderate';
            const mappedSkill = exp.skill_level.toLowerCase();

            await client.query(`
        UPDATE tools SET
          skill_level = $1,
          learning_curve = $2,
          integrations = $3,
          api_available = $4,
          documentation_quality = $5,
          support_options = $6,
          alternatives = $7
        WHERE id = $8
      `, [
                mappedSkill,
                mappedLearning,
                exp.integrations,
                exp.api_available,
                exp.documentation_quality.toLowerCase(),
                exp.support_options,
                exp.alternatives,
                toolId
            ]);
            console.log(`  ✓ Expertise updated`);

            // Step 6: Update TRUST fields
            const trust = data.trust_and_authority;
            await client.query(`
        UPDATE tools SET
          company_name = $1,
          company_founded = $2,
          employee_count = $3,
          funding_raised = $4,
          notable_customers = $5,
          has_privacy_policy = $6,
          gdpr_compliant = $7,
          security_features = $8
        WHERE id = $9
      `, [
                trust.company_name,
                trust.year_founded,
                trust.employee_count,
                trust.funding_raised === 'null' ? null : trust.funding_raised,
                trust.notable_customers,
                trust.has_privacy_policy,
                trust.gdpr_compliant,
                trust.security_features,
                toolId
            ]);
            console.log(`  ✓ Trust fields updated`);

            // Step 7: Update REVIEW fields
            const review = data.review_and_rating;
            await client.query(`
        UPDATE tools SET
          rating_value = $1,
          pros = $2,
          cons = $3,
          best_for = $4,
          not_recommended_for = $5,
          verdict = $6,
          quality_score = 95,
          is_verified = TRUE
        WHERE id = $7
      `, [
                review.rating_score,
                review.pros,
                review.cons,
                review.best_for,
                review.not_recommended_for,
                review.verdict,
                toolId
            ]);
            console.log(`  ✓ Review fields updated`);

            console.log(`  ✅ ${name} fully updated!\n`);
        }

        console.log('All done!');

    } catch (err) {
        console.error('Error:', err.message);
        if (err.code) console.error('Code:', err.code);
    } finally {
        client.release();
        pool.end();
    }
}

main();
