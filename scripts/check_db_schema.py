import psycopg2
from psycopg2.extras import RealDictCursor

DB_URL = "postgresql://postgres.idfykpdhfmuqkdnfjgqw:E1SqIqRqwhwg20@aws-1-eu-west-1.pooler.supabase.com:6543/postgres"

def check_schema():
    try:
        conn = psycopg2.connect(DB_URL)
        cur = conn.cursor()
        
        # Check tables
        cur.execute("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'")
        tables = [row[0] for row in cur.fetchall()]
        print(f"Tables found: {tables}")
        
        # Check tools columns
        if 'tools' in tables:
            cur.execute("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'tools'")
            columns = {row[0]: row[1] for row in cur.fetchall()}
            print("\nTools Columns:")
            for col, dtype in columns.items():
                print(f" - {col}: {dtype}")
                
        conn.close()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    check_schema()
