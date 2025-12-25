import psycopg2, os
from dotenv import load_dotenv

load_dotenv('.env.local')
conn = psycopg2.connect(os.getenv('DATABASE_URL'))
cur = conn.cursor()

print("Connection successful.")

cur.execute("SELECT table_name FROM information_schema.views WHERE table_schema = 'public'")
views = [r[0] for r in cur.fetchall()]
print(f"Views: {views}")

if 'published_tools' in views:
    cur.execute("SELECT column_name FROM information_schema.columns WHERE table_name = 'published_tools'")
    cols = [r[0] for r in cur.fetchall()]
    print(f"Columns in 'published_tools': {cols}")

conn.close()
