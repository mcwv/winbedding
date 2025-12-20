const pg = require('pg');
const { Pool } = pg;

const connectionString = 'postgresql://postgres.idfykpdhfmuqkdnfjgqw:E1SqIqRqwhwg20@aws-1-eu-west-1.pooler.supabase.com:6543/postgres';

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false }
});

async function main() {
  const client = await pool.connect();
  try {
    console.log('Connected to Supabase');

    // Create categories table
    await client.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL UNIQUE,
        slug VARCHAR(100) NOT NULL UNIQUE,
        icon VARCHAR(50),
        description TEXT,
        parent_id INTEGER REFERENCES categories(id),
        sort_order INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log('✓ Created categories table');

    // Insert categories
    await client.query(`
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
      ('Other', 'other', 'box', 99)
      ON CONFLICT (name) DO NOTHING
    `);
    console.log('✓ Inserted categories');

    // Create tools table
    await client.query(`
      CREATE TABLE IF NOT EXISTS tools (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(255) NOT NULL UNIQUE,
        tagline VARCHAR(500),
        description TEXT,
        website_url VARCHAR(1000),
        logo_url VARCHAR(1000),
        screenshot_url VARCHAR(1000),
        category_id INTEGER REFERENCES categories(id),
        subcategory VARCHAR(100),
        tags TEXT[],
        use_cases TEXT[],
        pricing_model VARCHAR(20),
        price_amount DECIMAL(10,2),
        price_currency VARCHAR(3) DEFAULT 'USD',
        has_free_tier BOOLEAN DEFAULT FALSE,
        has_trial BOOLEAN DEFAULT FALSE,
        trial_days INTEGER,
        rating_value DECIMAL(3,2) DEFAULT 0,
        rating_count INTEGER DEFAULT 0,
        review_count INTEGER DEFAULT 0,
        operating_system TEXT[],
        platforms TEXT[],
        features TEXT[],
        affiliate_url VARCHAR(1000),
        affiliate_network VARCHAR(50),
        commission_rate VARCHAR(50),
        has_affiliate_link BOOLEAN DEFAULT FALSE,
        hands_on_review TEXT,
        review_date DATE,
        tested_by VARCHAR(100),
        testing_methodology TEXT,
        pros TEXT[],
        cons TEXT[],
        verdict TEXT,
        experience_score DECIMAL(2,1),
        target_audience TEXT[],
        skill_level VARCHAR(20),
        learning_curve VARCHAR(20),
        documentation_quality VARCHAR(20),
        support_options TEXT[],
        integrations TEXT[],
        api_available BOOLEAN DEFAULT FALSE,
        alternatives TEXT[],
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
        has_privacy_policy BOOLEAN DEFAULT FALSE,
        gdpr_compliant BOOLEAN DEFAULT FALSE,
        soc2_certified BOOLEAN DEFAULT FALSE,
        ssl_enabled BOOLEAN DEFAULT TRUE,
        data_retention_policy TEXT,
        security_features TEXT[],
        uptime_sla VARCHAR(20),
        last_security_audit DATE,
        transparency_score INTEGER,
        quick_start_guide TEXT,
        video_tutorial_url VARCHAR(1000),
        faq JSONB,
        comparison_notes TEXT,
        best_for TEXT,
        not_recommended_for TEXT,
        tips_and_tricks TEXT[],
        common_use_cases TEXT[],
        success_stories TEXT,
        last_major_update DATE,
        update_frequency VARCHAR(20),
        changelog_url VARCHAR(1000),
        roadmap_url VARCHAR(1000),
        our_last_review_update DATE,
        content_version INTEGER DEFAULT 1,
        is_verified BOOLEAN DEFAULT FALSE,
        is_featured BOOLEAN DEFAULT FALSE,
        is_published BOOLEAN DEFAULT TRUE,
        quality_score INTEGER DEFAULT 0,
        data_source VARCHAR(50),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        last_verified_at TIMESTAMP
      )
    `);
    console.log('✓ Created tools table');

    // Create view
    await client.query(`
      CREATE OR REPLACE VIEW published_tools AS
      SELECT 
        t.*,
        c.name as category_name,
        c.slug as category_slug,
        c.icon as category_icon
      FROM tools t
      LEFT JOIN categories c ON t.category_id = c.id
      WHERE t.is_published = TRUE
      ORDER BY t.quality_score DESC, t.rating_value DESC
    `);
    console.log('✓ Created published_tools view');

    console.log('\n✅ Schema setup complete!');

  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    client.release();
    pool.end();
  }
}

main();
