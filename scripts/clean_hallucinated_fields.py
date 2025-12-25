import psycopg2
from dotenv import load_dotenv
import os

load_dotenv('.env.local')
DB_URL = os.getenv("DATABASE_URL") or 'postgresql://postgres.idfykpdhfmuqkdnfjgqw:E1SqIqRqwhwg20@aws-1-eu-west-1.pooler.supabase.com:6543/postgres'

conn = psycopg2.connect(DB_URL)
cur = conn.cursor()

# Null out the hallucinated fields while keeping good data
print("=== Cleaning Hallucinated Fields ===")
print("Nulling out: pricing_model, price_amount, trial_days, has_trial, integrations")
print("Keeping: tagline, pros, cons, platforms, learning_curve, support_options, description, features, etc.\n")

cur.execute("""
    UPDATE tools 
    SET 
        pricing_model = NULL,
        price_amount = NULL,
        price_currency = NULL,
        has_trial = NULL,
        trial_days = NULL,
        integrations = NULL,
        enrichment_status = 'needs_pricing'
    WHERE enrichment_status = 'completed'
""")

affected = cur.rowcount
conn.commit()

print(f"✓ Cleaned {affected} tools")
print(f"✓ Preserved: taglines, pros/cons, platforms, learning curve, support, features")
print(f"✓ Status changed to 'needs_pricing' for re-enrichment")

conn.close()
