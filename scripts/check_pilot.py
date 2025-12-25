import os
import psycopg2
from psycopg2.extras import RealDictCursor
from dotenv import load_dotenv

load_dotenv('.env.local')
DB_URL = os.getenv("DATABASE_URL") or 'postgresql://postgres.idfykpdhfmuqkdnfjgqw:E1SqIqRqwhwg20@aws-1-eu-west-1.pooler.supabase.com:6543/postgres'

def check_schema_and_data():
    conn = psycopg2.connect(DB_URL)
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    # 1. Get Columns
    cur.execute("SELECT column_name FROM information_schema.columns WHERE table_name = 'tools'")
    columns = [row['column_name'] for row in cur.fetchall()]
    print(f"--- TOOLS TABLE COLUMNS ({len(columns)}) ---")
    print(sorted(columns))
    
    # 2. Check for V3 Data in HubSpot
    print("\n--- CHECKING HUBSPOT DATA ---")
    cur.execute("SELECT * FROM tools WHERE name ILIKE '%HubSpot%' LIMIT 1")
    row = cur.fetchone()
    if row:
        print(f"Found: {row['name']}")
        # Check specific V3 fields if they exist in the dict
        v3_fields = ['platforms', 'api_available', 'learning_curve', 'support_options', 'integrations', 'adams_description']
        for field in v3_fields:
            if field in row:
                print(f"  {field}: {row[field]}")
            else:
                print(f"  {field}: [COLUMN MISSING]")
    else:
        print("HubSpot not found.")

    conn.close()

if __name__ == "__main__":
    check_schema_and_data()
