import psycopg2
from dotenv import load_dotenv
import os
import json

load_dotenv('.env.local')
DB_URL = os.getenv("DATABASE_URL") or 'postgresql://postgres.idfykpdhfmuqkdnfjgqw:E1SqIqRqwhwg20@aws-1-eu-west-1.pooler.supabase.com:6543/postgres'

conn = psycopg2.connect(DB_URL)
cur = conn.cursor()

# Get all enriched tools
cur.execute("""
    SELECT 
        name, 
        tagline,
        pricing_model, 
        price_amount, 
        trial_days,
        platforms,
        api_available,
        learning_curve,
        support_options,
        integrations,
        ARRAY_LENGTH(pros, 1) as pro_count,
        ARRAY_LENGTH(cons, 1) as con_count,
        pros,
        cons
    FROM tools 
    WHERE enrichment_status = 'completed'
    ORDER BY updated_at DESC
    LIMIT 20
""")

print("=== V3 ENRICHMENT AUDIT (Last 20 Tools) ===\n")

for row in cur.fetchall():
    name, tagline, pricing, price, trial, platforms, api, learning, support, integrations, pro_count, con_count, pros, cons = row
    
    print(f"[{name}]")
    print(f"   Tagline: {tagline[:80]}..." if tagline and len(tagline) > 80 else f"   Tagline: {tagline}")
    print(f"   Pricing: {pricing} | ${price} | {trial} day trial")
    print(f"   Platforms: {platforms}")
    print(f"   API: {api}")
    print(f"   Learning: {learning}")
    print(f"   Support: {support}")
    print(f"   Integrations: {integrations[:3] if integrations else None}...")
    print(f"   Pros: {pro_count} | Cons: {con_count}")
    
    # Show first pro/con as sample
    if pros and len(pros) > 0:
        print(f"      Pro sample: {pros[0][:60]}...")
    if cons and len(cons) > 0:
        print(f"      Con sample: {cons[0][:60]}...")
    
    print()

# Check for suspicious patterns
print("\n=== SUSPICIOUS PATTERNS ===")

cur.execute("SELECT COUNT(*) FROM tools WHERE trial_days = 14 AND enrichment_status = 'completed'")
print(f"Tools with exactly 14-day trial: {cur.fetchone()[0]}")

cur.execute("SELECT COUNT(*) FROM tools WHERE price_amount = 0 AND pricing_model = 'freemium' AND enrichment_status = 'completed'")
print(f"Freemium tools with $0 price: {cur.fetchone()[0]}")

cur.execute("SELECT COUNT(*) FROM tools WHERE price_amount IS NULL AND pricing_model != 'free' AND enrichment_status = 'completed'")
print(f"Non-free tools with NULL pricing: {cur.fetchone()[0]}")

conn.close()
