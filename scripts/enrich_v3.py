import os
import json
import psycopg2
from psycopg2.extras import RealDictCursor, Json
import anthropic
from dotenv import load_dotenv
from datetime import datetime
import time

# ==========================================
# CONFIGURATION
# ==========================================

load_dotenv('.env.local')

DB_URL = os.getenv("DATABASE_URL")
if not DB_URL:
    DB_URL = 'postgresql://postgres.idfykpdhfmuqkdnfjgqw:E1SqIqRqwhwg20@aws-1-eu-west-1.pooler.supabase.com:6543/postgres'

anthropic_client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

# Use Claude 3 Haiku for the highest stability and speed
MODEL = "claude-3-haiku-20240307"

# ==========================================
# DATABASE OPERATIONS
# ==========================================

def get_db_connection():
    return psycopg2.connect(DB_URL)

def fetch_pilot_tools(limit=10):
    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            # Pick tools that need V3 enrichment (missing reddit_morsels AND adams_description)
            cur.execute("""
                SELECT id, name, website_url, tracking_metadata, reddit_morsels 
                FROM tools 
                WHERE enrichment_status = 'reachable' 
                AND (reddit_morsels IS NULL OR jsonb_array_length(reddit_morsels) = 0)
                AND (adams_description IS NULL OR adams_description = '')
                ORDER BY quality_score DESC
                LIMIT %s
            """, (limit,))
            return cur.fetchall()
    finally:
        conn.close()

def save_v3_enrichment(tool_id, data):
    conn = get_db_connection()
    try:
        # Simple score placeholders (real logic can be more complex)
        transparency_score = 70
        experience_score = 8.5
        quality_score = 90

        with conn.cursor() as cur:
            cur.execute("""
                UPDATE tools 
                SET 
                    tagline = %s,
                    description = %s,
                    pricing_model = %s,
                    price_amount = %s,
                    price_currency = %s,
                    has_free_tier = %s,
                    has_trial = %s,
                    trial_days = %s,
                    tags = %s,
                    use_cases = %s,
                    features = %s,
                    target_audience = %s,
                    operating_system = %s,
                    platforms = %s,
                    skill_level = %s,
                    learning_curve = %s,
                    documentation_quality = %s,
                    support_options = %s,
                    api_available = %s,
                    integrations = %s,
                    alternatives = %s,
                    pros = %s,
                    cons = %s,
                    best_for = %s,
                    not_recommended_for = %s,
                    verdict = %s,
                    transparency_score = %s,
                    experience_score = %s,
                    quality_score = %s,
                    enrichment_status = 'completed',
                    reddit_morsels = %s,
                    ai_data = %s,
                    updated_at = NOW()
                WHERE id = %s
            """, (
                data.get('tagline'),
                data.get('full_description'),
                data.get('pricing_model'),
                data.get('starting_price'),
                data.get('price_currency', 'USD'),
                data.get('has_free_tier', False),
                data.get('has_trial', False),
                data.get('trial_days'),
                data.get('tags', []),
                data.get('use_cases', []),
                data.get('features', []),
                data.get('target_audience', []),
                data.get('operating_system', []),
                data.get('platforms', []),
                data.get('skill_level', 'all'),
                data.get('learning_curve', 'moderate'),
                data.get('documentation_quality', 'fair'),
                data.get('support_options', []),
                data.get('api_available', False),
                data.get('integrations', []),
                data.get('alternatives', []),
                data.get('pros', []),
                data.get('cons', []),
                data.get('best_for'),
                data.get('not_recommended_for'),
                data.get('verdict'),
                transparency_score,
                experience_score,
                quality_score,
                Json(data.get('social_quotes', [])),  # Save extracted quotes
                Json(data),
                tool_id
            ))
        conn.commit()
    except Exception as e:
        print(f"   DB Error: {e}")
    finally:
        conn.close()

# ==========================================
# PROMPT CONSTRUCTION
# ==========================================

def build_v3_prompt(tool_name, website_url, metadata, reddit_morsels):
    scraped_content = metadata.get('scraped_content', {}).get('clean_text', '')
    
    prompt = f"""
    You are a professional software analyst and tech journalist. Your task is to perform a Deep V3 Enrichment for the tool "{tool_name}".
    
    You are provided with two primary data sources:
    1. **FACTUAL METADATA (From Website)**: Feature lists, pricing pages, and company info.
    2. **SOCIAL SALT (From Reddit, Twitter/X, YouTube, etc.)**: Real user feedback, complaints, and praises.

    ---
    DATA SOURCES:
    NAME: {tool_name}
    URL: {website_url}
    
    WEBSITE CONTENT:
    {scraped_content[:15000]}
    
    SOCIAL MEDIA FEEDBACK (Reddit, X, YouTube, etc.):
    {json.dumps(reddit_morsels, indent=2)}
    
    ---
    GOAL: Synthesize these into a master JSON object for a high-end tools directory.
    
    JSON SCHEMA:
    {{
      "tagline": "A sharp 50-80 character value proposition (no buzzwords)",
      "full_description": "3-4 paragraphs of high-quality descriptive text",
      "pricing_model": "free | freemium | paid | contact | open-source",
      "starting_price": number (lowest monthly price) or null,
      "price_currency": "USD",
      "has_free_tier": boolean,
      "has_trial": boolean,
      "trial_days": number or null,
      "tags": ["specific-tag-1", "specific-tag-2"], (8-12 tags)
      "use_cases": ["scenarion 1", "scenario 2"],
      "features": ["feature 1", "feature 2"],
      "target_audience": ["audience 1"],
      "operating_system": ["Web", "Windows", "macOS"],
      "platforms": ["Browser", "Desktop"],
      "skill_level": "beginner | intermediate | advanced | expert | all",
      "learning_curve": "easy | moderate | steep",
      "documentation_quality": "excellent | good | fair | poor | none",
      "support_options": ["Email", "Community", "Chat"],
      "api_available": boolean,
      "integrations": ["Slack", "Shopify"],
      "alternatives": ["Competitor A", "Competitor B"],
      "pros": ["Specific strength from reddit or site"], (4-6 pros)
      "cons": ["Honest limitation or user complaint from reddit"], (3-6 cons)
      "best_for": "1-2 sentences on the ideal user profile",
      "not_recommended_for": "1 sentence on who should avoid it",
      "verdict": "A hard-hitting 2-sentence final judgment",
      "social_quotes": [
        {{"quote": "Exact user quote from social data", "source": "reddit|twitter|youtube", "sentiment": "positive|negative|neutral"}}
      ] (Extract 3-5 best quotes from the social data that are insightful, specific, and representative)
    }}
    
    CRITICAL INSTRUCTION: Be HONEST about Cons. If Reddit users complain about pricing or UI, include it. Do not just output marketing fluff.
    """
    return prompt

# ==========================================
# EXECUTION
# ==========================================

async def enrich_v3_tool(tool):
    print(f"\nEnriching V3 (Claude): {tool['name']}...")
    prompt = build_v3_prompt(tool['name'], tool['website_url'], tool['tracking_metadata'], tool['reddit_morsels'])
    
    try:
        message = anthropic_client.messages.create(
            model=MODEL,
            max_tokens=4000,
            temperature=0,
            system="You are a professional software analyst. Output ONLY valid JSON matching the schema precisely.",
            messages=[
                {"role": "user", "content": prompt}
            ]
        )
        
        # Extract content from Claude response
        response_text = message.content[0].text
        # Clean up any markdown code blocks if Claude adds them
        if "```json" in response_text:
            response_text = response_text.split("```json")[1].split("```")[0].strip()
        elif "```" in response_text:
            response_text = response_text.split("```")[1].split("```")[0].strip()
            
        result = json.loads(response_text)
        print(f"   OK: Extracted: {result.get('tagline')}")
        print(f"   OK: Sentiment: {len(result.get('pros', []))} Pros / {len(result.get('cons', []))} Cons")
        
        save_v3_enrichment(tool['id'], result)
        return True
    except Exception as e:
        print(f"   ERROR: {e}")
        return False

async def main():
    print("--- V3 Full Enrichment Pass ---")
    tools = fetch_pilot_tools(limit=50)
    
    if not tools:
        print("No tools found needing V3 enrichment.")
        return

    print(f"Selected {len(tools)} tools for V3 enrichment.")
    
    success_count = 0
    for i, tool in enumerate(tools, 1):
        print(f"\n[{i}/{len(tools)}] Processing {tool['name']}...")
        if await enrich_v3_tool(tool):
            success_count += 1
        # Claude rate limit: ~50 RPM, so 2 sec delay is safe
        time.sleep(2)
        
    print(f"\n=== Batch Complete ===")
    print(f"Successfully enriched: {success_count}/{len(tools)}")
    print(f"Failed: {len(tools) - success_count}")

if __name__ == "__main__":
    import asyncio
    asyncio.run(main())
