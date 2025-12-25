import psycopg2
from dotenv import load_dotenv
import os

load_dotenv('.env.local')
DB_URL = os.getenv("DATABASE_URL")

conn = psycopg2.connect(DB_URL)
cur = conn.cursor()

cur.execute("""
    SELECT 
        name, tagline, description, platforms,
        pros, cons, features, use_cases, 
        best_for, verdict, alternatives
    FROM tools 
    WHERE enrichment_status = 'completed'
    LIMIT 1
""")

row = cur.fetchone()

print("=== LEAN SCHEMA PREVIEW ===\n")
print(f"Name: {row[0]}")
print(f"Tagline: {row[1]}")
print(f"\nDescription:\n{row[2][:300]}...")
print(f"\nPlatforms: {row[3]}")

pros = row[4] or []
cons = row[5] or []
features = row[6] or []
use_cases = row[7] or []

print(f"\nPros ({len(pros)}):")
for p in pros[:3]:
    print(f"  - {p}")

print(f"\nCons ({len(cons)}):")
for c in cons[:3]:
    print(f"  - {c}")

print(f"\nFeatures ({len(features)}):")
for f in features[:3]:
    print(f"  - {f}")

print(f"\nUse Cases ({len(use_cases)}):")
for u in use_cases[:3]:
    print(f"  - {u}")

print(f"\nBest For:\n{row[8]}")
print(f"\nVerdict:\n{row[9]}")
print(f"\nAlternatives: {row[10]}")

conn.close()
