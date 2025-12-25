import psycopg2
from dotenv import load_dotenv
import os
import json

load_dotenv('.env.local')
DB_URL = os.getenv("DATABASE_URL") or 'postgresql://postgres.idfykpdhfmuqkdnfjgqw:E1SqIqRqwhwg20@aws-1-eu-west-1.pooler.supabase.com:6543/postgres'

conn = psycopg2.connect(DB_URL)
cur = conn.cursor()

# Get Vista Social metadata
cur.execute("SELECT name, tracking_metadata FROM tools WHERE name = 'Vista Social' LIMIT 1")
row = cur.fetchone()

if row:
    name, meta = row
    print(f"=== {name} Metadata Overview ===\n")
    
    # Show top-level structure
    print("Top-level keys:")
    for key in meta.keys():
        print(f"  - {key}")
    
    # Show metadata fields (og tags, etc.)
    if 'metadata' in meta:
        print("\nMetadata fields (first 10):")
        metadata_fields = meta['metadata']
        for i, (key, value) in enumerate(list(metadata_fields.items())[:10]):
            print(f"  {key}: {str(value)[:80]}...")
    
    # Show scraped content sample
    if 'scraped_content' in meta:
        print("\nScraped content keys:")
        for key in meta['scraped_content'].keys():
            print(f"  - {key}")
        
        if 'clean_text' in meta['scraped_content']:
            clean_text = meta['scraped_content']['clean_text']
            print(f"\nClean text sample (first 500 chars):")
            print(clean_text[:500])
            print(f"\n... (total length: {len(clean_text)} chars)")
else:
    print("Vista Social not found")

conn.close()
