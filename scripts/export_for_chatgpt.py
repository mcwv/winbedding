"""
Export tools for ChatGPT manual enrichment.
Generates a text file with tool data ready to paste into ChatGPT Playground.
"""
import psycopg2
from dotenv import load_dotenv
import os
import json

load_dotenv('.env.local')
DB_URL = os.getenv("DATABASE_URL")

conn = psycopg2.connect(DB_URL)
cur = conn.cursor()

# Get tools that need enrichment (no tagline yet)
cur.execute("""
    SELECT name, website_url
    FROM tools 
    WHERE (tagline IS NULL OR tagline = '')
    AND website_url IS NOT NULL
    ORDER BY quality_score DESC NULLS LAST
    LIMIT 50
""")

tools = cur.fetchall()

print(f"Exporting {len(tools)} tools for ChatGPT enrichment...\n")

# Create export file
with open('chatgpt_enrichment_batch.txt', 'w', encoding='utf-8') as f:
    f.write("=== TOOLS FOR CHATGPT ENRICHMENT ===\n\n")
    f.write("Instructions: Copy each tool block below and paste into ChatGPT Playground.\n")
    f.write("Use the prompt template from chatgpt_enrichment_prompt.md\n\n")
    f.write("="*80 + "\n\n")
    
    for i, (name, url) in enumerate(tools, 1):
        f.write(f"TOOL #{i}\n")
        f.write("-" * 80 + "\n")
        f.write(f"TOOL NAME: {name}\n")
        f.write(f"WEBSITE: {url}\n\n")
        
        f.write("\n" + "="*80 + "\n\n")

print(f"Exported to: chatgpt_enrichment_batch.txt")
print(f"\nNext steps:")
print("1. Open chatgpt_enrichment_prompt.md for the prompt template")
print("2. Open chatgpt_enrichment_batch.txt for the tool data")
print("3. For each tool, paste into ChatGPT Playground")
print("4. Copy the JSON output")
print("5. Save results for import")

conn.close()
