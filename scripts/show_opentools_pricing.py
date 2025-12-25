import json

with open('opentools_complete.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

tools_with_pricing = [t for t in data[:200] if t.get('pricing_plans')]

print("Sample pricing from opentools:\n")
for i, tool in enumerate(tools_with_pricing[:5]):
    print(f"{i+1}. {tool['tool_name']}:")
    plans = tool.get('pricing_plans', [])
    for plan in plans[:3]:
        title = plan.get('title', 'Unknown')
        price = plan.get('price', 0)
        freq = plan.get('cost_frequency', 'N/A')
        print(f"   - {title}: ${price} ({freq})")
    print()
