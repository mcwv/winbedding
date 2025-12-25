import psycopg2, os
from dotenv import load_dotenv

load_dotenv('.env.local')
conn = psycopg2.connect(os.getenv('DATABASE_URL'))
cur = conn.cursor()

cur.execute("SELECT column_name FROM information_schema.columns WHERE table_name = 'tools'")
columns = [r[0] for r in cur.fetchall()]
print(f"Columns in 'tools' table: {', '.join(columns)}")

conn.close()
