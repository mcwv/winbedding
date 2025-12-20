-- AI Tools Database Schema
-- Optimized for Google E-E-A-T, Rich Results, AdSense & Affiliate Success
-- Created: 2024-12-19

-- Drop existing tables if any
DROP TABLE IF EXISTS tool_reviews CASCADE;
DROP TABLE IF EXISTS tools CASCADE;
DROP TABLE IF EXISTS categories CASCADE;

-- Categories Table
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    icon VARCHAR(50),
    description TEXT,
    parent_id INTEGER REFERENCES categories(id),
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Insert standard categories
INSERT INTO categories (name, slug, icon, sort_order) VALUES
('Writing & Content', 'writing-content', 'pen-tool', 1),
('Image & Art Generation', 'image-art-generation', 'image', 2),
('Video & Animation', 'video-animation', 'video', 3),
('Audio & Music', 'audio-music', 'music', 4),
('Code & Development', 'code-development', 'code', 5),
('Business & Productivity', 'business-productivity', 'briefcase', 6),
('Marketing & SEO', 'marketing-seo', 'trending-up', 7),
('Data & Analytics', 'data-analytics', 'bar-chart', 8),
('AI Chat & Assistants', 'ai-chat-assistants', 'message-circle', 9),
('Design & UI', 'design-ui', 'palette', 10),
('Education & Learning', 'education-learning', 'book-open', 11),
('Research & Science', 'research-science', 'microscope', 12),
('E-commerce', 'e-commerce', 'shopping-cart', 13),
('Customer Support', 'customer-support', 'headphones', 14),
('HR & Recruiting', 'hr-recruiting', 'users', 15),
('Healthcare & Medical', 'healthcare-medical', 'heart', 16),
('Finance & Legal', 'finance-legal', 'dollar-sign', 17),
('Gaming & Entertainment', 'gaming-entertainment', 'gamepad', 18),
('Social Media', 'social-media', 'share', 19),
('Translation & Language', 'translation-language', 'globe', 20),
('Other', 'other', 'box', 99);

-- Main Tools Table
CREATE TABLE tools (
    id SERIAL PRIMARY KEY,
    
    -- Core Identity (Required for Schema.org)
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    tagline VARCHAR(500),
    description TEXT,
    
    -- URLs
    website_url VARCHAR(1000),
    logo_url VARCHAR(1000),
    screenshot_url VARCHAR(1000),
    
    -- Categorization
    category_id INTEGER REFERENCES categories(id),
    subcategory VARCHAR(100),
    tags TEXT[],
    use_cases TEXT[],
    
    -- Pricing & Offers (Required for Rich Results)
    pricing_model VARCHAR(20) CHECK (pricing_model IN ('free', 'freemium', 'paid', 'contact', 'open-source')),
    price_amount DECIMAL(10,2),
    price_currency VARCHAR(3) DEFAULT 'USD',
    has_free_tier BOOLEAN DEFAULT FALSE,
    has_trial BOOLEAN DEFAULT FALSE,
    trial_days INTEGER,
    
    -- Ratings & Reviews (Recommended for Rich Results)
    rating_value DECIMAL(3,2) DEFAULT 0 CHECK (rating_value >= 0 AND rating_value <= 5),
    rating_count INTEGER DEFAULT 0,
    review_count INTEGER DEFAULT 0,
    
    -- Platform & Technical
    operating_system TEXT[],
    platforms TEXT[],
    features TEXT[],
    
    -- Affiliate & Monetization
    affiliate_url VARCHAR(1000),
    affiliate_network VARCHAR(50),
    commission_rate VARCHAR(50),
    has_affiliate_link BOOLEAN DEFAULT FALSE,
    
    -- E-E-A-T: Experience Signals
    hands_on_review TEXT,
    review_date DATE,
    tested_by VARCHAR(100),
    testing_methodology TEXT,
    pros TEXT[],
    cons TEXT[],
    verdict TEXT,
    experience_score DECIMAL(2,1) CHECK (experience_score >= 0 AND experience_score <= 10),
    
    -- E-E-A-T: Expertise Signals
    target_audience TEXT[],
    skill_level VARCHAR(20) CHECK (skill_level IN ('beginner', 'intermediate', 'advanced', 'expert', 'all')),
    learning_curve VARCHAR(20) CHECK (learning_curve IN ('easy', 'moderate', 'steep')),
    documentation_quality VARCHAR(20) CHECK (documentation_quality IN ('excellent', 'good', 'fair', 'poor', 'none')),
    support_options TEXT[],
    integrations TEXT[],
    api_available BOOLEAN DEFAULT FALSE,
    alternatives TEXT[],
    
    -- E-E-A-T: Authoritativeness Signals
    company_name VARCHAR(255),
    company_url VARCHAR(1000),
    company_founded INTEGER,
    employee_count VARCHAR(20),
    funding_raised VARCHAR(50),
    notable_customers TEXT[],
    press_mentions TEXT[],
    awards TEXT[],
    g2_rating DECIMAL(2,1),
    capterra_rating DECIMAL(2,1),
    trustpilot_rating DECIMAL(2,1),
    product_hunt_rank INTEGER,
    
    -- E-E-A-T: Trustworthiness Signals
    has_privacy_policy BOOLEAN DEFAULT FALSE,
    gdpr_compliant BOOLEAN DEFAULT FALSE,
    soc2_certified BOOLEAN DEFAULT FALSE,
    ssl_enabled BOOLEAN DEFAULT TRUE,
    data_retention_policy TEXT,
    security_features TEXT[],
    uptime_sla VARCHAR(20),
    last_security_audit DATE,
    transparency_score INTEGER CHECK (transparency_score >= 0 AND transparency_score <= 100),
    
    -- Helpful Content Bonus
    quick_start_guide TEXT,
    video_tutorial_url VARCHAR(1000),
    faq JSONB,
    comparison_notes TEXT,
    best_for TEXT,
    not_recommended_for TEXT,
    tips_and_tricks TEXT[],
    common_use_cases TEXT[],
    success_stories TEXT,
    
    -- Content Freshness Signals
    last_major_update DATE,
    update_frequency VARCHAR(20) CHECK (update_frequency IN ('daily', 'weekly', 'monthly', 'quarterly', 'yearly', 'unknown')),
    changelog_url VARCHAR(1000),
    roadmap_url VARCHAR(1000),
    our_last_review_update DATE,
    content_version INTEGER DEFAULT 1,
    
    -- Quality & Status
    is_verified BOOLEAN DEFAULT FALSE,
    is_featured BOOLEAN DEFAULT FALSE,
    is_published BOOLEAN DEFAULT FALSE,
    quality_score INTEGER DEFAULT 0 CHECK (quality_score >= 0 AND quality_score <= 100),
    data_source VARCHAR(50),
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    last_verified_at TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_tools_slug ON tools(slug);
CREATE INDEX idx_tools_category ON tools(category_id);
CREATE INDEX idx_tools_rating ON tools(rating_value DESC);
CREATE INDEX idx_tools_quality ON tools(quality_score DESC);
CREATE INDEX idx_tools_published ON tools(is_published);
CREATE INDEX idx_tools_featured ON tools(is_featured);
CREATE INDEX idx_tools_source ON tools(data_source);
CREATE INDEX idx_tools_name_search ON tools USING gin(to_tsvector('english', name));
CREATE INDEX idx_tools_desc_search ON tools USING gin(to_tsvector('english', COALESCE(description, '')));

-- Function to auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for auto-updating updated_at
CREATE TRIGGER update_tools_updated_at
    BEFORE UPDATE ON tools
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Function to calculate quality score
CREATE OR REPLACE FUNCTION calculate_quality_score(tool_row tools)
RETURNS INTEGER AS $$
DECLARE
    score INTEGER := 0;
BEGIN
    -- Core content (+30 max)
    IF tool_row.name IS NOT NULL AND LENGTH(tool_row.name) > 2 THEN score := score + 5; END IF;
    IF tool_row.description IS NOT NULL AND LENGTH(tool_row.description) > 100 THEN score := score + 10; END IF;
    IF tool_row.description IS NOT NULL AND LENGTH(tool_row.description) > 500 THEN score := score + 5; END IF;
    IF tool_row.website_url IS NOT NULL AND tool_row.website_url LIKE 'https://%' THEN score := score + 10; END IF;
    
    -- Media (+15 max)
    IF tool_row.logo_url IS NOT NULL AND tool_row.logo_url LIKE 'http%' THEN score := score + 10; END IF;
    IF tool_row.screenshot_url IS NOT NULL THEN score := score + 5; END IF;
    
    -- Pricing info (+10 max)
    IF tool_row.pricing_model IS NOT NULL THEN score := score + 5; END IF;
    IF tool_row.has_free_tier IS TRUE OR tool_row.has_trial IS TRUE THEN score := score + 5; END IF;
    
    -- Engagement (+15 max)
    IF tool_row.rating_value > 0 THEN score := score + 10; END IF;
    IF tool_row.review_count > 0 THEN score := score + 5; END IF;
    
    -- E-E-A-T signals (+20 max)
    IF tool_row.hands_on_review IS NOT NULL THEN score := score + 5; END IF;
    IF tool_row.pros IS NOT NULL AND array_length(tool_row.pros, 1) > 0 THEN score := score + 5; END IF;
    IF tool_row.company_name IS NOT NULL THEN score := score + 5; END IF;
    IF tool_row.has_privacy_policy IS TRUE THEN score := score + 5; END IF;
    
    -- Bonus (+10 max)
    IF tool_row.features IS NOT NULL AND array_length(tool_row.features, 1) >= 3 THEN score := score + 5; END IF;
    IF tool_row.integrations IS NOT NULL AND array_length(tool_row.integrations, 1) > 0 THEN score := score + 5; END IF;
    
    RETURN LEAST(score, 100);
END;
$$ LANGUAGE plpgsql;

-- View for published tools with category info
CREATE OR REPLACE VIEW published_tools AS
SELECT 
    t.*,
    c.name as category_name,
    c.slug as category_slug,
    c.icon as category_icon
FROM tools t
LEFT JOIN categories c ON t.category_id = c.id
WHERE t.is_published = TRUE
ORDER BY t.quality_score DESC, t.rating_value DESC;

-- View for tools needing attention (low quality)
CREATE OR REPLACE VIEW tools_needing_attention AS
SELECT 
    id, name, quality_score, data_source,
    CASE 
        WHEN website_url IS NULL OR website_url = '' THEN 'Missing URL'
        WHEN description IS NULL OR LENGTH(description) < 100 THEN 'Short/missing description'
        WHEN logo_url IS NULL THEN 'Missing logo'
        WHEN pricing_model IS NULL THEN 'Missing pricing'
        ELSE 'Other'
    END as issue
FROM tools
WHERE quality_score < 50 OR is_published = FALSE
ORDER BY quality_score ASC;

-- Summary stats view
CREATE OR REPLACE VIEW tool_stats AS
SELECT 
    COUNT(*) as total_tools,
    COUNT(*) FILTER (WHERE is_published = TRUE) as published_tools,
    COUNT(*) FILTER (WHERE quality_score >= 70) as high_quality,
    COUNT(*) FILTER (WHERE quality_score >= 50 AND quality_score < 70) as medium_quality,
    COUNT(*) FILTER (WHERE quality_score < 50) as low_quality,
    COUNT(*) FILTER (WHERE has_affiliate_link = TRUE) as with_affiliate,
    AVG(quality_score)::INTEGER as avg_quality_score,
    AVG(rating_value)::DECIMAL(2,1) as avg_rating
FROM tools;
