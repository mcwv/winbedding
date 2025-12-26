
import psycopg2
import os
import sys

# DB Connection
DB_URL = os.environ.get("DB_URL")
if not DB_URL:
    # Fallback to hardcoded if env var missing (matches previous scripts)
    DB_URL = 'postgresql://postgres.idfykpdhfmuqkdnfjgqw:E1SqIqRqwhwg20@aws-1-eu-west-1.pooler.supabase.com:6543/postgres'

def fetch_batch(limit=20):
    conn = psycopg2.connect(DB_URL)
    cur = conn.cursor()
    
    # Fetch tools with missing tagline
    query = """
        SELECT id, name, website_url 
        FROM tools 
        WHERE (tagline IS NULL OR tagline = '') 
        AND website_url IS NOT NULL 
        ORDER BY id ASC 
        LIMIT %s
    """
    cur.execute(query, (limit,))
    rows = cur.fetchall()
    
    conn.close()
    
    print("---CANDIDATES---")
    for r in rows:
        # id|name|url
        print(f"{r[0]}|{r[1]}|{r[2]}")

if __name__ == "__main__":
    # Force utf-8 output handling for windows console
    if sys.stdout.encoding.lower() != 'utf-8':
        try:
            sys.stdout.reconfigure(encoding='utf-8')
        except:
            pass

    limit = 20
    if len(sys.argv) > 1:
        try:
            limit = int(sys.argv[1])
        except:
            pass
    fetch_batch(limit)
