
import psycopg2
import os

DB_URL = 'postgresql://postgres.idfykpdhfmuqkdnfjgqw:E1SqIqRqwhwg20@aws-1-eu-west-1.pooler.supabase.com:6543/postgres'

def show_recent_updates():
    conn = psycopg2.connect(DB_URL)
    cur = conn.cursor()
    # Fetch tools updated in the last hour
    query = """
        SELECT name, tagline, pricing_model, quality_score 
        FROM tools 
        ORDER BY updated_at DESC NULLS LAST
        LIMIT 20
    """
    cur.execute(query)
    rows = cur.fetchall()
    conn.close()
    
    print("---RECENTLY ENRICHED TOOLS---")
    for r in rows:
        name = r[0]
        tagline = r[1] if r[1] else "NULL"
        pricing = r[2] if r[2] else "NULL"
        score = r[3]
        print(f"Name: {name}")
        print(f"  Tagline: {tagline}")
        print(f"  Pricing: {pricing}")
        print(f"  Quality Score: {score}")
        print("-" * 30)

if __name__ == "__main__":
    show_recent_updates()
