"""
OpenAI enrichment with structured outputs (JSON schema validation).
Uses response_format, not function calling.
"""
import asyncio
import json
import time
from openai import OpenAI
import psycopg2
from dotenv import load_dotenv
import os

# Import regex pricing extractor
import sys
sys.path.append(os.path.dirname(__file__))
from extract_pricing_regex import extract_pricing_with_regex

load_dotenv('.env.local')

DB_URL = os.getenv("DATABASE_URL")
OPENAI_KEY = os.getenv("OPENAI_API_KEY")

client = OpenAI(api_key=OPENAI_KEY)

# JSON Schema for structured outputs
V3_SCHEMA = {
    "type": "json_schema",
    "json_schema": {
        "name": "tool_enrichment",
        "strict": True,
        "schema": {
            "type": "object",
            "properties": {
                "tagline": {
                    "type": "string",
                    "description": "50-80 char value proposition from homepage"
                },
                "description": {
                    "type": "string",
                    "description": "2-3 paragraphs from homepage content"
                },
                "platforms": {
                    "type": "array",
                    "items": {
                        "type": "string",
                        "enum": ["Web", "Desktop", "Mobile", "iOS", "Android", "Windows", "Mac", "Linux"]
                    },
                    "description": "Platforms explicitly mentioned on site"
                },
                "features": {
                    "type": "array",
                    "items": {"type": "string"},
                    "description": "5-8 key features from homepage"
                },
                "use_cases": {
                    "type": "array",
                    "items": {"type": "string"},
                    "description": "3-5 use cases from site"
                },
                "tags": {
                    "type": "array",
                    "items": {"type": "string"},
                    "description": "8-12 specific tags"
                },
                "pros": {
                    "type": "array",
                    "items": {"type": "string"},
                    "description": "4-6 strengths from site or social data"
                },
                "cons": {
                    "type": "array",
                    "items": {"type": "string"},
                    "description": "3-5 honest limitations from social data"
                },
                "alternatives": {
                    "type": "array",
                    "items": {"type": "string"},
                    "description": "Competitors mentioned in social data"
                },
                "best_for": {
                    "type": "string",
                    "description": "1-2 sentences on ideal user"
                },
                "verdict": {
                    "type": "string",
                    "description": "2 sentence honest assessment"
                }
            },
            "required": ["tagline", "description", "pros", "cons", "best_for", "verdict"],
            "additionalProperties": False
        }
    }
}

def build_prompt(tool_name, website_url, metadata, reddit_morsels):
    """Build prompt for OpenAI (no pricing - handled by regex)."""
    scraped_content = metadata.get('scraped_content', {}).get('clean_text', '')
    
    return f"""Extract information for "{tool_name}" from the data below.

DO NOT extract pricing - that's handled separately.

WEBSITE CONTENT:
{scraped_content[:15000]}

SOCIAL FEEDBACK:
{json.dumps(reddit_morsels, indent=2) if reddit_morsels else "No social data"}

Extract:
- Tagline from homepage hero
- Description from homepage
- Platforms only if explicitly mentioned
- Features from site
- Use cases from site
- Tags (specific, not generic)
- Pros from site or social data
- Cons from social data (be honest)
- Alternatives mentioned in social data
- Best for (ideal user profile)
- Verdict (honest 2-sentence assessment)

Be specific, not generic. If data not found, use empty arrays.
"""

def get_db_connection():
    return psycopg2.connect(DB_URL)

def fetch_tools(limit=10):
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

async def enrich_tool_openai(tool):
    """Enrich with OpenAI structured outputs + regex pricing."""
    tool_id = tool['id']
    tool_name = tool['name']
    website_url = tool['website_url']
    metadata = tool['tracking_metadata'] or {}
    reddit_morsels = tool['reddit_morsels'] or []
    
    print(f"\n[{tool_name}]")
    
    # Step 1: Regex pricing
    scraped_text = metadata.get('scraped_content', {}).get('clean_text', '')
    pricing_data = extract_pricing_with_regex(scraped_text)
    print(f"  Pricing: {pricing_data['pricing_model']} ${pricing_data['price_amount']}")
    
    # Step 2: OpenAI structured output
    prompt = build_prompt(tool_name, website_url, metadata, reddit_morsels)
    
    try:
        response = client.chat.completions.create(
            model="gpt-4o-2024-08-06",  # Supports structured outputs
            messages=[{"role": "user", "content": prompt}],
            response_format=V3_SCHEMA,
            temperature=0
        )
        
        openai_data = json.loads(response.choices[0].message.content)
        
        # Step 3: Combine
        combined_data = {**openai_data, **pricing_data}
        
        # Save
        save_enrichment(tool_id, combined_data)
        print(f"  ✓ {openai_data.get('tagline', '')[:60]}")
        return True
        
    except Exception as e:
        print(f"  ✗ Error: {str(e)[:100]}")
        return False

def save_enrichment(tool_id, data):
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
    print("=== OpenAI Structured Output Enrichment ===\n")
    tools = fetch_tools(limit=5)  # Test with 5
    
    if not tools:
        print("No tools need enrichment")
        return
    
    print(f"Processing {len(tools)} tools...\n")
    
    success = 0
    for tool in tools:
        if await enrich_tool_openai(tool):
            success += 1
        time.sleep(1)
    
    print(f"\n=== Complete: {success}/{len(tools)} ===")

if __name__ == "__main__":
    asyncio.run(main())
