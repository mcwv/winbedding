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
            if resp.status == 404: return "404"
            return f"error_{resp.status}"
    except Exception as e:
        try:
            async with session.get(url, timeout=aiohttp.ClientTimeout(total=timeout), allow_redirects=True) as resp:
                if resp.status < 400: return "alive"
                if resp.status == 404: return "404"
                return f"error_{resp.status}"
        except Exception as e2:
            return "error_exception"

async def main():
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    cur.execute("SELECT id, name, website_url, reddit_morsels, tracking_metadata, quality_score, logo_url FROM tools WHERE is_published = true")
    tools = cur.fetchall()
    
    unreachable = []
    semaphore = asyncio.Semaphore(50)
    
    async with aiohttp.ClientSession() as session:
        async def process(tool):
            async with semaphore:
                status = await check_url(session, tool['website_url'])
                if status != "alive":
                    # Determine if it's one of the "errors" (status >= 400 except 404, or exception)
                    # The audit report showed 172 errors, 7 404s, 7 timeouts.
                    unreachable.append({
                        "id": tool['id'],
                        "name": tool['name'],
                        "url": tool['website_url'],
                        "status": status,
                        "has_morsels": tool['reddit_morsels'] is not None and len(tool['reddit_morsels']) > 0,
                        "has_meta": tool['tracking_metadata'] is not None,
                        "score": tool['quality_score'],
                        "has_logo": tool['logo_url'] is not None
                    })

        await asyncio.gather(*[process(t) for t in tools])
    
    # Sort by quality score descending
    unreachable.sort(key=lambda x: x['score'], reverse=True)
    
    print("| Name | Status | Score | Morsels | Meta | Logo | URL |")
    print("| :--- | :--- | :--- | :--- | :--- | :--- | :--- |")
    for t in unreachable[:200]: # Show up to 200
        m = "Yes" if t['has_morsels'] else "No"
        meta = "Yes" if t['has_meta'] else "No"
        logo = "Yes" if t['has_logo'] else "No"
        print(f"| {t['name']} | {t['status']} | {t['score']} | {m} | {meta} | {logo} | {t['url']} |")

if __name__ == "__main__":
    asyncio.run(main())
