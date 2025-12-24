"""
Pre-V3 Audit Script
====================
Run this in a background session to prepare for the V3 enrichment pass.

What it checks:
1. Website URL validity (HEAD request)
2. Reddit morsels status (has data, empty, or "no data available")
3. Tracking metadata presence
4. Adams description status
5. Current v2_category assignment

Output: A JSON report + optional DB column update
"""

import os
import json
import asyncio
import aiohttp
import psycopg2
from psycopg2.extras import RealDictCursor
from dotenv import load_dotenv
from datetime import datetime

load_dotenv('.env.local')

DB_URL = os.getenv("DATABASE_URL") or 'postgresql://postgres.idfykpdhfmuqkdnfjgqw:E1SqIqRqwhwg20@aws-1-eu-west-1.pooler.supabase.com:6543/postgres'

def get_db_connection():
    return psycopg2.connect(DB_URL)

def fetch_all_tools():
    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute("""
                SELECT id, name, website_url, reddit_morsels, tracking_metadata, 
                       adams_description, v2_category, quality_score
                FROM tools
                WHERE is_published = true
                ORDER BY quality_score DESC NULLS LAST
            """)
            return cur.fetchall()
    finally:
        conn.close()

async def check_url(session, url, timeout=10):
    """Check if a URL is alive with a HEAD request."""
    if not url:
        return "missing"
    try:
        async with session.head(url, timeout=aiohttp.ClientTimeout(total=timeout), allow_redirects=True) as resp:
            if resp.status < 400:
                return "alive"
            elif resp.status == 404:
                return "404"
            else:
                return f"error_{resp.status}"
    except asyncio.TimeoutError:
        return "timeout"
    except Exception as e:
        return f"error_{type(e).__name__}"

def check_morsels(morsels):
    """Check the status of reddit_morsels field."""
    if morsels is None:
        return "not_crawled"
    if isinstance(morsels, list):
        if len(morsels) == 0:
            return "empty"
        # Check for the "no data" marker
        if len(morsels) == 1 and "NO_HUMAN_SALT_FOUND" in str(morsels[0]):
            return "no_data_found"
        # Has actual snippets
        return "has_data"
    # Fallback for unexpected formats
    return "unknown"

def check_metadata(metadata):
    """Check if tracking_metadata has useful content."""
    if not metadata:
        return "missing"
    if isinstance(metadata, dict):
        if metadata.get("scraped_content") or metadata.get("metadata"):
            return "has_data"
    return "empty"

async def run_audit(limit=None):
    print("=" * 50)
    print("PRE-V3 AUDIT SCRIPT")
    print(f"Started: {datetime.now().isoformat()}")
    print("=" * 50)
    
    tools = fetch_all_tools()
    if limit:
        tools = tools[:limit]
    
    print(f"Auditing {len(tools)} tools...\n")
    
    results = {
        "total": len(tools),
        "url_status": {"alive": 0, "404": 0, "timeout": 0, "missing": 0, "error": 0},
        "morsels_status": {"has_data": 0, "no_data_found": 0, "not_crawled": 0, "empty": 0},
        "metadata_status": {"has_data": 0, "missing": 0, "empty": 0},
        "adams_status": {"has_description": 0, "missing": 0},
        "category_status": {"assigned": 0, "other": 0, "missing": 0},
        "flagged_tools": []
    }
    
async def audit_tool(session, tool, semaphore, results):
    """Process a single tool audit."""
    async with semaphore:
        # URL check
        url_status = await check_url(session, tool['website_url'])
        if url_status == "alive":
            results["url_status"]["alive"] += 1
        elif url_status == "404":
            results["url_status"]["404"] += 1
            results["flagged_tools"].append({"id": tool["id"], "name": tool["name"], "reason": "404", "url": tool["website_url"]})
        elif url_status == "timeout":
            results["url_status"]["timeout"] += 1
        elif url_status == "missing":
            results["url_status"]["missing"] += 1
        else:
            results["url_status"]["error"] += 1
        
        # Morsels check
        morsels_status = check_morsels(tool['reddit_morsels'])
        results["morsels_status"][morsels_status] = results["morsels_status"].get(morsels_status, 0) + 1
        
        # Metadata check
        meta_status = check_metadata(tool['tracking_metadata'])
        results["metadata_status"][meta_status] = results["metadata_status"].get(meta_status, 0) + 1
        
        # Adams check
        if tool['adams_description']:
            results["adams_status"]["has_description"] += 1
        else:
            results["adams_status"]["missing"] += 1
        
        # Category check
        cat = tool['v2_category']
        if not cat:
            results["category_status"]["missing"] += 1
        elif cat == "Other":
            results["category_status"]["other"] += 1
        else:
            results["category_status"]["assigned"] += 1

async def run_audit(limit=None):
    print("=" * 50)
    print("PRE-V3 AUDIT SCRIPT (Optimized)")
    print(f"Started: {datetime.now().isoformat()}")
    print("=" * 50)
    
    tools = fetch_all_tools()
    if limit:
        tools = tools[:limit]
    
    print(f"Auditing {len(tools)} tools...\n")
    
    results = {
        "total": len(tools),
        "url_status": {"alive": 0, "404": 0, "timeout": 0, "missing": 0, "error": 0},
        "morsels_status": {"has_data": 0, "no_data_found": 0, "not_crawled": 0, "empty": 0},
        "metadata_status": {"has_data": 0, "missing": 0, "empty": 0},
        "adams_status": {"has_description": 0, "missing": 0},
        "category_status": {"assigned": 0, "other": 0, "missing": 0},
        "flagged_tools": []
    }
    
    semaphore = asyncio.Semaphore(20)  # Limit concurrency to 20
    async with aiohttp.ClientSession() as session:
        tasks = []
        for tool in tools:
            tasks.append(audit_tool(session, tool, semaphore, results))
        
        # Process in batches to show progress
        batch_size = 100
        for i in range(0, len(tasks), batch_size):
            batch = tasks[i : i + batch_size]
            await asyncio.gather(*batch)
            print(f"  Processed {min(i + batch_size, len(tasks))}/{len(tasks)} tools...")
    
    # Summary
    print("\n" + "=" * 50)
    print("AUDIT COMPLETE")
    print("=" * 50)
    print(f"\nURL Status:")
    for k, v in results["url_status"].items():
        print(f"  {k}: {v}")
    print(f"\nMorsels Status:")
    for k, v in results["morsels_status"].items():
        print(f"  {k}: {v}")
    print(f"\nMetadata Status:")
    for k, v in results["metadata_status"].items():
        print(f"  {k}: {v}")
    print(f"\nAdams Description:")
    for k, v in results["adams_status"].items():
        print(f"  {k}: {v}")
    print(f"\nCategory (v2):")
    for k, v in results["category_status"].items():
        print(f"  {k}: {v}")
    
    if results["flagged_tools"]:
        print(f"\n--- FLAGGED TOOLS ({len(results['flagged_tools'])}) ---")
        for t in results["flagged_tools"][:20]:
            print(f"  [{t['reason']}] {t['name']}: {t['url']}")
        if len(results["flagged_tools"]) > 20:
            print(f"  ... and {len(results['flagged_tools']) - 20} more")
    
    # Save to file
    report_path = "pre_v3_audit_report.json"
    with open(report_path, "w") as f:
        json.dump(results, f, indent=2)
    print(f"\nFull report saved to: {report_path}")
    
    return results

if __name__ == "__main__":
    # Run on all tools
    asyncio.run(run_audit())

