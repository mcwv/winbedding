import psycopg2
import os
from dotenv import load_dotenv

load_dotenv('.env.local')

DB_URL = os.getenv("DATABASE_URL") or 'postgresql://postgres.idfykpdhfmuqkdnfjgqw:E1SqIqRqwhwg20@aws-1-eu-west-1.pooler.supabase.com:6543/postgres'

conn = psycopg2.connect(DB_URL)
cur = conn.cursor()

# Count missing reddit_morsels
cur.execute("SELECT COUNT(*) FROM tools WHERE reddit_morsels IS NULL OR jsonb_array_length(reddit_morsels) = 0")
missing_reddit = cur.fetchone()[0]

# Count missing adams_description
cur.execute("SELECT COUNT(*) FROM tools WHERE adams_description IS NULL OR adams_description = ''")
missing_adams = cur.fetchone()[0]

# Count total published
cur.execute("SELECT COUNT(*) FROM tools WHERE is_published = TRUE")
total_published = cur.fetchone()[0]

# Count total tools
cur.execute("SELECT COUNT(*) FROM tools")
total_tools = cur.fetchone()[0]

print(f"=== V3 Enrichment Status ===")
print(f"Total tools: {total_tools}")
print(f"Published tools: {total_published}")
print(f"\nMissing reddit_morsels: {missing_reddit}")
print(f"Missing adams_description: {missing_adams}")
print(f"\nTools with both: {total_tools - max(missing_reddit, missing_adams)}")

conn.close()
