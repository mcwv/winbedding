import os
import psycopg2
from dotenv import load_dotenv

load_dotenv('.env.local')

DB_URL = os.getenv("DATABASE_URL") or 'postgresql://postgres.idfykpdhfmuqkdnfjgqw:E1SqIqRqwhwg20@aws-1-eu-west-1.pooler.supabase.com:6543/postgres'

def run_migration():
    sql_path = 'scripts/v3_migration.sql'
    if not os.path.exists(sql_path):
        print(f"Error: {sql_path} not found")
        return

    with open(sql_path, 'r') as f:
        sql = f.read()

    print(f"Executing migration from {sql_path}...")
    
    conn = None
    try:
        conn = psycopg2.connect(DB_URL)
        with conn.cursor() as cur:
            cur.execute(sql)
        conn.commit()
        print("Migration successful!")
    except Exception as e:
        print(f"Migration failed: {e}")
        if conn:
            conn.rollback()
    finally:
        if conn:
            conn.close()

if __name__ == "__main__":
    run_migration()
