import psycopg2
from dotenv import load_dotenv
import os

load_dotenv('.env.local')
DB_URL = os.getenv("DATABASE_URL") or 'postgresql://postgres.idfykpdhfmuqkdnfjgqw:E1SqIqRqwhwg20@aws-1-eu-west-1.pooler.supabase.com:6543/postgres'

conn = psycopg2.connect(DB_URL)
cur = conn.cursor()

# Check Vista Social
cur.execute("""
    SELECT name, pricing_model, price_amount, has_trial, trial_days, tagline 
    FROM tools 
    WHERE name = 'Vista Social'
""")
row = cur.fetchone()

if row:
    print("=== VISTA SOCIAL ===")
    print(f"Name: {row[0]}")
    print(f"Pricing Model: {row[1]}")
    print(f"Price: ${row[2]}")
    print(f"Has Trial: {row[3]}")
    print(f"Trial Days: {row[4]}")
    print(f"Tagline: {row[5]}")
else:
    print("Vista Social not found")

# Check a few other recently enriched tools
print("\n=== SAMPLE OF RECENT ENRICHMENTS ===")
cur.execute("""
    SELECT name, pricing_model, price_amount, trial_days
    FROM tools 
    WHERE enrichment_status = 'completed'
    ORDER BY updated_at DESC
    LIMIT 10
""")

for row in cur.fetchall():
    print(f"{row[0]}: {row[1]} | ${row[2]} | {row[3]} day trial")

conn.close()
