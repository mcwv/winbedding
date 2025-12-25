import psycopg2
import json

DB_URL = "postgresql://postgres.idfykpdhfmuqkdnfjgqw:E1SqIqRqwhwg20@aws-1-eu-west-1.pooler.supabase.com:6543/postgres"

def run_fix():
    conn = None
    try:
        conn = psycopg2.connect(DB_URL)
        cur = conn.cursor()
        
        print("1. Adding columns if missing...")
        tables_commands = [
            "ALTER TABLE tools ADD COLUMN IF NOT EXISTS reddit_morsels JSONB;",
            "ALTER TABLE tools ADD COLUMN IF NOT EXISTS related_tools TEXT[];",
            "ALTER TABLE tools ADD COLUMN IF NOT EXISTS adams_description TEXT;" # Ensure it's there
        ]
        
        for cmd in tables_commands:
            try:
                cur.execute(cmd)
                conn.commit()
            except Exception as e:
                print(f"Error adding column: {e}")
                conn.rollback()

        print("2. Fixing View...")
        # Try to detect if categories exists
        categories_exist = False
        try:
            cur.execute("SELECT count(*) FROM categories")
            categories_exist = True
            print("Categories table exists.")
        except:
            print("Categories table MISSING or inaccessible. Using simplified view.")
            conn.rollback()

        view_sql = ""
        if categories_exist:
            view_sql = """
            CREATE OR REPLACE VIEW published_tools AS
            SELECT 
                t.*,
                c.name as category_name,
                c.slug as category_slug,
                c.icon as category_icon
            FROM tools t
            LEFT JOIN categories c ON t.category_id = c.id
            WHERE t.is_published = TRUE
            ORDER BY t.quality_score DESC, t.rating_value DESC;
            """
        else:
             view_sql = """
            CREATE OR REPLACE VIEW published_tools AS
            SELECT 
                t.*,
                t.v2_category as category_name, -- Fallback
                lower(regexp_replace(t.v2_category, ' ', '-', 'g')) as category_slug, -- Fallback
                'box' as category_icon -- Fallback
            FROM tools t
            WHERE t.is_published = TRUE
            ORDER BY t.quality_score DESC, t.rating_value DESC;
            """
        
        try:
            cur.execute(view_sql)
            conn.commit()
            print("View updated.")
        except Exception as e:
             print(f"View update failed: {e}")
             conn.rollback()


        print("3. Seeding HubSpot Data...")
        hubspot_slug = 'hubspot-2ry'
        adams_desc = "HubSpot is the Swiss Army knife of the business world: it has a blade, a corkscrew, a tiny pair of scissors, and a strange hook thing that nobody knows how to use but presumably costs an extra $500 a month. It is aggressively friendly, orange, and determined to organize your entire existence whether you like it or not. Using it feels like being hugged by a well-meaning but over-caffeinated octopus."
        
        morsels = [
             {"quote": "HubSpot is indispensable for scaling, but their pricing model is designed to extract maximum value as you grow.", "author": "MarketingDirector_88", "source": "r/marketing", "sentiment": "positive"},
             {"quote": "The free CRM is a trap. A beautiful, useful trap.", "author": "SaaS_Founder_X", "source": "r/startups", "sentiment": "neutral"},
             {"quote": "Great UX, but the support has gone downhill since they got huge.", "author": "AgencyLife2024", "source": "r/agency", "sentiment": "negative"}
        ]
        
        # Ensure array format for alternatives
        update_sql = """
            UPDATE tools 
            SET 
                adams_description = %s,
                reddit_morsels = %s
            WHERE slug = %s
        """
        
        cur.execute(update_sql, (adams_desc, json.dumps(morsels), hubspot_slug))
        conn.commit()
        print("HubSpot data seeded.")

        cur.close()
        conn.close()
        
    except Exception as e:
        print(f"Critical error: {e}")
        if conn: conn.rollback()

if __name__ == "__main__":
    run_fix()
