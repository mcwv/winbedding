-- Fix Supabase Egress: Exclude heavy columns from published_tools view
-- This prevents tracking_metadata, reddit_morsels, and ai_data from being transferred on every query

DROP VIEW IF EXISTS published_tools;

CREATE OR REPLACE VIEW published_tools AS
SELECT 
    t.id,
    t.name,
    t.slug,
    t.tagline,
    t.description,
    t.website_url,
    t.logo_url,
    t.screenshot_url,
    t.v2_category,
    t.v2_tags,
    t.is_published,
    t.updated_at,
    t.quality_score,
    
    -- V3 Fields (lightweight)
    t.pricing_model,
    t.price_amount,
    t.price_currency,
    t.has_free_tier,
    t.has_trial,
    t.trial_days,
    t.tags,
    t.use_cases,
    t.features,
    t.target_audience,
    t.operating_system,
    t.platforms,
    t.skill_level,
    t.learning_curve,
    t.documentation_quality,
    t.support_options,
    t.api_available,
    t.integrations,
    t.alternatives,
    t.pros,
    t.cons,
    t.best_for,
    t.not_recommended_for,
    t.verdict,
    t.transparency_score,
    t.experience_score,
    t.adams_description,
    t.related_tools
    
    -- EXCLUDE these heavy columns:
    -- t.tracking_metadata (can be 15KB+ per tool)
    -- t.reddit_morsels (JSONB array)
    -- t.ai_data (full Claude response)

FROM tools t
WHERE t.is_published = TRUE
ORDER BY t.quality_score DESC;
