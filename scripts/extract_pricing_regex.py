"""
Hybrid pricing extraction: Regex for pricing, Claude for qualitative data.
"""
import re
from typing import Dict, Optional, List

def extract_pricing_with_regex(text: str) -> Dict:
    """
    Extract pricing information using regex patterns.
    Returns structured pricing data or nulls if not found.
    """
    text_lower = text.lower()
    
    # Pricing model detection
    pricing_model = None
    if any(phrase in text_lower for phrase in ['free forever', 'completely free', '100% free']):
        pricing_model = 'free'
    elif any(phrase in text_lower for phrase in ['open source', 'open-source', 'github']):
        pricing_model = 'open-source'
    elif any(phrase in text_lower for phrase in ['contact us', 'contact sales', 'request a quote', 'get a quote']):
        pricing_model = 'contact'
    elif 'freemium' in text_lower or ('free' in text_lower and any(p in text_lower for p in ['paid', 'premium', 'pro', 'upgrade'])):
        pricing_model = 'freemium'
    
    # Price extraction patterns
    price_patterns = [
        r'\$(\d+(?:\.\d{2})?)\s*(?:/|per)\s*(?:month|mo)',  # $99/month, $99 per month
        r'\$(\d+(?:\.\d{2})?)\s*(?:monthly|a month)',       # $99 monthly
        r'(?:starting at|from|as low as)\s*\$(\d+(?:\.\d{2})?)',  # Starting at $99
        r'\$(\d+(?:\.\d{2})?)\s*(?:/|per)\s*(?:user|seat)',  # $99/user
        r'\$(\d+(?:\.\d{2})?)\s*(?:/|per)\s*(?:year|yr)',   # $99/year
    ]
    
    prices_found = []
    for pattern in price_patterns:
        matches = re.findall(pattern, text_lower)
        if matches:
            prices_found.extend([float(m) for m in matches])
    
    # Get lowest price if any found
    price_amount = min(prices_found) if prices_found else None
    
    # If we found a price but no model, assume paid
    if price_amount and price_amount > 0 and not pricing_model:
        pricing_model = 'paid'
    elif price_amount == 0:
        pricing_model = pricing_model or 'free'
    
    # Trial detection
    trial_patterns = [
        r'(\d+)[\s-]*day(?:s)?\s+(?:free\s+)?trial',
        r'(?:free\s+)?trial\s+(?:for\s+)?(\d+)\s+days?',
        r'try\s+free\s+for\s+(\d+)\s+days?',
    ]
    
    trial_days = None
    for pattern in trial_patterns:
        match = re.search(pattern, text_lower)
        if match:
            trial_days = int(match.group(1))
            break
    
    # Currency detection (default USD)
    currency = 'USD'
    if '€' in text or 'eur' in text_lower:
        currency = 'EUR'
    elif '£' in text or 'gbp' in text_lower:
        currency = 'GBP'
    
    return {
        'pricing_model': pricing_model,
        'price_amount': price_amount,
        'price_currency': currency,
        'trial_days': trial_days,
        'confidence': 'high' if price_amount else 'low'
    }

# Test with sample text
if __name__ == "__main__":
    test_cases = [
        "Starting at $99/month with a 14-day free trial",
        "Freemium model - Free forever, Pro at $19.99/mo",
        "Contact us for enterprise pricing",
        "Open source and free to use",
        "$49 per user per month",
        "Plans from $9.99/month",
    ]
    
    print("=== Pricing Extraction Tests ===\n")
    for text in test_cases:
        result = extract_pricing_with_regex(text)
        print(f"Text: {text}")
        print(f"Result: {result}")
        print()
