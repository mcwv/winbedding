import os
import time
import json
import asyncio
import psycopg2
from psycopg2.extras import RealDictCursor, Json
import typing_extensions as typing
from groq import Groq
from crawl4ai import AsyncWebCrawler
from dotenv import load_dotenv
from datetime import datetime

# ==========================================
# CONFIGURATION
# ==========================================

load_dotenv('.env.local')

DB_CONFIG = {
    "dbname": os.getenv("PGDATABASE"),
    "user": os.getenv("PGUSER"),
    "password": os.getenv("PGPASSWORD"),
    "host": os.getenv("PGHOST"),
    "port": os.getenv("PGPORT", "5432")
}

# ==========================================
# SCHEMA (Only fields AI can extract)
# ==========================================

class ToolAnalysis(typing.TypedDict):
    """What AI can realistically extract from a website"""
    
    # Core Identity
    name: str
    tagline: str
    short_description: str  # 1-2 sentences
    full_description: str   # 3-5 paragraphs
    logo_url: str | None
    
    # Categorization
    primary_category: str  # Single best fit category
    tags: list[str]  # Specific, searchable keywords (max 15)
    use_cases: list[str]  # Actual scenarios where tool is used
    features: list[str]  # Key capabilities (max 10)
    target_audience: list[str]  # Job titles/roles (e.g., "Content Marketers", "DevOps Engineers")
    
    # Pricing
    pricing_model: str  # free, freemium, paid, contact, open-source
    starting_price: float | None  # Lowest paid tier price
    price_currency: str  # USD, EUR, GBP, etc.
    has_free_tier: bool
    has_trial: bool
    trial_days: int | None
    pricing_summary: str  # 1-2 sentence explanation of pricing structure
    
    # Platform & Compatibility
    operating_system: list[str]  # Windows, macOS, Linux, etc.
    platforms: list[str]  # Web, iOS, Android, Desktop, CLI, etc.
    
    # User Experience Signals
    skill_level: str  # beginner, intermediate, advanced, expert, all
    learning_curve: str  # easy, moderate, steep
    documentation_quality: str  # excellent, good, fair, poor, none
    support_options: list[str]  # Email, Chat, Phone, Community Forum, etc.
    
    # Technical Details
    api_available: bool
    integrations: list[str]  # Named tools/services it connects with (max 15)
    alternatives: list[str]  # Competing tools mentioned (max 8)
    
    # Review/Assessment
    pros: list[str]  # Specific strengths (max 6)
    cons: list[str]  # Honest limitations (max 6)
    best_for: str  # Who/what scenarios this excels at
    not_recommended_for: str  # When to look elsewhere
    verdict: str  # 2-3 sentence overall assessment
    
    # Company/Trust (if visible on site)
    company_name: str | None
    company_founded: int | None
    employee_count: str | None  # "1-10", "11-50", "51-200", "200+", etc.
    funding_raised: str | None  # "$5M Series A", "Bootstrapped", etc.
    notable_customers: list[str]  # Named clients/users (max 10)
    
    # Compliance (boolean presence checks)
    has_privacy_policy: bool
    appears_gdpr_compliant: bool  # Based on mentions, not legal verification
    security_features: list[str]  # SSL, 2FA, SSO, SOC2, etc. if mentioned
    
    # Update/Maintenance signals
    update_frequency: str  # daily, weekly, monthly, quarterly, yearly, unknown
    last_update_mentioned: str | None  # Any date/timeframe mentioned

# ==========================================
# SCORE CALCULATORS
# ==========================================

def calculate_transparency_score(data: dict) -> int:
    """
    0-100: How transparent/trustworthy the tool appears
    Based on available information and pricing clarity
    """
    score = 0
    
    # Pricing transparency (40 points)
    pricing_model = data.get('pricing_model', 'contact')
    if pricing_model == 'free':
        score += 40
    elif pricing_model in ['freemium', 'open-source']:
        score += 35
    elif pricing_model == 'paid' and data.get('starting_price'):
        score += 30
    elif pricing_model == 'contact':
        score += 10  # Lowest score for "contact us" pricing
    
    # Company information (25 points)
    if data.get('company_name'): score += 8
    if data.get('company_founded'): score += 8
    if data.get('employee_count'): score += 5
    if data.get('funding_raised'): score += 4
    
    # Privacy/Security (20 points)
    if data.get('has_privacy_policy'): score += 10
    if data.get('appears_gdpr_compliant'): score += 5
    if len(data.get('security_features', [])) > 0: score += 5
    
    # Documentation (15 points)
    doc_quality = data.get('documentation_quality', 'none')
    doc_scores = {'excellent': 15, 'good': 12, 'fair': 8, 'poor': 4, 'none': 0}
    score += doc_scores.get(doc_quality, 0)
    
    return min(score, 100)

def calculate_experience_score(data: dict) -> float:
    """
    0-10: Predicted user experience quality
    Based on ease of use, support, and learning curve
    """
    score = 5.0  # Start neutral
    
    # Learning curve impact (max ±2 points)
    curve = data.get('learning_curve', 'moderate')
    if curve == 'easy': score += 2.0
    elif curve == 'steep': score -= 1.5
    
    # Skill level accessibility (max ±1.5 points)
    skill = data.get('skill_level', 'all')
    if skill in ['beginner', 'all']: score += 1.5
    elif skill == 'expert': score -= 1.0
    
    # Documentation quality (max ±1.5 points)
    doc = data.get('documentation_quality', 'fair')
    doc_impact = {'excellent': 1.5, 'good': 1.0, 'fair': 0, 'poor': -0.5, 'none': -1.5}
    score += doc_impact.get(doc, 0)
    
    # Support options (max +1 point)
    support_count = len(data.get('support_options', []))
    if support_count >= 3: score += 1.0
    elif support_count == 2: score += 0.5
    
    # Free tier/trial availability (+0.5 points)
    if data.get('has_free_tier') or data.get('has_trial'):
        score += 0.5
    
    return round(max(0, min(score, 10)), 1)

def calculate_quality_score(data: dict) -> int:
    """
    0-100: Overall data quality and completeness
    This is a META score about the enrichment quality itself
    """
    score = 0
    required_fields = 0
    filled_fields = 0
    
    # Core content (40 points)
    content_fields = {
        'full_description': 10,
        'tagline': 8,
        'short_description': 8,
        'verdict': 7,
        'best_for': 7
    }
    for field, points in content_fields.items():
        required_fields += 1
        if data.get(field) and len(str(data[field])) > 20:
            score += points
            filled_fields += 1
    
    # Categorization (20 points)
    if len(data.get('tags', [])) >= 5: score += 8
    if len(data.get('use_cases', [])) >= 3: score += 6
    if len(data.get('features', [])) >= 5: score += 6
    
    # Pricing info (15 points)
    if data.get('pricing_model'): score += 8
    if data.get('pricing_summary'): score += 7
    
    # Technical details (15 points)
    if len(data.get('integrations', [])) >= 3: score += 8
    if data.get('api_available') is not None: score += 4
    if len(data.get('platforms', [])) >= 1: score += 3
    
    # Assessment quality (10 points)
    if len(data.get('pros', [])) >= 3: score += 5
    if len(data.get('cons', [])) >= 2: score += 5
    
    return min(score, 100)

# ==========================================
# DATABASE OPERATIONS
# ==========================================

def get_db_connection():
    return psycopg2.connect(**DB_CONFIG)

def fetch_pending_tools(limit=5):
    """Get tools marked as 'pending' for enrichment"""
    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute("""
                SELECT id, name, slug, website_url 
                FROM tools 
                WHERE enrichment_status = 'pending' 
                ORDER BY created_at ASC
                LIMIT %s
            """, (limit,))
            return cur.fetchall()
    finally:
        conn.close()

def save_enriched_tool(tool_id: int, data: dict):
    """
    Save AI-extracted data to database
    Maps AI output to actual DB columns
    """
    conn = get_db_connection()
    
    try:
        # Calculate scores
        transparency_score = calculate_transparency_score(data)
        experience_score = calculate_experience_score(data)
        quality_score = calculate_quality_score(data)
        
        with conn.cursor() as cur:
            cur.execute("""
                UPDATE tools 
                SET 
                    -- Core Identity
                    tagline = %s,
                    description = %s,
                    logo_url = %s,
                    
                    -- Categorization (arrays)
                    tags = %s,
                    use_cases = %s,
                    features = %s,
                    target_audience = %s,
                    
                    -- Pricing
                    pricing_model = %s,
                    price_amount = %s,
                    price_currency = %s,
                    has_free_tier = %s,
                    has_trial = %s,
                    trial_days = %s,
                    
                    -- Platform
                    operating_system = %s,
                    platforms = %s,
                    
                    -- Experience
                    skill_level = %s,
                    learning_curve = %s,
                    documentation_quality = %s,
                    support_options = %s,
                    
                    -- Technical
                    api_available = %s,
                    integrations = %s,
                    alternatives = %s,
                    
                    -- Review
                    pros = %s,
                    cons = %s,
                    best_for = %s,
                    not_recommended_for = %s,
                    verdict = %s,
                    
                    -- Company
                    company_name = %s,
                    company_founded = %s,
                    employee_count = %s,
                    funding_raised = %s,
                    notable_customers = %s,
                    
                    -- Trust
                    has_privacy_policy = %s,
                    gdpr_compliant = %s,
                    security_features = %s,
                    
                    -- Maintenance
                    update_frequency = %s,
                    
                    -- Calculated Scores
                    transparency_score = %s,
                    experience_score = %s,
                    quality_score = %s,
                    
                    -- Meta
                    enrichment_status = 'completed',
                    ai_data = %s,
                    updated_at = NOW(),
                    last_verified_at = NOW()
                    
                WHERE id = %s
            """, (
                # Core
                data.get('tagline'),
                data.get('full_description'),
                data.get('logo_url'),
                
                # Arrays
                data.get('tags', []),
                data.get('use_cases', []),
                data.get('features', []),
                data.get('target_audience', []),
                
                # Pricing
                data.get('pricing_model'),
                data.get('starting_price'),
                data.get('price_currency', 'USD'),
                data.get('has_free_tier', False),
                data.get('has_trial', False),
                data.get('trial_days'),
                
                # Platform
                data.get('operating_system', []),
                data.get('platforms', []),
                
                # Experience
                data.get('skill_level'),
                data.get('learning_curve'),
                data.get('documentation_quality'),
                data.get('support_options', []),
                
                # Technical
                data.get('api_available', False),
                data.get('integrations', []),
                data.get('alternatives', []),
                
                # Review
                data.get('pros', []),
                data.get('cons', []),
                data.get('best_for'),
                data.get('not_recommended_for'),
                data.get('verdict'),
                
                # Company
                data.get('company_name'),
                data.get('company_founded'),
                data.get('employee_count'),
                data.get('funding_raised'),
                data.get('notable_customers', []),
                
                # Trust
                data.get('has_privacy_policy', False),
                data.get('appears_gdpr_compliant', False),
                data.get('security_features', []),
                
                # Maintenance
                data.get('update_frequency', 'unknown'),
                
                # Scores
                transparency_score,
                experience_score,
                quality_score,
                
                # Store full JSON for reference
                Json(data),
                
                tool_id
            ))
        
        conn.commit()
        return True
        
    except Exception as e:
        print(f"   ⚠️ Database save error: {e}")
        conn.rollback()
        return False
        
    finally:
        conn.close()

def mark_tool_failed(tool_id: int, error: str):
    # intentionally do nothing on failure
    return


# ==========================================
# AI ANALYSIS ENGINE
# ==========================================

def build_extraction_prompt(tool_name: str, markdown: str) -> str:
    """
    Craft a detailed prompt that demands specific, high-quality output
    """
    
    return f"""You are an expert analyst for a tools directory website (like G2 or Capterra).

Your task: Analyze "{tool_name}" and extract SPECIFIC, USEFUL information that helps people make informed decisions.

# CRITICAL RULES

## AVOID AT ALL COSTS:
❌ Generic marketing speak ("powerful platform", "industry-leading", "cutting-edge")
❌ Vague pros ("easy to use", "user-friendly", "feature-rich")
❌ Filler words and fluff
❌ Repeating the tool name unnecessarily
❌ Making up information not present in the content

## REQUIRED APPROACH:
✅ Extract SPECIFIC features with concrete details
✅ Use MEASURABLE benefits where possible
✅ Name SPECIFIC integrations, not "integrates with popular tools"
✅ Identify REAL use cases, not generic scenarios
✅ Be HONEST about limitations and cons
✅ Write for humans making purchase decisions

# FIELD-BY-FIELD GUIDANCE

**tagline**: One punchy sentence (50-80 chars) capturing what it does. NOT marketing fluff.
- Good: "Open-source dataset management with version control for ML teams"
- Bad: "The ultimate solution for your data needs"

**short_description**: 1-2 sentences (100-150 chars) explaining the core value prop.

**full_description**: 3-5 detailed paragraphs covering:
- What it does and how it works
- Key capabilities and differentiators
- Who uses it and why
- Technical approach or methodology
DO NOT write generic fluff. Be specific and informative.

**tags**: 8-15 SPECIFIC, searchable keywords
- Good: "email-marketing", "marketing-automation", "drag-drop-builder", "a-b-testing"
- Bad: "marketing", "software", "tool", "platform", "business"

**use_cases**: 3-6 ACTUAL scenarios where this tool is used
- Good: "Building personalized email drip campaigns", "Segmenting users by behavior"
- Bad: "Marketing", "Business growth"

**features**: 5-10 KEY capabilities (not every minor feature)
- Be specific: "Drag-and-drop email builder with 200+ templates"
- Not: "Email builder"

**target_audience**: 3-8 specific job titles/roles
- Good: "Content Marketers", "Email Marketing Managers", "Growth Hackers"
- Bad: "Businesses", "Teams", "Companies"

**pricing_model**: Choose ONE:
- free: Everything is free forever
- freemium: Free tier + paid upgrades
- paid: Only paid plans available
- contact: No public pricing, must contact sales
- open-source: Open source (may have paid hosting/support)

**pricing_summary**: 1-2 sentences explaining the pricing structure, tiers, and key differences

**skill_level**: beginner | intermediate | advanced | expert | all
Base this on the UI complexity and learning requirements YOU observe.

**learning_curve**: easy | moderate | steep
Be honest. If it takes weeks to master, it's steep.

**documentation_quality**: excellent | good | fair | poor | none
Judge based on what you see:
- excellent: Comprehensive guides, video tutorials, examples, API docs
- good: Decent coverage, some guides, basic examples
- fair: Limited documentation, mostly FAQs
- poor: Barely any documentation
- none: No documentation found

**pros**: 3-6 SPECIFIC strengths with context
- Good: "Built-in A/B testing increased our email CTR by 40%"
- Bad: "Easy to use"

**cons**: 2-6 HONEST limitations
Don't sugarcoat. Real cons help users make decisions.

**best_for**: 2-3 sentences describing ideal users and scenarios

**not_recommended_for**: 1-2 sentences about when to look elsewhere

**verdict**: 2-3 sentences giving your balanced assessment

**integrations**: List NAMED tools/platforms it connects with (max 15)
- Zapier, Slack, HubSpot, Salesforce (not "CRM tools", "communication platforms")

**alternatives**: List NAMED competing tools mentioned or that you know (max 8)

**company_founded**: ONLY if you see it on the page (year as integer)

**employee_count**: ONLY if mentioned. Use: "1-10", "11-50", "51-200", "201-500", "500+"

**funding_raised**: ONLY if mentioned. Format: "$5M Series A", "Bootstrapped", "$50M total"

**has_privacy_policy**: true ONLY if you find a link to privacy policy

**appears_gdpr_compliant**: true if you see GDPR mentioned, cookie consent, or EU compliance

**security_features**: List any mentioned: ["SSL", "2FA", "SSO", "SOC2", "HIPAA", "ISO 27001"]

**update_frequency**: Choose ONE: daily | weekly | monthly | quarterly | yearly | unknown
Base this on any changelog, blog, or update mentions you find.

# WEBSITE CONTENT

{markdown}

# FINAL REMINDER

Your output will be displayed to real users comparing tools. Make it USEFUL, SPECIFIC, and HONEST.
Don't write what you think the company wants to hear. Write what a user needs to know.

Return valid JSON matching the schema."""

# Initialize Groq Client (Add this above the function or at top of file)
groq_client = Groq(api_key=os.environ.get("GROQ_API_KEY"))

async def analyze_tool(tool_name: str, url: str, markdown: str) -> dict:
    """
    Run AI analysis on scraped content using Groq
    """
    try:
        # Reuse your existing prompt builder (it works fine for Llama)
        prompt = build_extraction_prompt(tool_name, markdown)
        
        # SYSTEM PROMPT: Forces Llama to behave like a strict data engine
        system_msg = "You are a precise data extraction engine. You output ONLY valid JSON matching the requested schema. Do not include markdown formatting."

        completion = groq_client.chat.completions.create(
            # CRITICAL: Use this model for the 70k TPM limit (Standard Llama 3.1 is only 6k)
            model="groq/compound-mini", 
            messages=[
                {"role": "system", "content": system_msg},
                {"role": "user", "content": prompt}
            ],
            response_format={"type": "json_object"}, # Forces valid JSON
            temperature=0.1 # Keep it factual
        )
        
        # Parse the response
        response_text = completion.choices[0].message.content
        data = json.loads(response_text)
        
        # Run your existing quality checks
        data = enhance_data_quality(data, tool_name, url)
        
        return data
        
    except json.JSONDecodeError as e:
        raise Exception(f"AI returned invalid JSON: {e}")
    except Exception as e:
        # Catch rate limits specifically
        if "429" in str(e):
            raise Exception(f"GROQ RATE LIMIT HIT: {e}")
        raise Exception(f"AI analysis failed: {e}")

def enhance_data_quality(data: dict, tool_name: str, url: str) -> dict:
    """
    Post-process AI output to fix common issues and improve quality
    """
    
    # Fix tagline if it's generic garbage
    tagline = data.get('tagline', '').lower()
    generic_phrases = ['best tool', 'powerful', 'leading', 'industry-leading', 'ultimate', 'cutting-edge']
    if any(phrase in tagline for phrase in generic_phrases) or len(tagline) < 15:
        # Fallback to first sentence of short description
        short_desc = data.get('short_description', '')
        if short_desc and len(short_desc) > 20:
            data['tagline'] = short_desc.split('.')[0].strip()[:100]
    
    # Remove useless tags
    useless_tags = ['software', 'tool', 'platform', 'app', 'service', 'online', 'business', 'solution']
    if 'tags' in data:
        data['tags'] = [tag for tag in data['tags'] if tag.lower() not in useless_tags][:15]
    
    # Remove generic pros
    generic_pros = ['easy to use', 'user friendly', 'user-friendly', 'powerful', 'great', 'good', 'useful']
    if 'pros' in data:
        data['pros'] = [
            pro for pro in data['pros'] 
            if not any(gp in pro.lower() for gp in generic_pros) and len(pro) > 15
        ][:6]
    
    # Ensure cons exist (make it honest)
    if not data.get('cons') or len(data.get('cons', [])) == 0:
        # If no cons found, add a reasonable default
        data['cons'] = ["Limited information available for detailed assessment"]
    
    # Limit array sizes
    data['cons'] = data.get('cons', [])[:6]
    data['features'] = data.get('features', [])[:10]
    data['use_cases'] = data.get('use_cases', [])[:6]
    data['integrations'] = data.get('integrations', [])[:15]
    data['alternatives'] = data.get('alternatives', [])[:8]
    data['notable_customers'] = data.get('notable_customers', [])[:10]
    data['support_options'] = data.get('support_options', [])[:8]
    data['security_features'] = data.get('security_features', [])[:10]
    
    # Normalize enums to match DB constraints
    if 'pricing_model' in data:
        model_map = {
            'freemium': 'freemium',
            'free': 'free',
            'open': 'open-source',
            'opensource': 'open-source',
            'paid': 'paid',
            'subscription': 'paid',
            'contact': 'contact',
            'custom': 'contact'
        }
        model = str(data['pricing_model']).lower()
        data['pricing_model'] = next(
            (v for k, v in model_map.items() if k in model), 
            'contact'
        )
    
    if 'skill_level' in data:
        skill = str(data['skill_level']).lower()
        valid_skills = ['beginner', 'intermediate', 'advanced', 'expert', 'all']
        data['skill_level'] = next((s for s in valid_skills if s in skill), 'all')
    
    if 'learning_curve' in data:
        curve = str(data['learning_curve']).lower()
        if 'easy' in curve or 'low' in curve or 'simple' in curve:
            data['learning_curve'] = 'easy'
        elif 'steep' in curve or 'high' in curve or 'difficult' in curve:
            data['learning_curve'] = 'steep'
        else:
            data['learning_curve'] = 'moderate'
    
    if 'documentation_quality' in data:
        doc = str(data['documentation_quality']).lower()
        valid_docs = ['excellent', 'good', 'fair', 'poor', 'none']
        data['documentation_quality'] = next((d for d in valid_docs if d in doc), 'fair')
    
    if 'update_frequency' in data:
        freq = str(data['update_frequency']).lower()
        valid_freq = ['daily', 'weekly', 'monthly', 'quarterly', 'yearly', 'unknown']
        data['update_frequency'] = next((f for f in valid_freq if f in freq), 'unknown')
    
    return data

# ==========================================
# MAIN WORKFLOW
# ==========================================

async def process_tool(crawler, tool):
    """
    Complete enrichment pipeline for a single tool
    """
    print(f"\n{'='*60}")
    print(f"🔍 {tool['name']}")
    print(f"   URL: {tool['website_url']}")
    print(f"   ID: {tool['id']}")
    
    try:
        # Step 1: Scrape website
        print(f"   📄 Scraping...")
        result = await crawler.arun(
            url=tool['website_url'],
            bypass_cache=True,
            timeout=30000
        )
        
        markdown = result.markdown
        
        if not markdown or len(markdown) < 200:
            raise Exception(f"Insufficient content ({len(markdown)} chars)")
        
        # Intelligent truncation - keep beginning and end
        if len(markdown) > 40000:
            # Keep first 20k (hero, features) and last 20k (pricing, footer)
            markdown = markdown[:20000] + "\n\n[... content trimmed ...]\n\n" + markdown[-20000:]
        
        print(f"   ✓ Extracted {len(markdown):,} characters")
        
        # Step 2: AI Analysis
        print(f"   🧠 Analyzing with AI...")
        data = await analyze_tool(tool['name'], tool['website_url'], markdown)
        
        print(f"   ✓ Analysis complete")
        
        # Step 3: Calculate scores
        transparency = calculate_transparency_score(data)
        experience = calculate_experience_score(data)
        quality = calculate_quality_score(data)
        
        print(f"   📊 Scores: Quality={quality} | Transparency={transparency} | UX={experience}")
        
        # Step 4: Save to database
        print(f"   💾 Saving to database...")
        success = save_enriched_tool(tool['id'], data)
        
        if success:
            print(f"   ✅ SAVED")
            print(f"   💰 {data.get('pricing_model', '?').upper()}")
            print(f"   📝 {data.get('tagline', '')[:70]}...")
            print(f"   ✨ {len(data.get('features', []))} features | {len(data.get('integrations', []))} integrations")
        else:
            print(f"   ⚠️ Save failed (but data was processed)")
        
    except Exception as e:
        print(f"   ❌ FAILED: {e}")
        mark_tool_failed(tool['id'], str(e))

async def main():
    """
    Main event loop
    Continuously processes pending tools
    """
    
    print("="*60)
    print("🚀 BEDWINNING ENRICHMENT ENGINE")
    print("="*60)
    print(f"⏰ Started: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"🤖 Model: groq/compound-mini")
    print("="*60)
    
    async with AsyncWebCrawler(verbose=False) as crawler:
        batch_count = 0
        total_processed = 0
        
        while True:
            batch_count += 1
            
            # Fetch next batch
            tools = fetch_pending_tools(limit=5)
            
            if not tools:
                print(f"\n💤 No pending tools. Sleeping 60 seconds...")
                print(f"   (Processed {total_processed} tools in {batch_count-1} batches)")
                time.sleep(60)
                continue
            
            print(f"\n\n{'='*60}")
            print(f"📦 BATCH #{batch_count} - {len(tools)} tools")
            print(f"{'='*60}")
            
            for tool in tools:
                await process_tool(crawler, tool)
                total_processed += 1
                
                # Rate limiting: 15 seconds between tools (4 per minute)
                print(f"\n⏳ Rate limit cooldown (15s)...")
                time.sleep(20)
            
            print(f"\n✅ Batch #{batch_count} complete!")
            print(f"📊 Total processed: {total_processed}")
            print(f"\n⏸️  Waiting 10 seconds before next batch...\n")
            time.sleep(10)

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\n\n👋 Shutdown requested. Goodbye!")
    except Exception as e:
        print(f"\n\n💥 Fatal error: {e}")