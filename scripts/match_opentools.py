import json
import psycopg2
from dotenv import load_dotenv
import os

load_dotenv('.env.local')
DB_URL = os.getenv("DATABASE_URL") or 'postgresql://postgres.idfykpdhfmuqkdnfjgqw:E1SqIqRqwhwg20@aws-1-eu-west-1.pooler.supabase.com:6543/postgres'

# Load opentools data
with open('opentools_complete.json', 'r', encoding='utf-8') as f:
    opentools = json.load(f)

print(f"OpenTools: {len(opentools)} tools")

# Create lookup by name
opentools_by_name = {tool['tool_name'].lower().strip(): tool for tool in opentools}

# Get our DB tools
conn = psycopg2.connect(DB_URL)
cur = conn.cursor()
cur.execute("SELECT name FROM tools LIMIT 100")
our_tools = [row[0] for row in cur.fetchall()]

print(f"Our DB: {len(our_tools)} tools (sample)")

# Check matches
matches = []
for tool_name in our_tools:
    if tool_name.lower().strip() in opentools_by_name:
        matches.append(tool_name)

print(f"\nMatches: {len(matches)}/{len(our_tools)}")
print("\nSample matches:")
for match in matches[:10]:
    ot_tool = opentools_by_name[match.lower().strip()]
    pricing = ot_tool.get('pricing_plans', [])
    print(f"  {match}: {len(pricing)} pricing plans")
    if pricing:
        print(f"    → {pricing[0].get('title')}: ${pricing[0].get('price')}")

conn.close()
