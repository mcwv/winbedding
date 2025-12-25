import psycopg2
DB_URL = "postgresql://postgres.idfykpdhfmuqkdnfjgqw:E1SqIqRqwhwg20@aws-1-eu-west-1.pooler.supabase.com:6543/postgres"

conn = psycopg2.connect(DB_URL)
cur = conn.cursor()
cur.execute("SELECT pg_get_constraintdef(oid) FROM pg_constraint WHERE conname = 'tools_pricing_model_check'")
print(cur.fetchone()[0])
conn.close()
