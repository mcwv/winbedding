"""
Safe cleanup preview - shows what would be changed WITHOUT making changes.
"""
import psycopg2
from dotenv import load_dotenv
import os

load_dotenv('.env.local')
DB_URL = os.getenv("DATABASE_URL") or 'postgresql://postgres.idfykpdhfmuqkdnfjgqw:E1SqIqRqwhwg20@aws-1-eu-west-1.pooler.supabase.com:6543/postgres'

conn = psycopg2.connect(DB_URL)
cur = conn.cursor()

# Get sample of what would be affected
cur.execute("""
    SELECT 
        name,
        pricing_model,
        price_amount,
        trial_days,
        api_available,
        ARRAY_LENGTH(integrations, 1) as integration_count,
        ARRAY_LENGTH(pros, 1) as pro_count,
        ARRAY_LENGTH(cons, 1) as con_count,
        tagline
    FROM tools 
    WHERE enrichment_status = 'completed'
    LIMIT 10
""")

print("=== PREVIEW: What would be cleaned ===\n")
print("Fields that would be NULLED:")
print("  - pricing_model")
print("  - price_amount")
print("  - trial_days")
print("  - api_available")
print("  - integrations")
print("  - support_options")
print("  - learning_curve")
print("  - documentation_quality")
print("  - not_recommended_for")
print("  - transparency_score")
print("  - experience_score")

print("\nFields that would be KEPT:")
print("  - tagline")
print("  - description")
print("  - pros")
print("  - cons")
print("  - platforms")
print("  - features")
print("  - use_cases")
print("  - alternatives")
print("  - best_for")
print("  - verdict")

print("\n=== Sample of 10 tools that would be affected ===\n")
for row in cur.fetchall():
    name, pricing, price, trial, api, int_count, pro_count, con_count, tagline = row
    print(f"{name}:")
    print(f"  Would lose: {pricing}, ${price}, {trial} days, API={api}, {int_count} integrations")
    print(f"  Would keep: {pro_count} pros, {con_count} cons, tagline")
    print()

cur.execute("SELECT COUNT(*) FROM tools WHERE enrichment_status = 'completed'")
total = cur.fetchone()[0]
print(f"\nTotal tools affected: {total}")

conn.close()
print("\n*** NO CHANGES MADE - This is just a preview ***")
