import os
import asyncio
import aiohttp
import psycopg2
from psycopg2.extras import RealDictCursor
from dotenv import load_dotenv

load_dotenv('.env.local')

DB_URL = os.getenv("DATABASE_URL") or 'postgresql://postgres.idfykpdhfmuqkdnfjgqw:E1SqIqRqwhwg20@aws-1-eu-west-1.pooler.supabase.com:6543/postgres'

def get_db_connection():
    return psycopg2.connect(DB_URL)

async def check_url(session, url, timeout=5):
    if not url: return "missing"
    try:
        async with session.head(url, timeout=aiohttp.ClientTimeout(total=timeout), allow_redirects=True) as resp:
            if resp.status < 400: return "alive"
            return f"error_{resp.status}"
    except Exception:
        try:
            async with session.get(url, timeout=aiohttp.ClientTimeout(total=timeout), allow_redirects=True) as resp:
                if resp.status < 400: return "alive"
                return f"error_{resp.status}"
        except Exception:
            return "error_exception"

async def main():
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    cur.execute("SELECT id, website_url FROM tools WHERE is_published = true AND enrichment_status = 'pending'")
    tools = cur.fetchall()
    print(f"Checking {len(tools)} tools...")
    
    semaphore = asyncio.Semaphore(50)
    
    async with aiohttp.ClientSession() as session:
        async def process(tool):
            async with semaphore:
                status = await check_url(session, tool['website_url'])
                new_status = 'reachable' if status == 'alive' else 'needs_triage'
                
                with get_db_connection() as t_conn:
                    with t_conn.cursor() as t_cur:
                        t_cur.execute("UPDATE tools SET enrichment_status = %s WHERE id = %s", (new_status, tool['id']))
                    t_conn.commit()

        tasks = [process(t) for t in tools]
        for i in range(0, len(tasks), 100):
            batch = tasks[i:i+100]
            await asyncio.gather(*batch)
            print(f"Processed {min(i+100, len(tasks))}/{len(tasks)} tools...")

if __name__ == "__main__":
    asyncio.run(main())
