import csv, sys
csv.field_size_limit(10**7)

total = 0
has_morsels = 0
has_no_morsels = 0

with open('data/tools-5.csv', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    for row in reader:
        total += 1
        morsels = row.get('reddit_morsels')
        if morsels and morsels.strip() and morsels != '[]':
            has_morsels += 1
        else:
            has_no_morsels += 1

print(f"Total rows in CSV: {total}")
print(f"Rows with data: {has_morsels}")
print(f"Rows missing data: {has_no_morsels}")
