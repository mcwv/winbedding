import { Pool } from 'pg';
import * as dotenv from 'dotenv';
import { readFileSync } from 'fs';

dotenv.config({ path: '.env.local' });

const pool = new Pool({
  user: process.env.PGUSER,
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  password: process.env.PGPASSWORD,
  port: parseInt(process.env.PGPORT || '61038')
});

interface EnrichedTool {
  core_identity: {
    name: string;
    website_url?: string;
    tagline?: string;
    short_description?: string;
    full_description?: string;
    logo_url?: string;
    operating_systems?: string[];
    platforms?: string[];
  };
  categorization: {
    primary_category?: string;
    subcategory?: string;
    tags?: string[];
    target_audience?: string[];
    industry_verticals?: string[];
  };
  pricing_and_plans: {
    model?: string;
    starting_price?: number;
    currency?: string;
    has_free_tier?: boolean;
    has_free_trial?: boolean;
    trial_details?: string;
    pricing_summary?: string;
  };
  expertise_signals: {
    skill_level?: string;
    learning_curve?: string;
    integrations?: string[];
    api_available?: boolean;
    documentation_quality?: string;
    support_options?: string[];
    alternatives?: string[];
  };
  trust_and_authority: {
    company_name?: string;
    year_founded?: number;
    headquarters_city?: string;
    country?: string;
    employee_count?: string;
    funding_raised?: string;
    notable_customers?: string[];
    has_privacy_policy?: boolean;
    gdpr_compliant?: boolean;
    security_features?: string[];
  };
  review_and_rating: {
    rating_score?: number;
    pros?: string[];
    cons?: string[];
    best_for?: string;
    not_recommended_for?: string;
    verdict?: string;
  };
}

async function importEnrichedData(jsonFilePath: string) {
  const client = await pool.connect();

  let toolsData: EnrichedTool[];
  try {
    toolsData = JSON.parse(readFileSync(jsonFilePath, 'utf-8'));
  } catch (err) {
    console.error(`❌ Failed to read ${jsonFilePath}:`, err instanceof Error ? err.message : String(err));
    await pool.end();
    return;
  }

  console.log(`\n🚀 Importing enriched data from: ${jsonFilePath}`);
  console.log(`📊 Found ${toolsData.length} tools to process\n`);

  let successCount = 0;
  let notFoundCount = 0;
  let errorCount = 0;

  try {
    for (const tool of toolsData) {
      console.log(`📝 Processing: ${tool.core_identity.name}...`);

      // Parse trial days from trial_details (e.g., "7-day free trial" → 7)
      let trialDays: number | null = null;
      if (tool.pricing_and_plans.trial_details) {
        const match = tool.pricing_and_plans.trial_details.match(/(\d+)[-\s]day/i);
        if (match) trialDays = parseInt(match[1]);
      }

      // Normalize skill level and learning curve to match CHECK constraints
      const skillLevel = tool.expertise_signals.skill_level?.toLowerCase();
      const learningCurve = tool.expertise_signals.learning_curve?.toLowerCase() === 'low' ? 'easy'
        : tool.expertise_signals.learning_curve?.toLowerCase() === 'high' ? 'steep'
        : tool.expertise_signals.learning_curve?.toLowerCase();
      const docQuality = tool.expertise_signals.documentation_quality?.toLowerCase();

      // Normalize pricing model to match CHECK constraints
      let pricingModel = tool.pricing_and_plans.model?.toLowerCase();
      if (pricingModel === 'trial') pricingModel = 'freemium'; // Map 'trial' to valid value

      const query = `
        UPDATE tools
        SET
          -- Core Identity
          tagline = $1,
          description = $2,
          logo_url = $3,
          website_url = $4,

          -- Platform
          operating_system = $5,
          platforms = $6,

          -- Categorization
          subcategory = $7,
          tags = $8,

          -- Pricing
          pricing_model = $9,
          price_amount = $10,
          price_currency = $11,
          has_free_tier = $12,
          has_trial = $13,
          trial_days = $14,

          -- Ratings & Reviews
          rating_value = $15,
          pros = $16,
          cons = $17,
          verdict = $18,

          -- Expertise Signals
          target_audience = $19,
          skill_level = $20,
          learning_curve = $21,
          documentation_quality = $22,
          support_options = $23,
          integrations = $24,
          api_available = $25,
          alternatives = $26,

          -- Trust & Authority
          company_name = $27,
          company_founded = $28,
          employee_count = $29,
          funding_raised = $30,
          notable_customers = $31,
          has_privacy_policy = $32,
          gdpr_compliant = $33,
          security_features = $34,

          -- Helpful Content
          best_for = $35,
          not_recommended_for = $36,

          -- Update timestamp
          updated_at = NOW()

        WHERE name = $37
        RETURNING id, name
      `;

      const values = [
        // Core Identity (1-4)
        tool.core_identity.tagline,
        tool.core_identity.full_description,
        tool.core_identity.logo_url,
        tool.core_identity.website_url,

        // Platform (5-6)
        tool.core_identity.operating_systems,
        tool.core_identity.platforms,

        // Categorization (7-8)
        tool.categorization.subcategory,
        tool.categorization.tags,

        // Pricing (9-14)
        pricingModel,
        tool.pricing_and_plans.starting_price,
        tool.pricing_and_plans.currency || 'USD',
        tool.pricing_and_plans.has_free_tier,
        tool.pricing_and_plans.has_free_trial,
        trialDays,

        // Ratings & Reviews (15-18)
        tool.review_and_rating.rating_score,
        tool.review_and_rating.pros,
        tool.review_and_rating.cons,
        tool.review_and_rating.verdict,

        // Expertise Signals (19-26)
        tool.categorization.target_audience,
        skillLevel,
        learningCurve,
        docQuality,
        tool.expertise_signals.support_options,
        tool.expertise_signals.integrations,
        tool.expertise_signals.api_available,
        tool.expertise_signals.alternatives,

        // Trust & Authority (27-34)
        tool.trust_and_authority.company_name,
        tool.trust_and_authority.year_founded,
        tool.trust_and_authority.employee_count,
        tool.trust_and_authority.funding_raised,
        tool.trust_and_authority.notable_customers,
        tool.trust_and_authority.has_privacy_policy,
        tool.trust_and_authority.gdpr_compliant,
        tool.trust_and_authority.security_features,

        // Helpful Content (35-36)
        tool.review_and_rating.best_for,
        tool.review_and_rating.not_recommended_for,

        // WHERE clause (37)
        tool.core_identity.name
      ];

      try {
        const res = await client.query(query, values);

        if (res.rowCount === 0) {
          console.warn(`  ⚠️  Warning: Tool '${tool.core_identity.name}' not found in database`);
          notFoundCount++;
        } else {
          console.log(`  ✅ ${tool.core_identity.name} updated successfully!`);
          successCount++;
        }
      } catch (err) {
        console.error(`  ❌ Error updating ${tool.core_identity.name}:`, err instanceof Error ? err.message : String(err));
        errorCount++;
      }
    }
  } finally {
    client.release();
    await pool.end();
  }

  console.log(`\n${'='.repeat(60)}`);
  console.log(`🏁 Import Complete!`);
  console.log(`${'='.repeat(60)}`);
  console.log(`✅ Successfully updated: ${successCount}`);
  console.log(`⚠️  Not found in DB: ${notFoundCount}`);
  console.log(`❌ Errors: ${errorCount}`);
  console.log(`📊 Total processed: ${toolsData.length}`);
  console.log(`${'='.repeat(60)}\n`);
}

// Get filename from command line args or use default
const jsonFile = process.argv[2] || 'data/first5.json';
importEnrichedData(jsonFile);
