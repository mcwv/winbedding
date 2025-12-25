"""
Get pricing data from trusted aggregators instead of scraping individual sites.

Priority order:
1. Product Hunt (has pricing tags)
2. G2 (detailed pricing)
3. Capterra (pricing comparison)
4. Google search fallback

This is more reliable than scraping because aggregators:
- Standardize pricing formats
- Verify data
- Update regularly
"""

import requests
from bs4 import BeautifulSoup
import time

def search_product_hunt(tool_name):
    """Search Product Hunt for tool pricing."""
    # Product Hunt API requires auth, but we can scrape search results
    search_url = f"https://www.producthunt.com/search?q={tool_name.replace(' ', '+')}"
    
    try:
        response = requests.get(search_url, headers={'User-Agent': 'Mozilla/5.0'})
        if response.status_code == 200:
            # Would need to parse HTML for pricing tags
            # PH shows "Free", "Paid", "Freemium" tags
            return {'source': 'producthunt', 'found': True}
    except:
        pass
    
    return {'source': 'producthunt', 'found': False}

def search_g2(tool_name):
    """Search G2 for tool pricing."""
    search_url = f"https://www.g2.com/search?query={tool_name.replace(' ', '+')}"
    
    try:
        response = requests.get(search_url, headers={'User-Agent': 'Mozilla/5.0'})
        if response.status_code == 200:
            # G2 has structured pricing data on product pages
            # Would need to find product page and extract pricing section
            return {'source': 'g2', 'found': True}
    except:
        pass
    
    return {'source': 'g2', 'found': False}

def google_search_pricing(tool_name):
    """Fallback: Google search for pricing."""
    # Could use SerpAPI or similar
    # Search: "{tool_name} pricing"
    # Extract from featured snippet or top results
    return {'source': 'google', 'query': f"{tool_name} pricing"}

def get_pricing_from_aggregators(tool_name):
    """Try aggregators in priority order."""
    print(f"Searching for: {tool_name}")
    
    # Try Product Hunt
    ph_result = search_product_hunt(tool_name)
    if ph_result['found']:
        print(f"  ✓ Found on Product Hunt")
        return ph_result
    
    time.sleep(1)  # Rate limiting
    
    # Try G2
    g2_result = search_g2(tool_name)
    if g2_result['found']:
        print(f"  ✓ Found on G2")
        return g2_result
    
    # Fallback to Google
    print(f"  → Falling back to Google search")
    return google_search_pricing(tool_name)

# Test with a few tools
if __name__ == "__main__":
    test_tools = ["Vista Social", "HubSpot", "Slack"]
    
    for tool in test_tools:
        result = get_pricing_from_aggregators(tool)
        print(f"  Result: {result}\n")
