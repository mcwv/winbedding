# AI Tools Database Schema Design
## Optimized for Google E-E-A-T, Rich Results, AdSense & Affiliate Success

### 🎯 Strategic Goals
1. **E-E-A-T Excellence** - Experience, Expertise, Authoritativeness, Trustworthiness
2. **Rich Results Eligibility** - Schema.org SoftwareApplication with all recommended fields
3. **Helpful Content Signals** - People-first, comprehensive, unique content
4. **AdSense & Affiliate Ready** - Proper disclosure, quality signals
5. **User Experience** - Fast, accessible, valuable

### Goals
1. **Google Rich Results** - Schema.org SoftwareApplication structured data
2. **AdSense Approval** - Quality content signals, original descriptions
3. **Affiliate Compatibility** - Proper disclosure fields, link management
4. **SEO Best Practices** - Canonical URLs, proper metadata

---

## Database Schema (PostgreSQL)

### Core Table: `tools`

| Field | Type | Required | Schema.org Property | Notes |
|-------|------|----------|---------------------|-------|
| `id` | SERIAL | ✓ | - | Primary key |
| `name` | VARCHAR(255) | ✓ | `name` | **Required** for rich results |
| `slug` | VARCHAR(255) | ✓ | - | URL-friendly identifier |
| `tagline` | VARCHAR(500) | ✓ | - | Short marketing text (1-2 sentences) |
| `description` | TEXT | ✓ | `description` | Full detailed description (500+ chars) |
| `website_url` | VARCHAR(1000) | ✓ | `url` | Official website URL |
| `logo_url` | VARCHAR(1000) | | `image` | High-quality logo (min 112x112px) |
| `screenshot_url` | VARCHAR(1000) | | `screenshot` | App screenshot for rich results |

### Categorization

| Field | Type | Required | Schema.org Property | Notes |
|-------|------|----------|---------------------|-------|
| `category_id` | INTEGER | ✓ | `applicationCategory` | FK to categories table |
| `subcategory` | VARCHAR(100) | | - | Secondary classification |
| `tags` | TEXT[] | | `keywords` | Array of relevant tags |
| `use_cases` | TEXT[] | | - | What problems it solves |

### Pricing & Offers (Required for Rich Results!)

| Field | Type | Required | Schema.org Property | Notes |
|-------|------|----------|---------------------|-------|
| `pricing_model` | ENUM | ✓ | - | 'free', 'freemium', 'paid', 'contact' |
| `price_amount` | DECIMAL(10,2) | | `offers.price` | Starting price if applicable |
| `price_currency` | VARCHAR(3) | | `offers.priceCurrency` | 'USD', 'EUR', etc. |
| `has_free_tier` | BOOLEAN | ✓ | - | Important for users |
| `has_trial` | BOOLEAN | | - | Free trial available? |
| `trial_days` | INTEGER | | - | Trial period length |

### Ratings & Reviews (Recommended for Rich Results)

| Field | Type | Required | Schema.org Property | Notes |
|-------|------|----------|---------------------|-------|
| `rating_value` | DECIMAL(3,2) | | `aggregateRating.ratingValue` | 0.00 - 5.00 |
| `rating_count` | INTEGER | | `aggregateRating.ratingCount` | Number of ratings |
| `review_count` | INTEGER | | `aggregateRating.reviewCount` | Number of reviews |

### Platform & Technical

| Field | Type | Required | Schema.org Property | Notes |
|-------|------|----------|---------------------|-------|
| `operating_system` | TEXT[] | | `operatingSystem` | ['Web', 'iOS', 'Android', 'Windows', 'macOS'] |
| `platforms` | TEXT[] | | - | ['Browser', 'Desktop', 'Mobile', 'API'] |
| `features` | TEXT[] | | `featureList` | Key features list |

### Affiliate & Monetization

| Field | Type | Required | Schema.org Property | Notes |
|-------|------|----------|---------------------|-------|
| `affiliate_url` | VARCHAR(1000) | | - | Affiliate tracking link |
| `affiliate_network` | VARCHAR(50) | | - | 'direct', 'skimlinks', 'cj', etc. |
| `commission_rate` | VARCHAR(50) | | - | e.g., '30%', '$50/sale' |
| `affiliate_disclosure` | BOOLEAN | ✓ | - | TRUE if has affiliate link |


### Quality & Status

| Field | Type | Required | Schema.org Property | Notes |
|-------|------|----------|---------------------|-------|
| `is_verified` | BOOLEAN | ✓ | - | Manually verified |
| `is_featured` | BOOLEAN | ✓ | - | Featured on homepage |
| `is_published` | BOOLEAN | ✓ | - | Visible on site |
| `quality_score` | INTEGER | | - | 0-100 internal quality metric |
| `data_source` | VARCHAR(50) | ✓ | - | 'strapi', 'bedwinning', 'manual' |
| `created_at` | TIMESTAMP | ✓ | `dateCreated` | When added |
| `updated_at` | TIMESTAMP | ✓ | `dateModified` | Last update |
| `last_verified_at` | TIMESTAMP | | - | Last manual verification |

### Company/Developer (Optional separate table)

| Field | Type | Notes |
|-------|------|-------|
| `company_name` | VARCHAR(255) | Developer/company name |
| `company_url` | VARCHAR(1000) | Company website |
| `founded_year` | INTEGER | When founded |
| `headquarters` | VARCHAR(100) | Location |

---

## 🌟 E-E-A-T EXCELLENCE FIELDS (Above & Beyond!)

These fields actively increase Google's favorable perception and help achieve higher rankings.

### Experience Signals (First "E")

| Field | Type | Schema.org | Purpose |
|-------|------|------------|---------|
| `hands_on_review` | TEXT | - | Our original hands-on review/experience |
| `review_date` | DATE | `dateReviewed` | When we personally tested it |
| `tested_by` | VARCHAR(100) | - | Who tested (author name) |
| `testing_methodology` | TEXT | - | How we evaluated (builds credibility) |
| `pros` | TEXT[] | - | What we liked (personal experience) |
| `cons` | TEXT[] | - | What we didn't like (honest) |
| `verdict` | TEXT | - | Our recommendation |
| `experience_score` | DECIMAL(2,1) | - | Our 1-10 rating from testing |

### Expertise Signals

| Field | Type | Purpose |
|-------|------|---------|
| `target_audience` | TEXT[] | ['Developers', 'Marketers', 'Designers'] |
| `skill_level` | ENUM | 'beginner', 'intermediate', 'advanced', 'expert' |
| `learning_curve` | ENUM | 'easy', 'moderate', 'steep' |
| `documentation_quality` | ENUM | 'excellent', 'good', 'fair', 'poor' |
| `support_options` | TEXT[] | ['Chat', 'Email', 'Phone', 'Community'] |
| `integrations` | TEXT[] | What it integrates with |
| `api_available` | BOOLEAN | Has public API |
| `alternatives` | TEXT[] | Similar tools (shows expertise in space) |

### Authoritativeness Signals

| Field | Type | Purpose |
|-------|------|---------|
| `company_founded` | INTEGER | Year established (older = more trust) |
| `employee_count` | VARCHAR(50) | '1-10', '11-50', '51-200', '201-500', '500+' |
| `funding_raised` | VARCHAR(50) | '$1M-$10M', '$10M-$50M', etc. |
| `notable_customers` | TEXT[] | Big names using it (social proof) |
| `press_mentions` | TEXT[] | Where featured (TechCrunch, etc.) |
| `awards` | TEXT[] | Any awards received |
| `g2_rating` | DECIMAL(2,1) | G2 rating if available |
| `capterra_rating` | DECIMAL(2,1) | Capterra rating |
| `trustpilot_rating` | DECIMAL(2,1) | Trustpilot rating |
| `product_hunt_rank` | INTEGER | Product Hunt launch rank |

### Trustworthiness Signals (Most Important!)

| Field | Type | Purpose |
|-------|------|---------|
| `has_privacy_policy` | BOOLEAN | Tool has privacy policy |
| `gdpr_compliant` | BOOLEAN | GDPR compliance |
| `soc2_certified` | BOOLEAN | SOC2 certification |
| `ssl_enabled` | BOOLEAN | HTTPS enforced |
| `data_retention_policy` | TEXT | How they handle data |
| `security_features` | TEXT[] | ['2FA', 'SSO', 'Encryption', etc.] |
| `uptime_sla` | VARCHAR(20) | '99.9%', '99.99%' etc. |
| `last_security_audit` | DATE | When last audited |
| `transparency_score` | INTEGER | 0-100 internal metric |

### Helpful Content Bonus Fields

| Field | Type | Purpose |
|-------|------|---------|
| `quick_start_guide` | TEXT | How to get started in 5 min |
| `video_tutorial_url` | VARCHAR(1000) | Tutorial video |
| `faq` | JSONB | Frequently asked questions |
| `comparison_notes` | TEXT | How it compares to alternatives |
| `best_for` | TEXT | "Best for X who need Y" |
| `not_recommended_for` | TEXT | Who should NOT use this |
| `tips_and_tricks` | TEXT[] | Power user tips |
| `common_use_cases` | TEXT[] | Real-world applications |
| `success_stories` | TEXT | Customer success examples |

### Content Freshness Signals

| Field | Type | Purpose |
|-------|------|---------|
| `last_major_update` | DATE | When tool had major update |
| `update_frequency` | ENUM | 'daily', 'weekly', 'monthly', 'quarterly' |
| `changelog_url` | VARCHAR(1000) | Link to changelog |
| `roadmap_url` | VARCHAR(1000) | Link to public roadmap |
| `our_last_review_update` | DATE | When we updated our content |
| `content_version` | INTEGER | Track content revisions |

---

## Categories Table

| Field | Type | Notes |
|-------|------|-------|
| `id` | SERIAL | Primary key |
| `name` | VARCHAR(100) | Display name |
| `slug` | VARCHAR(100) | URL slug |
| `icon` | VARCHAR(50) | Icon identifier |
| `description` | TEXT | Category description |
| `parent_id` | INTEGER | For hierarchy (null = top level) |
| `sort_order` | INTEGER | Display order |

### Standard Categories (Schema.org aligned):
1. Writing & Content
2. Image & Art Generation
3. Video & Animation
4. Audio & Music
5. Code & Development
6. Business & Productivity
7. Marketing & SEO
8. Data & Analytics
9. AI Chat & Assistants
10. Design & UI
11. Education & Learning
12. Research & Science
13. E-commerce
14. Customer Support
15. HR & Recruiting
16. Healthcare & Medical
17. Finance & Legal
18. Gaming & Entertainment
19. Social Media
20. Translation & Language

---

## JSON-LD Output Example

```json
{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "ChatGPT",
  "description": "An AI-powered conversational assistant...",
  "image": "https://example.com/chatgpt-logo.png",
  "screenshot": "https://example.com/chatgpt-screenshot.png",
  "url": "https://chat.openai.com",
  "applicationCategory": "AI Chat & Assistants",
  "operatingSystem": ["Web", "iOS", "Android"],
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD"
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.8",
    "ratingCount": "15000",
    "reviewCount": "2500"
  }
}
```

---

## Data Quality Requirements

### Minimum for Publishing:
- ✓ Name (2-255 characters)
- ✓ Slug (unique, URL-safe)
- ✓ Description (500+ characters, original content)
- ✓ Website URL (valid, accessible)
- ✓ Category (from standard list)
- ✓ Pricing model
- ✓ At least 1 platform

### Recommended for Rich Results:
- Logo (HTTPS URL, min 112x112px)
- Rating (0-5 scale)
- Price/Offers info
- Features list
- Operating system

### AdSense Quality Signals:
- Original, non-duplicate descriptions
- Proper affiliate disclosure
- Privacy policy compliance
- No prohibited content categories

---

## Migration Strategy

1. **Phase 1: Clean Source Data**
   - Fix Bedwinning CSV column mapping
   - Remove true duplicates
   - Validate URLs

2. **Phase 2: Merge & Deduplicate**
   - Prioritize Strapi data (better quality)
   - Merge Bedwinning unique entries
   - Generate quality scores

3. **Phase 3: Enrich**
   - Fetch missing logos via favicon/Clearbit
   - Validate all URLs are accessible
   - Calculate quality scores

4. **Phase 4: Publish**
   - Only publish tools meeting minimum requirements
   - Generate JSON-LD structured data
   - Create sitemap
