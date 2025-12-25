import psycopg2, os
from dotenv import load_dotenv

load_dotenv('.env.local')
conn = psycopg2.connect(os.getenv('DATABASE_URL'))
cur = conn.cursor()

cur.execute("SELECT COUNT(id) FROM tools WHERE reddit_morsels IS NULL OR reddit_morsels = '[]'::jsonb OR reddit_morsels = '{}'::jsonb")
count = cur.fetchone()[0]

cur.execute("SELECT COUNT(id) FROM tools")
total = cur.fetchone()[0]

print(f"Total tools: {total}")
print(f"Tools missing 'reddit_morsels': {count}")

conn.close()
