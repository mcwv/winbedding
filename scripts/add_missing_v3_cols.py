
import os
import psycopg2
from dotenv import load_dotenv

load_dotenv('.env.local')

DB_URL = os.getenv("DATABASE_URL")
if not DB_URL:
    DB_URL = 'postgresql://postgres.idfykpdhfmuqkdnfjgqw:E1SqIqRqwhwg20@aws-1-eu-west-1.pooler.supabase.com:6543/postgres'

def run_migration():
    conn = psycopg2.connect(DB_URL)
    cur = conn.cursor()
    
    # List of columns to check/add from enrich_v3.py schema
    cols = [
        ("has_free_trial", "BOOLEAN"),
        ("has_trial", "BOOLEAN"),
        ("trial_days", "INTEGER"),
        ("use_cases", "TEXT[]"),
        ("features", "TEXT[]"),
        ("target_audience", "TEXT[]"),
        ("operating_system", "TEXT[]"),
        ("skill_level", "TEXT"),
        ("documentation_quality", "TEXT"),
        ("best_for", "TEXT"),
        ("not_recommended_for", "TEXT"),
        ("transparency_score", "INTEGER"),
        ("experience_score", "NUMERIC"),
        ("ai_data", "JSONB")
    ]
    
    print("--- Adding Missing V3 Columns ---")
    
    for col_name, col_type in cols:
        try:
            cur.execute(f"ALTER TABLE tools ADD COLUMN IF NOT EXISTS {col_name} {col_type}")
            print(f"Added (or checked) {col_name}")
        except Exception as e:
            print(f"Error adding {col_name}: {e}")
            conn.rollback()
        else:
            conn.commit()
            
    conn.close()

if __name__ == "__main__":
    run_migration()
