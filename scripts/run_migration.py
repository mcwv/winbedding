import os
import psycopg2

DB_URL = "postgresql://postgres.idfykpdhfmuqkdnfjgqw:E1SqIqRqwhwg20@aws-1-eu-west-1.pooler.supabase.com:6543/postgres"

def run_migration():
    try:
        conn = psycopg2.connect(DB_URL)
        cur = conn.cursor()
        
        with open(r"c:\Users\miles\Desktop\neo-bed\scripts\migration-v3-columns.sql", "r") as f:
            sql = f.read()
            
        print("Executing migration...")
        cur.execute(sql)
        conn.commit()
        print("Migration successful!")
        
        cur.close()
        conn.close()
    except Exception as e:
        print(f"Migration failed: {e}")

if __name__ == "__main__":
    run_migration()
