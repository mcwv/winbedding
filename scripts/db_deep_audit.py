import psycopg2, os
from dotenv import load_dotenv

load_dotenv('.env.local')
db_url = os.getenv('DATABASE_URL')
conn = psycopg2.connect(db_url)
cur = conn.cursor()

# Get connection info
cur.execute("SELECT current_database(), current_schema()")
db_info = cur.fetchone()
print(f"Connected to DB: {db_info[0]}, Schema: {db_info[1]}")

# List all columns in public.tools
cur.execute("""
    SELECT column_name 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'tools'
    ORDER BY column_name
""")
cols = [r[0] for r in cur.fetchall()]
print(f"Columns in public.tools: {', '.join(cols)}")

# Count missing morsels
if 'reddit_morsels' in cols:
    cur.execute("SELECT COUNT(*) FROM tools WHERE reddit_morsels IS NULL OR reddit_morsels = '[]'::jsonb")
    missing = cur.fetchone()[0]
    print(f"Tools in DB missing reddit_morsels: {missing}")
else:
    print("CRITICAL: reddit_morsels NOT FOUND in database columns!")

conn.close()
