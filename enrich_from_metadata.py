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

# Prefer DATABASE_URL or construct from Supabase info
DB_URL = os.getenv("DATABASE_URL")
if not DB_URL:
    # Use the hardcoded Supabase URL if nothing else is provided
    DB_URL = 'postgresql://postgres.idfykpdhfmuqkdnfjgqw:E1SqIqRqwhwg20@aws-1-eu-west-1.pooler.supabase.com:6543/postgres'

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
            # Fetch tools where tracking_metadata is present but enrichment is not done
            # Or where specific fields are missing
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

# Taxonomy V2 Categories
CATEGORIES = [
    "AI Chat & Assistants", "Image & Art Generation", "Video Generation", 
    "Music & Audio", "Writing & Content", "Code & Development", 
    "Business & Productivity", "Marketing & SEO", "Data & Analytics", 
    "Design & Graphics", "Voice & Speech", "Translation & Language", 
    "Education & Learning", "Research & Summarization", "Automation & Workflows", 
    "E-commerce & Sales", "Social Media", "Gaming & Entertainment", 
    "Finance & Crypto", "Other"
]

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
                    updated_at = NOW()
                WHERE id = %s
            """, (
                data.get('description'),
                data.get('logo_url'),
                data.get('category', 'Other'),
                data.get('tags', []),
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
    Analyze the following tool metadata and website content for "{tool_name}" ({website_url}).
    Extract high-accuracy classification and descriptive data.

    NAME: {tool_name}
    URL: {website_url}
    
    RAW METADATA:
    {json.dumps(raw_meta, indent=2)}
    
    WEBSITE CONTENT SNIPPET:
    {scraped_content[:4000]}
    
    ---
    RETURN A JSON OBJECT WITH THESE FIELDS:
    1. "description": A concise, professional 2-3 sentence description of the tool's core value proposition.
    2. "logo_url": The absolute URL to the best logo found in the metadata (prefer og:image or favicon). If not found, return null.
    3. "category": Choose the MOST ACCURATE category from this list: {", ".join(CATEGORIES)}. 
       - IMPORTANT: If you are NOT 90% sure based on the data, choose "Other". Accuracy for GTM/SEO is critical.
       - GUIDELINE: Map "Career", "Interview Prep", "Resume Building", or "Job Search" tools to "Education & Learning" if they help the candidate. Map them to "Business & Productivity" only if they are primarily for HR/Enterprise recruitment automation.
    4. "tags": An array of 5-8 specific, non-generic tags (e.g. "writing-assistant", "seo-optimization", "open-source").
    
    Ensure the JSON is valid and only return the JSON object.
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
        print(f"   OK: Extracted description: {result.get('description')[:50]}...")
        print(f"   OK: Found Logo: {result.get('logo_url')}")
        
        save_gemini_enrichment(tool['id'], result)
        return True
    except Exception as e:
        print(f"   ERROR: {e}")
        return False

# ==========================================
# MAIN LOOP
# ==========================================

async def main():
    print("--- Starting Gemini Enrichment Batch ---")
    tools = fetch_tools_for_enrichment(limit=20)
    
    if not tools:
        print("No tools found needing enrichment.")
        return

    success_count = 0
    for tool in tools:
        if await enrich_tool(tool):
            success_count += 1
        # Simple rate limiting for Free Tier (15 RPM)
        time.sleep(15)
        
    print(f"Batch Complete. {success_count}/{len(tools)} tools enriched.")

if __name__ == "__main__":
    import asyncio
    asyncio.run(main())
