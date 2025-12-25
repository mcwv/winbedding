import os
import json
import psycopg2
from psycopg2.extras import RealDictCursor, Json
import google.generativeai as genai
from dotenv import load_dotenv
from datetime import datetime
import time

# ==========================================
# CONFIGURATION
# ==========================================

load_dotenv('.env.local')

DB_URL = os.getenv("DATABASE_URL") or 'postgresql://postgres.idfykpdhfmuqkdnfjgqw:E1SqIqRqwhwg20@aws-1-eu-west-1.pooler.supabase.com:6543/postgres'

GENAI_API_KEY = os.getenv("GEMINI_API_KEY")
genai.configure(api_key=GENAI_API_KEY)

# Use gemini-flash-latest for best compatibility
model = genai.GenerativeModel('gemini-flash-latest')

# ==========================================
# DATABASE OPERATIONS
# ==========================================

def get_db_connection():
    return psycopg2.connect(DB_URL)

def fetch_tools_for_enrichment(limit=10):
    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            # PRIORITIZE HUBSPOT FOR TESTING as requested
            cur.execute("""
                SELECT id, name, website_url, tracking_metadata 
                FROM tools 
                WHERE name ILIKE '%HubSpot%'
                LIMIT 1
            """)
            hubspot = cur.fetchone()
            
            if hubspot:
                print(f"--- TESTING MODE: Re-processing {hubspot['name']} ---")
                return [hubspot]

            # Fallback for batch processing later
            cur.execute("""
                SELECT id, name, website_url, tracking_metadata 
                FROM tools 
                WHERE tracking_metadata IS NOT NULL 
                AND (v2_category IS NULL OR v2_category = 'Other')
                ORDER BY quality_score DESC
                LIMIT %s
            """, (limit,))
            return cur.fetchall()
    finally:
        conn.close()

def save_gemini_enrichment(tool_id, data):
    conn = get_db_connection()
    try:
        with conn.cursor() as cur:
            cur.execute("""
                UPDATE tools 
                SET 
                    description = COALESCE(NULLIF(%s, ''), description),
                    logo_url = COALESCE(NULLIF(%s, ''), logo_url),
                    v2_category = %s,
                    v2_tags = %s,
                    
                    -- V3 Technical Fields
                    platforms = %s,
                    api_available = %s,
                    pricing_model = %s,
                    has_free_trial = %s,
                    
                    -- V3 Experience Fields
                    learning_curve = %s,
                    support_options = %s,
                    integrations = %s,
                    target_audience = %s,
                    
                    -- V3 Pilot Fields
                    adams_description = %s,
                    
                    updated_at = NOW(),
                    enrichment_status = 'completed'
                WHERE id = %s
            """, (
                data.get('description'),
                data.get('logo_url'),
                data.get('category', 'Other'),
                data.get('tags', []),
                
                # Technical
                data.get('platforms', []),
                data.get('api_available'),
                data.get('pricing_model'),
                data.get('has_free_trial'),
                
                # Experience
                data.get('learning_curve'),
                data.get('support_options', []),
                data.get('integrations', []),
                data.get('target_audience', []),
                
                # Pilot
                data.get('adams_description'),
                
                tool_id
            ))
        conn.commit()
    except Exception as e:
        print(f"   DB Error: {e}")
    finally:
        conn.close()

# ==========================================
# GEMINI ANALYSIS
# ==========================================

def build_prompt(tool_name, website_url, metadata):
    scraped_content = metadata.get('scraped_content', {}).get('clean_text', '')
    raw_meta = metadata.get('metadata', {})
    
    prompt = f"""
    You are a meticulous Data Analyst for a Software Directory.
    Analyze the tool "{tool_name}" ({website_url}) based on the metadata below.
    
    STRICT GUARDRAILS:
    1. DO NOT HALLUCINATE. If a specific detail (like API access or Pricing) is not explicitly mentioned or clearly implied by the nature of the tool, return null.
    2. Be skeptical. Marketing copy often claims "All-in-one" - verifies specifically what it ACTUALLY does.
    3. For 'Adams Description', be witty and cynical but accurate (Douglas Adams style).
    
    RAW METADATA:
    {json.dumps(raw_meta, indent=2)}
    
    WEBSITE CONTENT:
    {scraped_content[:6000]}
    
    ---
    RETURN JSON ONLY:
    {{
        "description": "2-3 sentence professional summary",
        "category": "Pick one: Marketing & SEO, AI Chat, etc.",
        "tags": ["specific", "tags", "max-5"],
        
        "platforms": ["Web", "iOS", "Android", "Windows", "Mac", "Linux"] (Extract only supported),
        "api_available": true/false/null (Is there a Developer API?),
        "pricing_model": "Free / Freemium / Paid / Contact / Open Source",
        "has_free_trial": true/false/null,
        
        "learning_curve": "Low / Moderate / High" (Estimate based on feature complexity),
        "support_options": ["Email", "Chat", "Phone", "Docs", "Community"] (Extract available channels),
        "integrations": ["List", "Top", "5", "Integrations"],
        "target_audience": ["Startups", "Enterprise", "Creators", "Developers"],
        
        "adams_description": "A satirical, Douglas Adams-style guide description (max 250 chars). e.g. 'Mostly harmless, but likely to cost you your sanity.'"
    }}
    """
    return prompt

async def enrich_tool(tool):
    print(f"Enriching {tool['name']}...")
    prompt = build_prompt(tool['name'], tool['website_url'], tool['tracking_metadata'])
    
    try:
        response = model.generate_content(
            prompt,
            generation_config=genai.types.GenerationConfig(
                response_mime_type="application/json",
            )
        )
        
        result = json.loads(response.text)
        print(f"   Success! Extracted data for {tool['name']}.")
        print(f"   Category: {result.get('category')}")
        print(f"   Integrations: {result.get('integrations')}")
        print(f"   Adams: {result.get('adams_description')}")
        
        save_gemini_enrichment(tool['id'], result)
        return True
    except Exception as e:
        print(f"   ERROR: {e}")
        return False

# ==========================================
# MAIN LOOP
# ==========================================

async def main():
    print("--- Starting V3 Enrichment Script ---")
    tools = fetch_tools_for_enrichment(limit=5)
    
    if not tools:
        print("No tools found.")
        return

    for tool in tools:
        await enrich_tool(tool)
        time.sleep(2) # Rate limit

if __name__ == "__main__":
    import asyncio
    asyncio.run(main())
