import json

# Check opentools data
with open('opentools_complete.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

print(f"Total tools in opentools: {len(data)}")
print("\nSample tool fields:")
sample = data[0]
for key in sample.keys():
    print(f"  - {key}")

print("\nChecking for pricing-related fields...")
pricing_keys = [k for k in sample.keys() if any(word in k.lower() for word in ['pric', 'cost', 'free', 'paid', 'plan', 'trial'])]
print(f"Found: {pricing_keys}")

# Show sample values
if pricing_keys:
    print("\nSample values:")
    for key in pricing_keys:
        print(f"  {key}: {sample.get(key)}")
