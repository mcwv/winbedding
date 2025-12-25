"""
Scrape pricing pages for tools to get accurate pricing data.

Strategy:
1. For each tool, try common pricing page URLs:
   - {website_url}/pricing
   - {website_url}/plans
   - {website_url}/pricing-plans
   
2. Use Playwright/Crawl4AI to scrape the page
3. Extract structured pricing data
4. Store in a new field: pricing_page_metadata

This gives us:
- Homepage metadata → taglines, features, descriptions
- Pricing page metadata → accurate pricing, trials, tiers
- Social data → pros/cons, user quotes
"""

import asyncio
from playwright.async_api import async_playwright
import psycopg2
from dotenv import load_dotenv
import os
import json
from datetime import datetime

load_dotenv('.env.local')
DB_URL = os.getenv("DATABASE_URL") or 'postgresql://postgres.idfykpdhfmuqkdnfjgqw:E1SqIqRqwhwg20@aws-1-eu-west-1.pooler.supabase.com:6543/postgres'

async def scrape_pricing_page(website_url):
    """Try to scrape pricing page from common URLs."""
    pricing_urls = [
        f"{website_url}/pricing",
        f"{website_url}/plans",
        f"{website_url}/pricing-plans",
        f"{website_url}/buy",
    ]
    
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()
        
        for url in pricing_urls:
            try:
                print(f"  Trying: {url}")
                response = await page.goto(url, wait_until='networkidle', timeout=10000)
                
                if response and response.status == 200:
                    # Extract text content
                    content = await page.content()
                    text = await page.evaluate('() => document.body.innerText')
                    
                    # Look for pricing indicators
                    if any(indicator in text.lower() for indicator in ['$', 'price', 'plan', 'free', 'trial']):
                        print(f"  ✓ Found pricing page: {url}")
                        
                        return {
                            'url': url,
                            'text': text[:10000],  # First 10K chars
                            'scraped_at': datetime.now().isoformat(),
                            'status': 'success'
                        }
            except Exception as e:
                print(f"  ✗ Failed: {url} - {str(e)[:50]}")
                continue
        
        await browser.close()
        return {'status': 'not_found'}

async def main():
    conn = psycopg2.connect(DB_URL)
    cur = conn.cursor()
    
    # Get tools that need pricing scraping
    cur.execute("""
        SELECT id, name, website_url 
        FROM tools 
        WHERE enrichment_status = 'completed'
        LIMIT 5
    """)
    
    tools = cur.fetchall()
    print(f"Scraping pricing pages for {len(tools)} tools...\n")
    
    for tool_id, name, website_url in tools:
        print(f"[{name}]")
        pricing_data = await scrape_pricing_page(website_url)
        
        if pricing_data['status'] == 'success':
            # Store in database (would need to add pricing_page_metadata column)
            print(f"  → Scraped {len(pricing_data['text'])} chars")
        else:
            print(f"  → No pricing page found")
        
        print()
    
    conn.close()

if __name__ == "__main__":
    asyncio.run(main())
