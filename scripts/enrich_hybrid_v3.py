"""
Hybrid V3 Enrichment: Regex for pricing, Claude for qualitative data.

NO HALLUCINATION APPROACH:
- Regex extracts pricing from metadata (deterministic)
- Claude extracts taglines, pros/cons (temperature=0)
- Claude NEVER asked about pricing
"""
import asyncio
import json
import time
from anthropic import Anthropic
import psycopg2
from psycopg2.extras import Json
from dotenv import load_dotenv
import os
import re

load_dotenv('.env.local')

# Import the regex pricing extractor
from extract_pricing_regex import extract_pricing_with_regex

DB_URL = os.getenv("DATABASE_URL") or 'postgresql://postgres.idfykpdhfmuqkdnfjgqw:E1SqIqRqwhwg20@aws-1-eu-west-1.pooler.supabase.com:6543/postgres'
ANTHROPIC_KEY = os.getenv("ANTHROPIC_API_KEY")

client = Anthropic(api_key=ANTHROPIC_KEY)

def get_db_connection():
    return psycopg2.connect(DB_URL)

def fetch_tools_for_enrichment(limit=50):
    """Fetch tools that need V3 enrichment."""
    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
            cur.execute("""
                SELECT id, name, website_url, tracking_metadata, reddit_morsels
                FROM tools 
                WHERE tracking_metadata IS NOT NULL
                AND (tagline IS NULL OR tagline = '')
                ORDER BY quality_score DESC NULLS LAST
                LIMIT %s
            """, (limit,))
            return cur.fetchall()
    finally:
        conn.close()

def build_claude_prompt_no_pricing(tool_name, website_url, metadata, reddit_morsels):
    """
    Claude prompt WITHOUT pricing fields.
    Pricing is handled by regex, not AI.
    """
    scraped_content = metadata.get('scraped_content', {}).get('clean_text', '')
    
    prompt = f"""You are a professional software analyst. Extract ONLY qualitative data for "{tool_name}".

DO NOT extract pricing - that's handled separately.

DATA SOURCES:
NAME: {tool_name}
URL: {website_url}

WEBSITE CONTENT:
{scraped_content[:15000]}

SOCIAL FEEDBACK:
{json.dumps(reddit_morsels, indent=2) if reddit_morsels else "No social data available"}

EXTRACT ONLY:
{{
  "tagline": "50-80 char value proposition from homepage hero",
  "description": "2-3 paragraphs from homepage",
  "platforms": ["Web", "Desktop", "Mobile", "iOS", "Android"] (only if explicitly mentioned),
  "features": ["feature 1", "feature 2"] (5-8 key features from site),
  "use_cases": ["use case 1", "use case 2"] (3-5 use cases),
  "tags": ["tag1", "tag2"] (8-12 specific tags),
  "pros": ["pro 1", "pro 2"] (4-6 from social data or site),
  "cons": ["con 1", "con 2"] (3-5 honest limitations from social data),
  "alternatives": ["Alternative 1", "Alternative 2"] (competitors mentioned in social data),
  "best_for": "1-2 sentences on ideal user",
  "verdict": "2 sentence honest assessment"
}}

RULES:
- Be specific, not generic
- Use exact quotes from site/social data
- If data not found, use empty array [] or null
- NO PRICING FIELDS - they're extracted separately

Return ONLY valid JSON, no markdown.
"""
    return prompt

async def enrich_tool_hybrid(tool):
    """Hybrid enrichment: regex pricing + Claude qualitative."""
    tool_id = tool['id']
    tool_name = tool['name']
    website_url = tool['website_url']
    metadata = tool['tracking_metadata'] or {}
    reddit_morsels = tool['reddit_morsels'] or []
    
    print(f"\nEnriching: {tool_name}")
    
    # STEP 1: Extract pricing with regex (no AI)
    scraped_text = metadata.get('scraped_content', {}).get('clean_text', '')
    pricing_data = extract_pricing_with_regex(scraped_text)
    print(f"  Regex pricing: {pricing_data['pricing_model']} ${pricing_data['price_amount']}")
    
    # STEP 2: Extract qualitative data with Claude (temp=0)
    prompt = build_claude_prompt_no_pricing(tool_name, website_url, metadata, reddit_morsels)
    
    try:
        response = client.messages.create(
            model="claude-3-haiku-20240307",
            max_tokens=2000,
            temperature=0,  # Deterministic output
            messages=[{"role": "user", "content": prompt}]
        )
        
        content = response.content[0].text
        # Remove markdown if present
        if '```json' in content:
            content = content.split('```json')[1].split('```')[0]
        elif '```' in content:
            content = content.split('```')[1].split('```')[0]
        
        claude_data = json.loads(content.strip())
        
        # STEP 3: Combine regex pricing + Claude qualitative
        combined_data = {
            **claude_data,
            **pricing_data  # Regex pricing overrides any AI guesses
        }
        
        # Save to database
        save_enrichment(tool_id, combined_data)
        print(f"  ✓ Saved: {claude_data.get('tagline', '')[:50]}...")
        return True
        
    except Exception as e:
        print(f"  ✗ Error: {str(e)[:100]}")
        return False

def save_enrichment(tool_id, data):
    """Save combined regex + Claude data."""
    conn = get_db_connection()
    try:
        with conn.cursor() as cur:
            cur.execute("""
                UPDATE tools 
                SET 
                    tagline = %s,
                    description = %s,
                    pricing_model = %s,
                    price_amount = %s,
                    price_currency = %s,
                    trial_days = %s,
                    platforms = %s,
                    features = %s,
                    use_cases = %s,
                    tags = %s,
                    pros = %s,
                    cons = %s,
                    alternatives = %s,
                    best_for = %s,
                    verdict = %s,
                    enrichment_status = 'completed',
                    updated_at = NOW()
                WHERE id = %s
            """, (
                data.get('tagline'),
                data.get('description'),
                data.get('pricing_model'),
                data.get('price_amount'),
                data.get('price_currency', 'USD'),
                data.get('trial_days'),
                data.get('platforms', []),
                data.get('features', []),
                data.get('use_cases', []),
                data.get('tags', []),
                data.get('pros', []),
                data.get('cons', []),
                data.get('alternatives', []),
                data.get('best_for'),
                data.get('verdict'),
                tool_id
            ))
        conn.commit()
    finally:
        conn.close()

async def main():
    print("=== Hybrid V3 Enrichment (Regex + Claude) ===\n")
    tools = fetch_tools_for_enrichment(limit=10)  # Start with 10 for testing
    
    if not tools:
        print("No tools need enrichment")
        return
    
    print(f"Processing {len(tools)} tools...\n")
    
    success = 0
    for i, tool in enumerate(tools, 1):
        print(f"[{i}/{len(tools)}]", end=" ")
        if await enrich_tool_hybrid(tool):
            success += 1
        time.sleep(2)  # Rate limiting
    
    print(f"\n=== Complete: {success}/{len(tools)} successful ===")

if __name__ == "__main__":
    asyncio.run(main())
