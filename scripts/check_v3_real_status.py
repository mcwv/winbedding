import psycopg2
import os
from dotenv import load_dotenv

load_dotenv('.env.local')

DB_URL = os.getenv("DATABASE_URL") or 'postgresql://postgres.idfykpdhfmuqkdnfjgqw:E1SqIqRqwhwg20@aws-1-eu-west-1.pooler.supabase.com:6543/postgres'

conn = psycopg2.connect(DB_URL)
cur = conn.cursor()

# Count by enrichment_status
cur.execute("SELECT enrichment_status, COUNT(*) FROM tools GROUP BY enrichment_status")
status_counts = cur.fetchall()

print("=== Enrichment Status Breakdown ===")
for status, count in status_counts:
    print(f"{status or 'NULL'}: {count}")

# Count tools with full V3 data (has tagline, pros, cons)
cur.execute("""
    SELECT COUNT(*) FROM tools 
    WHERE tagline IS NOT NULL 
    AND pros IS NOT NULL 
    AND cons IS NOT NULL
""")
full_v3 = cur.fetchone()[0]

print(f"\n=== V3 Enrichment ===")
print(f"Tools with full V3 data (tagline + pros + cons): {full_v3}")

cur.execute("SELECT COUNT(*) FROM tools WHERE is_published = TRUE")
total_published = cur.fetchone()[0]
print(f"Total published: {total_published}")
print(f"Remaining to enrich: {total_published - full_v3}")

conn.close()
