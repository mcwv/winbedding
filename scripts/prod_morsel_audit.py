import psycopg2

# Using the URL from fix_migration_and_seed.py which matches the user's view
DB_URL = "postgresql://postgres.idfykpdhfmuqkdnfjgqw:E1SqIqRqwhwg20@aws-1-eu-west-1.pooler.supabase.com:6543/postgres"

def run_audit():
    try:
        conn = psycopg2.connect(DB_URL)
        cur = conn.cursor()
        
        # Check column existence first
        cur.execute("SELECT column_name FROM information_schema.columns WHERE table_name = 'tools' AND column_name = 'reddit_morsels'")
        if not cur.fetchone():
            print("ERROR: reddit_morsels column still not found even on this DB URL.")
            return

        # Count total
        cur.execute("SELECT COUNT(*) FROM tools")
        total = cur.fetchone()[0]

        # Count missing reddit_morsels
        cur.execute("SELECT COUNT(*) FROM tools WHERE reddit_morsels IS NULL OR reddit_morsels = '[]'::jsonb OR reddit_morsels = '{}'::jsonb")
        missing_morsels = cur.fetchone()[0]

        # Count missing adams_description
        cur.execute("SELECT COUNT(*) FROM tools WHERE adams_description IS NULL OR adams_description = ''")
        missing_adams = cur.fetchone()[0]

        # Count missing v2_category
        cur.execute("SELECT COUNT(*) FROM tools WHERE v2_category IS NULL OR v2_category = ''")
        missing_cat = cur.fetchone()[0]

        # Count missing V3 Quality Fields
        cur.execute("SELECT COUNT(*) FROM tools WHERE tagline IS NULL OR tagline = ''")
        missing_tagline = cur.fetchone()[0]

        cur.execute("SELECT COUNT(*) FROM tools WHERE pricing_model IS NULL OR pricing_model = ''")
        missing_pricing = cur.fetchone()[0]

        cur.execute("SELECT COUNT(*) FROM tools WHERE features IS NULL OR array_length(features, 1) IS NULL")
        missing_features = cur.fetchone()[0]

        cur.execute("SELECT COUNT(*) FROM tools WHERE use_cases IS NULL OR array_length(use_cases, 1) IS NULL")
        missing_use_cases = cur.fetchone()[0]

        print(f"Total tools in database: {total}")
        print("-" * 30)
        print(f"Missing 'reddit_morsels': {missing_morsels}")
        print(f"Missing 'adams_description': {missing_adams}")
        print(f"Missing 'v2_category': {missing_cat}")
        print("-" * 30)
        print(f"Gaps in Quality Fields:")
        print(f"Missing 'tagline': {missing_tagline}")
        print(f"Missing 'pricing_model': {missing_pricing}")
        print(f"Missing 'features' (Array): {missing_features}")
        print(f"Missing 'use_cases' (Array): {missing_use_cases}")

        conn.close()
    except Exception as e:
        print(f"Connection failed: {e}")

if __name__ == "__main__":
    run_audit()
